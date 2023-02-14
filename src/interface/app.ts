import pino from "pino";

export interface UUIDCache {
  [key: string]: boolean;
}

export interface AppConfig {
  server: {
    localhostOnly: boolean,
    port: number,
  },
  logging: {
    enable: boolean,
    loglevel: pino.LevelWithSilent,
  },
  ghost: {
    instanceHost: string,
    restrictSenderHost: boolean,
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
    } & Record<string, string | boolean>,
  },
}
