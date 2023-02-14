import fastify, { FastifyLoggerOptions, FastifyReply, FastifyRequest } from "fastify";
import { FastifyInstance } from "fastify";
import pinoPretty from "pino-pretty";
import { GhostPost, GhostWebhookPost } from "./interface/ghost";
import { ACCESS_LOG_FILE_PATH } from "./util/constants";
import UUIDCacheManager from "./util/uuid-cache";
import Config from "./util/config-loader";
import { createStatus } from "./mastodon/api";
import Logger from "./util/logger";

export default class WebhookListener {
  private readonly server: FastifyInstance;

  constructor() {
    const loggerOption: Record<string, boolean | FastifyLoggerOptions> = {
      enabled: {
        stream: pinoPretty({
          colorize: false,
          destination: ACCESS_LOG_FILE_PATH,
        }),
        level: Config.config.logging.loglevel,
      },
      disabled: false,
    };

    this.server = fastify({
      logger: loggerOption[Config.config.logging.enable ? "enabled" : "disabled"],
    });
    this.setup();
  }

  private setup() {
    const commonWebhookRouteHandler = (request: FastifyRequest, reply: FastifyReply): GhostPost | null => {
      Logger.i(`${request.method.toUpperCase()} ${request.routerPath}`);

      if(!("post" in (request.body as Record<string, unknown>))) {
        console.warn("  └ No 'post' property in request body; is it valid Webhook request from Ghost?");
        reply.code(500).send("ERROR, NOT A VALID WEBHOOK REQUEST");
        return null;
      }

      return (request.body as GhostWebhookPost).post.current;
    };

    if(this.server) {
      // Default handler
      this.server.setNotFoundHandler((_, reply) => {
        if(Config.config.bridge.redirectGhostInstanceIfNotFound) {
          reply.redirect(301, `https://${Config.config.ghost.instanceHost}`);
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
        Logger.i(`  └ Webhook parsed, "${body.title}" (${body.url})`);

        // Once published, uuid of the post should be stored to prevent recreate status after unpublish-publish
        if(await UUIDCacheManager.hasUUID(body.uuid)) {
          Logger.i(`  └ UUID ${body.uuid} is already published at least once. Nothing to do.`);
          reply.code(200).send("OK, DUPLICATED");
          return;
        }

        if(!Config.config.bridge.status.postPublished) {
          Logger.i("  └ Creating new status on post publish is disabled. Nothing to do.");
          reply.code(200).send("OK, SHARING SKIPPED");
          return;
        } else {
          if(typeof Config.config.bridge.status.postPublished === "string") {
            Logger.i("  └ Creating new status on Mastodon...");
            const response = await createStatus(this.formatStatusText(Config.config.bridge.status.postPublished, body));
            if("error" in response) {
              Logger.e(`    └ Failed to create a new Mastodon status: ${response.error}`);
              reply.code(500).send("ERROR, FAILED TO SHARE");
              return;
            } else {
              Logger.i(`    └ Status successfully created. (${response.url})`);
            }
          }
        }

        Logger.i(`  └ Caching UUID ${body.uuid}...`);
        await UUIDCacheManager.cacheUUID(body.uuid);
        Logger.i("  └ UUID cached.");

        Logger.nl();
        reply.code(200).send("OK");
      });

      // Ghost post update → Mastodon new status
      this.server.post("/post/update", (request, reply) => {
        const body = commonWebhookRouteHandler(request, reply);
        if(!body) return;
        Logger.i(`  └ Webhook parsed, "${body.title}" (${body.url})`);

        Logger.nl();
        reply.code(200).send("OK");
      });
    }
  }

  private formatStatusText(text: string, ghostPost: GhostPost): string {
    return text
      .replaceAll("{title}", ghostPost.title)
      .replaceAll("{url}", ghostPost.url)
      .replaceAll("{post_id}", ghostPost.id)
      .replaceAll("{slug}", ghostPost.slug)
      .replaceAll("{text}", ghostPost.plaintext)
      .replaceAll("{excerpt}", ghostPost.excerpt)
      .replaceAll("{excerpt_custom}", ghostPost.custom_excerpt || "")
      .replaceAll("{reading_time}", ghostPost.reading_time.toString())
      .replaceAll("{primary_tag}", ghostPost.primary_tag || "");
  }

  listen() {
    this.server.log.info("===== Webhook listener server startup =====");
    this.server.listen({
      host: Config.config.server.localhostOnly ? "127.0.0.1" : "0.0.0.0",
      port: Config.config.server.port || 50000,
    }).then(() => {
      const address = this.server.server.address();

      if(address) {
        if(typeof address === "string") {
          Logger.i(`Webhook listener is running on ${address}`);
        } else if(typeof address === "object") {
          Logger.i(`Webhook listener is running on ${address.address}:${address.port}`);
        }
      }
    }).catch((reason) => {
      Logger.e("Error caused while starting up the Webhook listener!");
      Logger.e(reason);
    });
  }
}
