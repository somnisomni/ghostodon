import * as fs from "fs/promises";
import * as path from "path";
import WebhookListener from "./server";
import UUIDCacheManager from "./util/uuid-cache";
import { CONFIG_FOLDER_PATH, LOG_FOLDER_PATH, CONFIG_FILE_PATH } from "./util/constants";
import Config from "./util/config-loader";
import Logger from "./util/logger";
import appPackage from "../package.json";

async function appInit() {
  // Create missing folders if not exist
  await fs.mkdir(CONFIG_FOLDER_PATH, { recursive: true });
  await fs.mkdir(LOG_FOLDER_PATH, { recursive: true });

  // Check if config.json exists, if not, copy from example
  try {
    await fs.access(CONFIG_FILE_PATH);
  } catch {
    const exampleConfigPath = path.resolve(CONFIG_FOLDER_PATH, "config.example.json");
    try {
      await fs.access(exampleConfigPath);
      await fs.copyFile(exampleConfigPath, CONFIG_FILE_PATH);
      console.log("Configuration file not found. Created from example.");
    } catch {
      // If example also doesn't exist (shouldn't happen in docker), config-loader will handle error
    }
  }

  // Load configurations
  if(!await Config.load()) process.exit(1);

  // Initialize app activity logger
  Logger.init();
  Logger.i("", false);
  Logger.i("");
  Logger.i(`  ◆ Ghostodon v${appPackage.version}`);
  Logger.i("");
}

async function main() {
  await appInit();
  await UUIDCacheManager.init();

  const webhookListener = new WebhookListener();
  webhookListener.listen();
}

main();
