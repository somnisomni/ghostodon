import fastify, { FastifyLoggerOptions, FastifyReply, FastifyRequest } from "fastify";
import { FastifyInstance } from "fastify";
import { GhostPost, GhostWebhookPost } from "./interface/ghost";
import { SERVER_LOG_FILE_PATH } from "./constants";
import UUIDCacheManager from "./uuid-cache";
import { createStatus } from "./mastodon/api";
import config from "../config/config.json";

export default class WebhookListener {
  private readonly server: FastifyInstance;

  constructor() {
    const loggerOption: Record<string, boolean | FastifyLoggerOptions> = {
      enabled: {
        level: config.logging.loglevel || "info",
        file: SERVER_LOG_FILE_PATH,
      },
      disabled: false,
    };

    this.server = fastify({
      logger: loggerOption[config.logging.enable ? "enabled" : "disabled"],
    });
    this.setup();
  }

  private setup() {
    const commonWebhookRouteHandler = (request: FastifyRequest, reply: FastifyReply): GhostPost | null => {
      console.info(`${request.method.toUpperCase()} ${request.routerPath}`);

      if(!("post" in (request.body as Record<string, unknown>))) {
        console.warn("  └ No 'post' property in request body; is it valid Webhook request from Ghost?");
        reply.code(500).send("ERROR");
        return null;
      }

      return (request.body as GhostWebhookPost).post.current;
    };

    if(this.server) {
      // Default handler
      this.server.setNotFoundHandler((_, reply) => {
        if(config.bridge.redirectGhostInstanceIfNotFound) {
          reply.redirect(307, `https://${config.ghost.instanceHost}`);
        } else {
          reply.code(404).send("Not found");
        }
      });

      // Ping
      this.server.get("/ping", (_, reply) => {
        reply.code(200).send("ALIVE");
      });

      // Ghost new post published → Mastodon new status
      this.server.post("/post/new", async (request, reply) => {
        const body = commonWebhookRouteHandler(request, reply);
        if(!body) return;
        console.log(`  └ Webhook parsed, "${body.title}" (${body.url})`);

        // Once published, uuid of the post should be stored to prevent recreate status after unpublish-publish
        if(await UUIDCacheManager.hasUUID(body.uuid)) {
          console.log(`  └ UUID ${body.uuid} is already published at least once. Nothing to do.`);
          reply.code(200).send("OK, DUPLICATED");
          return;
        }

        if(!config.bridge.newStatus.onPostPublished) {
          console.log("  └ Creating new status on post publish is disabled. Nothing to do.");
          reply.code(200).send("OK, NOT_SHARED");
          return;
        }

        console.log("  └ Creating new status on Mastodon...");
        const response = await createStatus(`Update! 『${body.title}』\n\n${body.url}`);
        if("error" in response) {
          console.error(`    └ Failed to create a new Mastodon status: ${response.error}`);
        } else {
          console.log(`    └ Status successfully created. (${response.url})`);
        }

        console.log(`  └ Caching UUID ${body.uuid}.`);
        await UUIDCacheManager.cacheUUID(body.uuid);

        console.log();
        reply.code(200).send("OK");
      });

      // Ghost post update → Mastodon new status
      this.server.post("/post/update", (request, reply) => {
        const body = commonWebhookRouteHandler(request, reply);
        if(!body) return;
        console.log(`  └ Webhook parsed, "${body.title}" (${body.url})`);

        console.log();
        reply.code(200).send("OK");
      });
    }
  }

  listen() {
    this.server.listen({ port: config.server.port || 50000 }).then(() => {
      const address = this.server.server.address();

      if(address) {
        if(typeof address === "string") {
          console.info(`Webhook listener is running on ${address}`);
        } else if(typeof address === "object") {
          console.info(`Webhook listener is running on ${address.address}:${address.port}`);
        }
      }
    }).catch((reason) => {
      console.error("Error caused during start up the Webhook listener!");
      console.error(reason);
    });
  }
}
