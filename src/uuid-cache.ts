import * as fs from "fs/promises";
import { UUIDCache } from "./interface/app";
import { POST_UUID_CACHE_FILE_PATH } from "./constants";

export default class UUIDCacheManager {
  private static cacheFileHandle: fs.FileHandle;

  static async init(): Promise<void> {
    // Create cache file if not exist
    try {
      await fs.writeFile(POST_UUID_CACHE_FILE_PATH, "{}", { encoding: "utf8", flag: "wx", mode: 0o644 });
    } catch { /* Nothing */ }

    // Open cache file handle
    try {
      this.cacheFileHandle = await fs.open(POST_UUID_CACHE_FILE_PATH, "r+");
    } catch(error) {
      console.error("Can't create or open UUID cache file!");
      console.error(error);
    }
  }

  static async close(): Promise<void> {
    this.cacheFileHandle.close();
  }

  private static async readUUIDCache(): Promise<UUIDCache> {
    const content: UUIDCache = JSON.parse((await this.cacheFileHandle.readFile()).toString("utf8"));
    return content;
  }

  private static async writeUUIDCache(uuidCache: UUIDCache): Promise<boolean> {
    try {
      await this.cacheFileHandle.writeFile(JSON.stringify(uuidCache), { encoding: "utf8", flag: "w" });
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
