/* eslint-disable @typescript-eslint/no-explicit-any */
import pino from "pino";
import pinoPretty from "pino-pretty";
import Config from "./config-loader";
import { ACTIVITY_LOG_FILE_PATH } from "./constants";

export default class Logger {
  private static pinoInstance: pino.Logger;

  static init() {
    this.pinoInstance = pino({
      name: "ghostodon",
      enabled: Config.config.logging.enable,
    }, pinoPretty({
      colorize: false,
      destination: ACTIVITY_LOG_FILE_PATH,
    }));
  }

  static i(obj: any, consoleOutput = true) {
    if(consoleOutput) console.info(obj);
    this.pinoInstance.info(obj);
  }

  static e(obj: any, consoleOutput = true) {
    if(consoleOutput) console.error(obj);
    this.pinoInstance.error(obj);
  }

  static w(obj: any, consoleOutput = true) {
    if(consoleOutput) console.warn(obj);
    this.pinoInstance.warn(obj);
  }

  static d(obj: any, consoleOutput = true) {
    if(consoleOutput) console.debug(obj);
    this.pinoInstance.debug(obj);
  }

  static nl() {
    console.log();
  }
}
