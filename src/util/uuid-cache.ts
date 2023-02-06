import * as fs from "fs/promises";
import { UUIDCache } from "../interface/app";
import { POST_UUID_CACHE_FILE_PATH } from "./constants";

export default class UUIDCacheManager {
  static async init(): Promise<void> {
    // Create cache file if not exist
    try {
      await fs.writeFile(POST_UUID_CACHE_FILE_PATH, "{}", { encoding: "utf8", flag: "wx", mode: 0o644 });
    } catch { /* Nothing */ }
  }

  private static async readUUIDCache(): Promise<UUIDCache> {
    const content: UUIDCache = JSON.parse(await fs.readFile(POST_UUID_CACHE_FILE_PATH, { encoding: "utf8" }));
    return content;
  }

  private static async writeUUIDCache(uuidCache: UUIDCache): Promise<boolean> {
    try {
      await fs.writeFile(POST_UUID_CACHE_FILE_PATH, JSON.stringify(uuidCache), { encoding: "utf8" });
      return true;
    } catch {
      return false;
    }
  }

  static async hasUUID(uuid: string): Promise<boolean> {
    const content = await this.readUUIDCache();
    return uuid in content && content[uuid] === true;
  }

  static async cacheUUID(uuid: string): Promise<boolean> {
    const content = await this.readUUIDCache();
    content[uuid] = true;
    return await this.writeUUIDCache(content);
  }
}
