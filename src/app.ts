import * as fs from "fs/promises";
import WebhookListener from "./server";
import UUIDCacheManager from "./util/uuid-cache";
import { CONFIG_FOLDER_PATH, LOG_FOLDER_PATH } from "./util/constants";
import Config from "./util/config-loader";
import appPackage from "../package.json";

async function appInit() {
  // Create missing folders if not exist
  await fs.mkdir(CONFIG_FOLDER_PATH, { recursive: true });
  await fs.mkdir(LOG_FOLDER_PATH, { recursive: true });

  // Load configurations
  if(!await Config.load()) process.exit(1);
}

async function main() {
  console.info(`\n  ◆ Ghostodon v${appPackage.version}\n`);

  await appInit();
  await UUIDCacheManager.init();

  const webhookListener = new WebhookListener();
  webhookListener.listen();
}

main();
