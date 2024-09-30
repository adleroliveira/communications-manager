import { RequestManager } from "./RequestManager";
export declare class SubscriptionManager {
    private requestManager;
    private logger;
    private subscriptions;
    constructor(requestManager: RequestManager);
    subscribe(channel: string): Promise<void>;
    unsubscribeAll(): void;
}
