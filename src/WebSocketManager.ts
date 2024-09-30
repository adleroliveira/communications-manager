import { EventEmitter } from "events";
import { Logger, LogLevel } from "./Logger";

export class WebSocketManager extends EventEmitter {
  private logger: Logger;
  private ws!: WebSocket;
  private url: string;
  private secure: boolean;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number;
  private reconnectInterval: number;

  constructor(
    url: string,
    secure: boolean = false,
    maxReconnectAttempts: number = 5,
    reconnectInterval: number = 5000
  ) {
    super();
    this.logger = new Logger(LogLevel.INFO);
    this.url = url;
    this.secure = secure;
    this.maxReconnectAttempts = maxReconnectAttempts;
    this.reconnectInterval = reconnectInterval;
    this.connect();
  }

  private connect() {
    const secureUrl = this.getSecureUrl(this.url, this.secure);
    this.logger.info(`Attempting to connect to ${secureUrl}`);
    this.ws = new WebSocket(secureUrl);
    this.setHooks();
  }

  private getSecureUrl(url: string, secure: boolean): string {
    return secure ? url.replace(/^ws:/, "wss:") : url;
  }

  private setHooks() {
    this.ws.onopen = () => {
      this.logger.info(`WebSocket opened. ReadyState: ${this.ws.readyState}`);
      this.emit("open");
    };
    this.ws.onclose = (event) => {
      this.logger.info(
        `WebSocket closed. ReadyState: ${this.ws.readyState}. Code: ${event.code}, Reason: ${event.reason}`
      );
      this.emit("close", event);
      this.handleReconnection();
    };
    this.ws.onerror = (error) => {
      this.logger.error("WebSocket error:", error);
      this.emit("error", error);
    };
    this.ws.onmessage = (event) => this.emit("message", event.data);
  }

  private handleReconnection() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const minDelay = 1000;
      const delay = Math.max(
        minDelay,
        this.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1)
      );
      this.logger.info(
        `Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delay}ms...`
      );
      setTimeout(() => this.connect(), delay);
    } else {
      this.logger.error(
        "Max reconnection attempts reached. Please reconnect manually."
      );
      this.emit("maxReconnectAttemptsReached");
    }
  }

  public send(message: string) {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(message);
    } else {
      const error = new Error("WebSocket is not open");
      this.emit("error", error);
    }
  }

  public close() {
    this.ws.close();
  }

  public reconnect() {
    this.logger.debug("Manual reconnection initiated.");
    this.reconnectAttempts = 0;
    this.close();
    this.connect();
  }
}
