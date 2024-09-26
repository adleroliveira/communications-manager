import { WebSocketManager } from "./WebSocketManager"
import { AuthenticationManager } from "./AuthenticationManager"
import { RequestManager } from "./RequestManager"
import { SubscriptionManager } from "./SubscriptionManager"
import { HeartbeatManager } from "./HeartbeatManager"
import { IResponseData } from "./interfaces"
import { Logger, LogLevel } from './Logger';

export interface ICommunicationsManagerConfig {
    url: string;
    secure?: boolean;
    authToken?: string;
    maxReconnectAttempts?: number;
    reconnectInterval?: number;
    heartbeatInterval?: number;
    requestTimeout?: number;
}

export class CommunicationsManager {
    private logger: Logger;
    private webSocketManager: WebSocketManager;
    private authManager: AuthenticationManager;
    private requestManager: RequestManager;
    private subscriptionManager: SubscriptionManager;
    private heartbeatManager: HeartbeatManager;

    constructor(config: ICommunicationsManagerConfig) {
        this.logger = new Logger(LogLevel.INFO);
        this.validateConfig(config);

        try {
            this.webSocketManager = new WebSocketManager(
                config.url, 
                config.secure, 
                config.maxReconnectAttempts, 
                config.reconnectInterval
            );
            this.requestManager = new RequestManager({ webSocketManager: this.webSocketManager, requestTimeout: config.requestTimeout});
            this.authManager = new AuthenticationManager(this.requestManager);
            this.subscriptionManager = new SubscriptionManager(this.requestManager);
            this.heartbeatManager = new HeartbeatManager(this.requestManager, config.heartbeatInterval);
    
            if (config.authToken) {
                this.authManager.setAuthToken(config.authToken);
            }
    
            this.setupWebSocketHooks();
        } catch (error) {
            this.logger.error('Error initializing CommunicationsManager', { error });
            throw new Error('Failed to initialize CommunicationsManager');
        }
    }

    private validateConfig(config: ICommunicationsManagerConfig): void {
        if (!config.url) {
            throw new Error('URL is required in the configuration');
        }
    }

    private setupWebSocketHooks() {
        this.webSocketManager.on('open', this.handleOpen.bind(this));
        this.webSocketManager.on('close', this.handleClose.bind(this));
        this.webSocketManager.on('error', this.handleError.bind(this));
        this.webSocketManager.on('maxReconnectAttemptsReached', this.handleMaxReconnectAttemptsReached.bind(this));
    }

    private async handleOpen() {
        this.logger.info("WebSocket connection established");
        try {
            if (await this.authManager.authenticate()) {
                this.requestManager.setAuthToken(this.authManager.getAuthToken()!);
                this.heartbeatManager.startHeartbeat();
                this.logger.info("WebSocket connection established");
            } else {
                this.logger.warn("Authentication failed");
            }
        } catch (error) {
            this.logger.error("Error during authentication", { error });
        }
    }

    private handleClose(event: CloseEvent) {
        this.logger.info('WebSocket connection closed', { event });
        this.heartbeatManager.stopHeartbeat();
        this.subscriptionManager.unsubscribeAll();
    }

    private handleError(error: Event) {
        this.logger.error('WebSocket error:', { error });
        this.subscriptionManager.unsubscribeAll();
    }

    private handleMaxReconnectAttemptsReached() {
        this.logger.error('Maximum reconnection attempts reached. Use reconnect() method to try again.');
    }

    public async request<I, O>(requestType: string, body: I, to?: string): Promise<IResponseData<O>> {
        try {
            return this.requestManager.request(requestType, body, to);
        } catch (error) {
            this.logger.error('Error making request', { requestType, error });
            throw error;
        }
    }

    public async subscribe(channel: string): Promise<void> {
        try {
            return this.subscriptionManager.subscribe(channel);
        } catch (error) {
            this.logger.error('Error subscribing to channel', { channel, error });
            throw error;
        }
    }

    public setAuthToken(token: string) {
        this.authManager.setAuthToken(token);
    }

    public close() {
        this.logger.info('Closing CommunicationsManager');
        this.heartbeatManager.stopHeartbeat();
        this.webSocketManager.close();
    }

    public reconnect() {
        this.logger.info('Manual reconnection initiated.');
        this.webSocketManager.reconnect();
    }

    public onOpen(callback: () => void) {
        this.webSocketManager.on('open', callback);
    }

    public onClose(callback: (event: CloseEvent) => void) {
        this.webSocketManager.on('close', callback);
    }

    public onError(callback: (error: Event) => void) {
        this.webSocketManager.on('error', callback);
    }

    public onMessage(callback: (data: string) => void) {
        this.webSocketManager.on('message', callback);
    }

    public onRequest<T>(requestType: string, callback: (body: T, respond: (responseBody: any) => void) => void) {
        this.requestManager.on(requestType, callback);
    }
}
