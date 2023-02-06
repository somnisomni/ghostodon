import WebhookListener from "./server";
import UUIDCacheManager from "./util/uuid-cache";

UUIDCacheManager.init();

const webhookListener = new WebhookListener();
webhookListener.listen();
