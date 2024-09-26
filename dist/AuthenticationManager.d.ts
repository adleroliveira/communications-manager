import { RequestManager } from './RequestManager';
export declare class AuthenticationManager {
    private requestManager;
    private websocketsServername;
    private authToken;
    constructor(requestManager: RequestManager, websocketsServername?: string);
    setAuthToken(token: string): void;
    clearAuthToken(): void;
    authenticate(): Promise<boolean>;
    getAuthToken(): string | null;
}
