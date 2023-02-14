import * as fs from "fs/promises";
import { UUIDCache } from "../interface/app";
import { POST_UUID_CACHE_FILE_PATH } from "./constants";
import Logger from "./logger";

export default class UUIDCacheManager {
  static async init(): Promise<void> {
    // Create cache file if not exist
    try {
      await fs.writeFile(POST_UUID_CACHE_FILE_PATH, "{}", { encoding: "utf8", flag: "wx", mode: 0o644 });
      Logger.i("UUID cache file created.");
    } catch(error: any) {  // eslint-disable-line @typescript-eslint/no-explicit-any
      if(error && error.code) {
        if(error.code === "EEXIST") {
          Logger.i("Using existing UUID cache file.");
        } else {
          Logger.e("Unexpected error while initializing UUID cache file!");
          Logger.e(error);
        }
      }
    }
  }

  private static async readUUIDCache(): Promise<UUIDCache | null> {
    try {
      const content: UUIDCache = JSON.parse(await fs.readFile(POST_UUID_CACHE_FILE_PATH, { encoding: "utf8" }));
      return content;
    } catch(error: any) {  // eslint-disable-line @typescript-eslint/no-explicit-any
      Logger.e("Error while parsing UUID cache file!");
      Logger.e(error);
      return null;
    }
  }

  private static async writeUUIDCache(uuidCache: UUIDCache): Promise<boolean> {
    try {
      await fs.writeFile(POST_UUID_CACHE_FILE_PATH, JSON.stringify(uuidCache), { encoding: "utf8" });
      return true;
    } catch(error: any) {  // eslint-disable-line @typescript-eslint/no-explicit-any
      Logger.e("Error while writing UUID cache file!");
      Logger.e(error);
      return false;
    }
  }

  static async hasUUID(uuid: string): Promise<boolean> {
    const content = await this.readUUIDCache();
    if(content) {
      return uuid in content && content[uuid] === true;
    } else {
      return false;
    }
  }

  static async cacheUUID(uuid: string): Promise<boolean> {
    const content = await this.readUUIDCache();
    if(content) {
      content[uuid] = true;
      return await this.writeUUIDCache(content);
    } else {
      return false;
    }
  }
}
