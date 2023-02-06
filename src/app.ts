import * as fs from "fs/promises";
import WebhookListener from "./server";
import UUIDCacheManager from "./util/uuid-cache";
import { CONFIG_FOLDER_PATH, LOG_FOLDER_PATH } from "./util/constants";

async function appInit() {
  await fs.mkdir(CONFIG_FOLDER_PATH, { recursive: true });
  await fs.mkdir(LOG_FOLDER_PATH, { recursive: true });
}

async function main() {
  await appInit();
  await UUIDCacheManager.init();

  const webhookListener = new WebhookListener();
  webhookListener.listen();
}

main();
