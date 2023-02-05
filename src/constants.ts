import path from "path";

export const CONFIG_FOLDER_PATH = path.resolve(__dirname, "..", "config");
export const CONFIG_FILE_PATH = path.resolve(CONFIG_FOLDER_PATH, "config.json");
export const POST_UUID_CACHE_FILE_PATH = path.resolve(CONFIG_FOLDER_PATH, ".post-cache.json");
export const SERVER_LOG_FILE_PATH = path.resolve(CONFIG_FOLDER_PATH, "server.log");
