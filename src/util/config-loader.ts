import * as fs from "fs/promises";
import { AppConfig } from "../interface/app";
import { CONFIG_FILE_PATH } from "./constants";
import Logger from "./logger";

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
      Logger.e("Error while reading configuration file; is it exist and accessible?");
      Logger.e(error);
      return false;
    }

    let parsed: AppConfig | null = null;
    try {
      parsed = JSON.parse(raw) as AppConfig;
    } catch(error) {
      Logger.e("Error while parsing configration file; is it in valid JSON format?");
      Logger.e(error);
      return false;
    }

    if(parsed) {
      // Check for crucial configurations
      if(!parsed.ghost
        || !parsed.mastodon
        || !parsed.ghost.instanceHost
        || !parsed.mastodon.instanceHost
        || !parsed.mastodon.accessToken) {
        Logger.e("Some important configurations are missing.");
        return false;
      }
    } else {
      Logger.e("Something wrong while loading configurations.");
      return false;
    }

    this.config = { ...this.defaultConfigMap, ...parsed };
    ["postPublished", "postUpdated"].forEach((v) => {
      if(this.config.bridge.status[v] === true) {
        this.config.bridge.status[v] = this.defaultConfigMap.bridge.status[v];
      }
    });

    Logger.i("Configuration loaded.");
    return true;
  }
}
