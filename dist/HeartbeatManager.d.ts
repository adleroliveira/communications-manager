import { RequestManager } from "./RequestManager";
export declare class HeartbeatManager {
    private requestManager;
    private heartbeatInterval;
    private websocketServiceAddress;
    private logger;
    private heartbeatTimer;
    constructor(requestManager: RequestManager, heartbeatInterval?: number, // default 30 seconds
    websocketServiceAddress?: string);
    startHeartbeat(): void;
    stopHeartbeat(): void;
}
