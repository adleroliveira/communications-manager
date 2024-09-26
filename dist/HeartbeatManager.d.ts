import { RequestManager } from "./RequestManager";
export declare class HeartbeatManager {
    private requestManager;
    private heartbeatInterval;
    private websocketServiceAddress;
    private logger;
    private heartbeatTimer;
    constructor(requestManager: RequestManager, heartbeatInterval?: number, websocketServiceAddress?: string);
    startHeartbeat(): void;
    stopHeartbeat(): void;
}
