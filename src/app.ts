import WebhookListener from "./server";
import UUIDCacheManager from "./uuid-cache";

UUIDCacheManager.init();

const webhookListener = new WebhookListener();
webhookListener.listen();
