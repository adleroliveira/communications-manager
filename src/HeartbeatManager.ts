import { RequestManager } from "./RequestManager";
import { Logger, LogLevel } from './Logger';

export class HeartbeatManager {
    private logger: Logger;
    private heartbeatTimer: NodeJS.Timeout | null = null;

    constructor(
        private requestManager: RequestManager,
        private heartbeatInterval: number = 30000,
        private websocketServiceAddress: string = "websockets"
    ) {
        this.logger = new Logger(LogLevel.INFO);
    }

    public startHeartbeat() {
        this.stopHeartbeat();
        this.heartbeatTimer = setInterval(() => {
            this.requestManager.request("heartbeat", new Date().toISOString(), this.websocketServiceAddress)
                .catch(error => this.logger.error('Heartbeat failed:', error));
        }, this.heartbeatInterval);
    }

    public stopHeartbeat() {
        if (this.heartbeatTimer) {
            clearInterval(this.heartbeatTimer);
            this.heartbeatTimer = null;
        }
    }
}