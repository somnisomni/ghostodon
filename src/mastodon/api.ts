import config from "../../config/config.json";

export async function createStatus(status: string, visibility: "public" | "unlisted" | "private" | "direct" = "public"): Promise<Record<string, unknown>> {
  const response = await fetch(`https://${config.mastodon.instanceHost}/api/v1/statuses`, {
    method: "POST",
    cache: "no-cache",
    headers: {
      "Authorization": `Bearer ${config.mastodon.accessToken}`,
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    },
    body: new URLSearchParams({
      status,
      visibility,
    }),
  });

  return (await response.json()) as Record<string, unknown>;
}
