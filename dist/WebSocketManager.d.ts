/// <reference types="node" />
import { EventEmitter } from 'events';
export declare class WebSocketManager extends EventEmitter {
    private logger;
    private ws;
    private url;
    private secure;
    private reconnectAttempts;
    private maxReconnectAttempts;
    private reconnectInterval;
    constructor(url: string, secure?: boolean, maxReconnectAttempts?: number, reconnectInterval?: number);
    private connect;
    private getSecureUrl;
    private setHooks;
    private handleReconnection;
    send(message: string): void;
    close(): void;
    reconnect(): void;
}
