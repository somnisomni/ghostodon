import config from "../../config/config.json";

export async function createStatus(status: string, visibility: "public" | "unlisted" | "private" | "direct" = "public"): Promise<Record<string, unknown>> {
  const formData = new FormData();
  formData.set("status", status);
  formData.set("visibility", visibility);

  const response = await fetch(`https://${config.mastodon.instanceHost}/api/v1/statuses`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${config.mastodon.accessToken}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formData,
  });

  return (await response.json()) as Record<string, unknown>;
}
