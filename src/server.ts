import fastify, { FastifyLoggerOptions } from "fastify";
import { FastifyInstance } from "fastify";
import { GhostWebhookPost } from "interface/ghost";
import path from "path";
import config from "../config/config.json";

export default class WebhookListener {
  private readonly server: FastifyInstance;

  constructor() {
    const loggerOption: Record<string, boolean | FastifyLoggerOptions> = {
      enabled: {
        level: config.logging.loglevel || "info",
        file: path.resolve(__dirname, "..", "config", "server.log"),
      },
      disabled: false,
    };

    this.server = fastify({
      logger: loggerOption[config.logging.enable ? "enabled" : "disabled"],
    });
    this.setup();
  }

  private setup() {
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
        reply.send("ALIVE");
      });

      // Ghost new post created → Mastodon new status
      this.server.post("/post/new", (request, reply) => {
        // new
        const body = (request.body as GhostWebhookPost).post.current;
        console.log(`CREATED: ${body.title} (${body.url})`);

        reply.code(200).send("OK");
      });

      // Ghost post update → Mastodon new status
      this.server.post("/post/update", (request, reply) => {
        // update
        const body = (request.body as GhostWebhookPost).post.current;
        console.log(`UPDATED: ${body.title} (${body.url})`);

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
