/* eslint-disable @typescript-eslint/no-explicit-any */
import pino from "pino";
import pinoPretty from "pino-pretty";
import { ACTIVITY_LOG_FILE_PATH } from "./constants";

export default class Logger {
  private static pinoFile = pino({
    name: "ghostodon",
  }, pinoPretty({
    colorize: false,
    destination: ACTIVITY_LOG_FILE_PATH,
  }));

  static i(obj: any) {
    console.info(obj);
    this.pinoFile.info(obj);
  }

  static e(obj: any) {
    console.error(obj);
    this.pinoFile.error(obj);
  }

  static w(obj: any) {
    console.warn(obj);
    this.pinoFile.warn(obj);
  }

  static d(obj: any) {
    console.debug(obj);
    this.pinoFile.debug(obj);
  }

  static nl() {
    console.log();
  }
}
