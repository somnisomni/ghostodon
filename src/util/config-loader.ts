import * as fs from "fs/promises";
import { AppConfig } from "../interface/app";
import { CONFIG_FILE_PATH } from "./constants";

export default class Config {
  static config: AppConfig;
  private static defaultConfigMap: AppConfig = {
    server: {
      port: 50000,
    },
    logging: {
      enable: true,
      loglevel: "info",
    },
    ghost: {
      instanceHost: "nonexistance.url",
      restrictSenderHost: true,
    },
    mastodon: {
      instanceHost: "nonexistance.url",
      accessToken: "0000000000000000000-00000000000000000000000",
    },
    bridge: {
      redirectGhostInstanceIfNotFound: true,
      preventDuplicatedPublishStatus: true,
      status: {
        postPublished: "A new post published! 『{title}』\n\n{url}",
        postUpdated: "Post updated! 『{title}』\n\n{url}",
      },
    },
  };

  static async load(): Promise<boolean> {
    let raw = "";
    try {
      raw = await fs.readFile(CONFIG_FILE_PATH, { encoding: "utf8" });
    } catch(error) {
      console.error("Error while reading configuration file; is it exist and accessible?");
      console.error(error);
      return false;
    }

    let parsed: AppConfig | null = null;
    try {
      parsed = JSON.parse(raw) as AppConfig;
    } catch(error) {
      console.error("Error while parsing configration file; is it in valid JSON format?");
      console.error(error);
      return false;
    }

    if(parsed) {
      // Check for crucial configurations
      if(!parsed.ghost
        || !parsed.mastodon
        || !parsed.ghost.instanceHost
        || !parsed.mastodon.instanceHost
        || !parsed.mastodon.accessToken) {
        console.error("Some important configurations are missing.");
        return false;
      }
    } else {
      console.error("Something wrong while loading configurations.");
      return false;
    }

    this.config = { ...this.defaultConfigMap, ...parsed };
    ["postPublished", "postUpdated"].forEach((v) => {
      if(this.config.bridge.status[v] === true) {
        this.config.bridge.status[v] = this.defaultConfigMap.bridge.status[v];
      }
    });

    return true;
  }
}
