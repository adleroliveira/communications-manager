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

export enum SubscriptionStatus {
    Pending,
    Subscribed,
    Unsubscribed
}

export interface Subscription {
    channel: string;
    status: SubscriptionStatus;
}