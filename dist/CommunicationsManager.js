"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommunicationsManager = void 0;
var WebSocketManager_1 = require("./WebSocketManager");
var AuthenticationManager_1 = require("./AuthenticationManager");
var RequestManager_1 = require("./RequestManager");
var SubscriptionManager_1 = require("./SubscriptionManager");
var HeartbeatManager_1 = require("./HeartbeatManager");
var Logger_1 = require("./Logger");
var CommunicationsManager = /** @class */ (function () {
    function CommunicationsManager(config) {
        this.logger = new Logger_1.Logger(Logger_1.LogLevel.INFO);
        this.validateConfig(config);
        try {
            this.webSocketManager = new WebSocketManager_1.WebSocketManager(config.url, config.secure, config.maxReconnectAttempts, config.reconnectInterval);
            this.requestManager = new RequestManager_1.RequestManager({ webSocketManager: this.webSocketManager, requestTimeout: config.requestTimeout });
            this.authManager = new AuthenticationManager_1.AuthenticationManager(this.requestManager);
            this.subscriptionManager = new SubscriptionManager_1.SubscriptionManager(this.requestManager);
            this.heartbeatManager = new HeartbeatManager_1.HeartbeatManager(this.requestManager, config.heartbeatInterval);
            if (config.authToken) {
                this.authManager.setAuthToken(config.authToken);
            }
            this.setupWebSocketHooks();
        }
        catch (error) {
            this.logger.error('Error initializing CommunicationsManager', { error: error });
            throw new Error('Failed to initialize CommunicationsManager');
        }
    }
    CommunicationsManager.prototype.validateConfig = function (config) {
        if (!config.url) {
            throw new Error('URL is required in the configuration');
        }
    };
    CommunicationsManager.prototype.setupWebSocketHooks = function () {
        this.webSocketManager.on('open', this.handleOpen.bind(this));
        this.webSocketManager.on('close', this.handleClose.bind(this));
        this.webSocketManager.on('error', this.handleError.bind(this));
        this.webSocketManager.on('maxReconnectAttemptsReached', this.handleMaxReconnectAttemptsReached.bind(this));
    };
    CommunicationsManager.prototype.handleOpen = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.logger.info("WebSocket connection established");
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.authManager.authenticate()];
                    case 2:
                        if (_a.sent()) {
                            this.requestManager.setAuthToken(this.authManager.getAuthToken());
                            this.heartbeatManager.startHeartbeat();
                            this.logger.info("WebSocket connection established");
                        }
                        else {
                            this.logger.warn("Authentication failed");
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        this.logger.error("Error during authentication", { error: error_1 });
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    CommunicationsManager.prototype.handleClose = function (event) {
        this.logger.info('WebSocket connection closed', { event: event });
        this.heartbeatManager.stopHeartbeat();
        this.subscriptionManager.unsubscribeAll();
    };
    CommunicationsManager.prototype.handleError = function (error) {
        this.logger.error('WebSocket error:', { error: error });
        this.subscriptionManager.unsubscribeAll();
    };
    CommunicationsManager.prototype.handleMaxReconnectAttemptsReached = function () {
        this.logger.error('Maximum reconnection attempts reached. Use reconnect() method to try again.');
    };
    CommunicationsManager.prototype.request = function (requestType, body, to) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    return [2 /*return*/, this.requestManager.request(requestType, body, to)];
                }
                catch (error) {
                    this.logger.error('Error making request', { requestType: requestType, error: error });
                    throw error;
                }
                return [2 /*return*/];
            });
        });
    };
    CommunicationsManager.prototype.subscribe = function (channel) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    return [2 /*return*/, this.subscriptionManager.subscribe(channel)];
                }
                catch (error) {
                    this.logger.error('Error subscribing to channel', { channel: channel, error: error });
                    throw error;
                }
                return [2 /*return*/];
            });
        });
    };
    CommunicationsManager.prototype.setAuthToken = function (token) {
        this.authManager.setAuthToken(token);
    };
    CommunicationsManager.prototype.close = function () {
        this.logger.info('Closing CommunicationsManager');
        this.heartbeatManager.stopHeartbeat();
        this.webSocketManager.close();
    };
    CommunicationsManager.prototype.reconnect = function () {
        this.logger.info('Manual reconnection initiated.');
        this.webSocketManager.reconnect();
    };
    CommunicationsManager.prototype.onOpen = function (callback) {
        this.webSocketManager.on('open', callback);
    };
    CommunicationsManager.prototype.onClose = function (callback) {
        this.webSocketManager.on('close', callback);
    };
    CommunicationsManager.prototype.onError = function (callback) {
        this.webSocketManager.on('error', callback);
    };
    CommunicationsManager.prototype.onMessage = function (callback) {
        this.webSocketManager.on('message', callback);
    };
    CommunicationsManager.prototype.onRequest = function (requestType, callback) {
        this.requestManager.on(requestType, callback);
    };
    return CommunicationsManager;
}());
exports.CommunicationsManager = CommunicationsManager;
