import { LevelWithSilent } from "pino";

export interface UUIDCache {
  [key: string]: boolean;
}

export interface AppConfig {
  server: {
    port: number,
  },
  logging: {
    enable: boolean,
    loglevel: LevelWithSilent,
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
    status: Record<string, string | boolean> & {
      postPublished: string | boolean,
      postUpdated: string | boolean,
    },
  },
}
