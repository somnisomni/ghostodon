import { MastodonAPIError, MastodonAPIResponseStatus } from "../interface/mastodon";
import Config from "../util/config-loader";

export async function createStatus(status: string, visibility: "public" | "unlisted" | "private" | "direct" = "public"): Promise<MastodonAPIResponseStatus | MastodonAPIError> {
  const response = await fetch(`https://${Config.config.mastodon.instanceHost}/api/v1/statuses`, {
    method: "POST",
    cache: "no-cache",
    headers: {
      "Authorization": `Bearer ${Config.config.mastodon.accessToken}`,
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    },
    body: new URLSearchParams({
      status,
      visibility,
    }),
  });

  if(response.ok) {
    return (await response.json()) as MastodonAPIResponseStatus;
  } else {
    return (await response.json()) as MastodonAPIError;
  }
}
