export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

export class Logger {
  private level: LogLevel;

  constructor(level: LogLevel = LogLevel.INFO) {
    this.level = level;
  }

  error(message: string, ...args: any[]): void {
    if (this.level >= LogLevel.ERROR) {
      console.error(`[ERROR] ${message}`, ...args);
    }
  }

  warn(message: string, ...args: any[]): void {
    if (this.level >= LogLevel.WARN) {
      console.warn(`[WARN] ${message}`, ...args);
    }
  }

  info(message: string, ...args: any[]): void {
    if (this.level >= LogLevel.INFO) {
      console.info(`[INFO] ${message}`, ...args);
    }
  }

  debug(message: string, ...args: any[]): void {
    if (this.level >= LogLevel.DEBUG) {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  }

  setLevel(level: LogLevel): void {
    this.level = level;
  }
}
