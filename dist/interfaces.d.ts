export interface IRequestHeader {
    timestamp: number;
    requestId: string;
    requesterAddress: string;
    recipientAddress?: string;
    requestType?: string;
    authToken?: string;
}
export interface IRequest<T> {
    header: IRequestHeader;
    body: T;
}
export interface IResponseData<T> {
    data: T;
    success: boolean;
    error: Error | null;
}
export interface IResponseHeader {
    responderAddress: string;
    timestamp: number;
}
export interface IResponse<T> {
    requestHeader: IRequestHeader;
    responseHeader: IResponseHeader;
    body: IResponseData<T>;
}
export declare enum SubscriptionStatus {
    Pending = 0,
    Subscribed = 1,
    Unsubscribed = 2
}
export interface Subscription {
    channel: string;
    status: SubscriptionStatus;
}
