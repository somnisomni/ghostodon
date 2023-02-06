export interface UUIDCache {
  [key: string]: boolean;
}

export interface AppConfig {
  server: {
    port: number,
  },
  logging: {
    enable: boolean,
    loglevel: "fatal" | "error" | "warn" | "info" | "debug" | "trace" | "silent",
  },
  ghost: {
    instanceHost: string,
  },
  mastodon: {
    instanceHost: string,
    accessToken: string,
  },
  bridge: {
    redirectGhostInstanceIfNotFound: boolean,
    preventDuplicatedPublishStatus: boolean,
    status: {
      postPublished: string | boolean,
      postUpdated: string | boolean,
    },
  },
}
