import { IResponseData } from "./interfaces";
export interface ICommunicationsManagerConfig {
    url: string;
    secure?: boolean;
    authToken?: string;
    maxReconnectAttempts?: number;
    reconnectInterval?: number;
    heartbeatInterval?: number;
    requestTimeout?: number;
}
export declare class CommunicationsManager {
    private logger;
    private webSocketManager;
    private authManager;
    private requestManager;
    private subscriptionManager;
    private heartbeatManager;
    constructor(config: ICommunicationsManagerConfig);
    private validateConfig;
    private setupWebSocketHooks;
    private handleOpen;
    private handleClose;
    private handleError;
    private handleMaxReconnectAttemptsReached;
    request<I, O>(requestType: string, body: I, to?: string): Promise<IResponseData<O>>;
    subscribe(channel: string): Promise<void>;
    setAuthToken(token: string): void;
    close(): void;
    reconnect(): void;
    onOpen(callback: () => void): void;
    onClose(callback: (event: CloseEvent) => void): void;
    onError(callback: (error: Event) => void): void;
    onMessage(callback: (data: string) => void): void;
    onRequest<T>(requestType: string, callback: (body: T, respond: (responseBody: any) => void) => void): void;
}
