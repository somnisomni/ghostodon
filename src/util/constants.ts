import path from "path";

// In dev, __dirname is src/util. In prod, it's build/util.
// We want to reach the root project directory regardless.
export const CONFIG_FOLDER_PATH = path.resolve(process.cwd(), "config");

export const CONFIG_FILE_PATH = path.resolve(CONFIG_FOLDER_PATH, "config.json");
export const POST_UUID_CACHE_FILE_PATH = path.resolve(CONFIG_FOLDER_PATH, ".post-cache.json");

export const LOG_FOLDER_PATH = path.resolve(CONFIG_FOLDER_PATH, "logs");
export const ACCESS_LOG_FILE_PATH = path.resolve(LOG_FOLDER_PATH, "access.log");
export const ACTIVITY_LOG_FILE_PATH = path.resolve(LOG_FOLDER_PATH, "activity.log");
