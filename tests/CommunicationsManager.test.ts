import {
  CommunicationsManager,
  ICommunicationsManagerConfig,
} from "../src/CommunicationsManager";
import { WebSocketManager } from "../src/WebSocketManager";
import { AuthenticationManager } from "../src/AuthenticationManager";
import { RequestManager } from "../src/RequestManager";
import { SubscriptionManager } from "../src/SubscriptionManager";
import { HeartbeatManager } from "../src/HeartbeatManager";

// Mock dependencies
jest.mock("../src/WebSocketManager");
jest.mock("../src/AuthenticationManager");
jest.mock("../src/RequestManager");
jest.mock("../src/SubscriptionManager");
jest.mock("../src/HeartbeatManager");

describe("CommunicationsManager", () => {
  let config: ICommunicationsManagerConfig;
  let communicationsManager: CommunicationsManager;

  beforeEach(() => {
    config = {
      url: "wss://example.com",
      secure: true,
      authToken: "test-token",
      maxReconnectAttempts: 5,
      reconnectInterval: 1000,
      heartbeatInterval: 30000,
      requestTimeout: 5000,
    };

    // Reset all mocks before each test
    jest.clearAllMocks();

    (
      AuthenticationManager.prototype.authenticate as jest.Mock
    ).mockResolvedValue(true);
    (AuthenticationManager.prototype.getAuthToken as jest.Mock).mockReturnValue(
      "test-token"
    );
  });

  test("constructor initializes all managers correctly", () => {
    communicationsManager = new CommunicationsManager(config);

    expect(WebSocketManager).toHaveBeenCalledWith(
      config.url,
      config.secure,
      config.maxReconnectAttempts,
      config.reconnectInterval
    );
    expect(RequestManager).toHaveBeenCalled();
    expect(AuthenticationManager).toHaveBeenCalled();
    expect(SubscriptionManager).toHaveBeenCalled();
    expect(HeartbeatManager).toHaveBeenCalledWith(
      expect.any(Object),
      config.heartbeatInterval
    );
  });

  test("constructor throws error when URL is not provided", () => {
    const invalidConfig = { ...config, url: "" };
    expect(() => new CommunicationsManager(invalidConfig)).toThrow(
      "URL is required in the configuration"
    );
  });

  test("setAuthToken calls AuthenticationManager.setAuthToken", () => {
    communicationsManager = new CommunicationsManager(config);
    const newToken = "new-test-token";
    communicationsManager.setAuthToken(newToken);

    expect(AuthenticationManager.prototype.setAuthToken).toHaveBeenCalledWith(
      newToken
    );
  });

  test("request calls RequestManager.request", async () => {
    communicationsManager = new CommunicationsManager(config);
    const requestType = "test-request";
    const body = { data: "test-data" };
    const to = "test-destination";

    // Trigger WebSocket open event
    (WebSocketManager.prototype.on as jest.Mock).mock.calls.find(
      (call) => call[0] === "open"
    )[1]();

    // Wait for authentication to complete
    await new Promise((resolve) =>
      communicationsManager.once("authenticated", resolve)
    );

    await communicationsManager.request(requestType, body, to);

    expect(RequestManager.prototype.request).toHaveBeenCalledWith(
      requestType,
      body,
      to
    );
  });

  test("subscribe calls SubscriptionManager.subscribe", async () => {
    communicationsManager = new CommunicationsManager(config);
    const channel = "test-channel";

    // Trigger WebSocket open event
    (WebSocketManager.prototype.on as jest.Mock).mock.calls.find(
      (call) => call[0] === "open"
    )[1]();

    // Wait for authentication to complete
    await new Promise((resolve) =>
      communicationsManager.once("authenticated", resolve)
    );

    await communicationsManager.subscribe(channel);

    expect(SubscriptionManager.prototype.subscribe).toHaveBeenCalledWith(
      channel
    );
  });

  test("close stops heartbeat and closes WebSocketManager", () => {
    communicationsManager = new CommunicationsManager(config);
    communicationsManager.close();

    expect(HeartbeatManager.prototype.stopHeartbeat).toHaveBeenCalled();
    expect(WebSocketManager.prototype.close).toHaveBeenCalled();
  });

  test("reconnect calls WebSocketManager.reconnect", () => {
    communicationsManager = new CommunicationsManager(config);
    communicationsManager.reconnect();

    expect(WebSocketManager.prototype.reconnect).toHaveBeenCalled();
  });

  // Test WebSocket event handlers
  test("onOpen registers open event callback", () => {
    communicationsManager = new CommunicationsManager(config);
    const callback = jest.fn();
    communicationsManager.onOpen(callback);

    expect(WebSocketManager.prototype.on).toHaveBeenCalledWith(
      "open",
      callback
    );
  });

  test("onClose registers close event callback", () => {
    communicationsManager = new CommunicationsManager(config);
    const callback = jest.fn();
    communicationsManager.onClose(callback);

    expect(WebSocketManager.prototype.on).toHaveBeenCalledWith(
      "close",
      callback
    );
  });

  test("onError registers error event callback", () => {
    communicationsManager = new CommunicationsManager(config);
    const callback = jest.fn();
    communicationsManager.onError(callback);

    expect(WebSocketManager.prototype.on).toHaveBeenCalledWith(
      "error",
      callback
    );
  });

  test("onMessage registers message event callback", () => {
    communicationsManager = new CommunicationsManager(config);
    const callback = jest.fn();
    communicationsManager.onMessage(callback);

    expect(WebSocketManager.prototype.on).toHaveBeenCalledWith(
      "message",
      callback
    );
  });

  test("onRequest registers request callback", () => {
    communicationsManager = new CommunicationsManager(config);
    const requestType = "test-request";
    const callback = jest.fn();
    communicationsManager.onRequest(requestType, callback);

    expect(RequestManager.prototype.on).toHaveBeenCalledWith(
      requestType,
      callback
    );
  });

  test("handleOpen authenticates and starts heartbeat on successful connection", async () => {
    const mockAuthManager = {
      authenticate: jest.fn().mockResolvedValue(true),
      getAuthToken: jest.fn().mockReturnValue("test-token"),
    };
    const mockRequestManager = { setAuthToken: jest.fn() };
    const mockHeartbeatManager = { startHeartbeat: jest.fn() };

    // @ts-ignore: Partial mock implementation
    communicationsManager["authManager"] = mockAuthManager;
    // @ts-ignore: Partial mock implementation
    communicationsManager["requestManager"] = mockRequestManager;
    // @ts-ignore: Partial mock implementation
    communicationsManager["heartbeatManager"] = mockHeartbeatManager;

    await communicationsManager["handleOpen"]();

    expect(mockAuthManager.authenticate).toHaveBeenCalled();
    expect(mockRequestManager.setAuthToken).toHaveBeenCalledWith("test-token");
    expect(mockHeartbeatManager.startHeartbeat).toHaveBeenCalled();
  });

  test("handleError logs the error and unsubscribes from all channels", () => {
    const mockSubscriptionManager = {
      unsubscribeAll: jest.fn(),
    };
    const mockLogger = {
      error: jest.fn(),
    };

    communicationsManager = new CommunicationsManager(config);
    // @ts-ignore: Partial mock implementation
    communicationsManager["subscriptionManager"] = mockSubscriptionManager;
    // @ts-ignore: Partial mock implementation
    communicationsManager["logger"] = mockLogger;

    const testError = new Event("error");
    communicationsManager["handleError"](testError);

    expect(mockLogger.error).toHaveBeenCalledWith("WebSocket error:", {
      error: testError,
    });
    expect(mockSubscriptionManager.unsubscribeAll).toHaveBeenCalled();
  });

  test("handleClose logs the event, stops the heartbeat, and unsubscribes from all channels", () => {
    const mockHeartbeatManager = {
      stopHeartbeat: jest.fn(),
    };
    const mockSubscriptionManager = {
      unsubscribeAll: jest.fn(),
    };
    const mockLogger = {
      info: jest.fn(),
    };

    communicationsManager = new CommunicationsManager(config);
    // @ts-ignore: Partial mock implementation
    communicationsManager["heartbeatManager"] = mockHeartbeatManager;
    // @ts-ignore: Partial mock implementation
    communicationsManager["subscriptionManager"] = mockSubscriptionManager;
    // @ts-ignore: Partial mock implementation
    communicationsManager["logger"] = mockLogger;

    const testCloseEvent = new CloseEvent("close");
    communicationsManager["handleClose"](testCloseEvent);

    expect(mockLogger.info).toHaveBeenCalledWith(
      "WebSocket connection closed",
      { event: testCloseEvent }
    );
    expect(mockHeartbeatManager.stopHeartbeat).toHaveBeenCalled();
    expect(mockSubscriptionManager.unsubscribeAll).toHaveBeenCalled();
  });
});
