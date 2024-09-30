import { RequestManager } from "./RequestManager";

export class AuthenticationManager {
  private authToken: string | null = null;

  constructor(
    private requestManager: RequestManager,
    private websocketsServername = "websockets"
  ) {}

  public setAuthToken(token: string) {
    this.authToken = token;
  }

  public clearAuthToken() {
    this.authToken = null;
  }

  public async authenticate(): Promise<boolean> {
    if (!this.authToken) {
      throw new Error("No auth token set");
    }

    const result = await this.requestManager.request<
      { token: string },
      { success: boolean }
    >("authenticate", { token: this.authToken }, this.websocketsServername);

    return result.success;
  }

  public getAuthToken(): string | null {
    return this.authToken;
  }
}
