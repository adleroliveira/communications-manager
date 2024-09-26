"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocketManager = void 0;
var events_1 = require("events");
var Logger_1 = require("./Logger");
var WebSocketManager = /** @class */ (function (_super) {
    __extends(WebSocketManager, _super);
    function WebSocketManager(url, secure, maxReconnectAttempts, reconnectInterval) {
        if (secure === void 0) { secure = false; }
        if (maxReconnectAttempts === void 0) { maxReconnectAttempts = 5; }
        if (reconnectInterval === void 0) { reconnectInterval = 5000; }
        var _this = _super.call(this) || this;
        _this.reconnectAttempts = 0;
        _this.logger = new Logger_1.Logger(Logger_1.LogLevel.INFO);
        _this.url = url;
        _this.secure = secure;
        _this.maxReconnectAttempts = maxReconnectAttempts;
        _this.reconnectInterval = reconnectInterval;
        _this.connect();
        return _this;
    }
    WebSocketManager.prototype.connect = function () {
        var secureUrl = this.getSecureUrl(this.url, this.secure);
        this.logger.info("Attempting to connect to ".concat(secureUrl));
        this.ws = new WebSocket(secureUrl);
        this.setHooks();
    };
    WebSocketManager.prototype.getSecureUrl = function (url, secure) {
        return secure ? url.replace(/^ws:/, 'wss:') : url;
    };
    WebSocketManager.prototype.setHooks = function () {
        var _this = this;
        this.ws.onopen = function () {
            _this.logger.info("WebSocket opened. ReadyState: ".concat(_this.ws.readyState));
            _this.emit('open');
        };
        this.ws.onclose = function (event) {
            _this.logger.info("WebSocket closed. ReadyState: ".concat(_this.ws.readyState, ". Code: ").concat(event.code, ", Reason: ").concat(event.reason));
            _this.emit('close', event);
            _this.handleReconnection();
        };
        this.ws.onerror = function (error) {
            _this.logger.error('WebSocket error:', error);
            _this.emit('error', error);
        };
        this.ws.onmessage = function (event) { return _this.emit('message', event.data); };
    };
    WebSocketManager.prototype.handleReconnection = function () {
        var _this = this;
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            var minDelay = 1000;
            var delay = Math.max(minDelay, this.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1));
            this.logger.info("Attempting to reconnect (".concat(this.reconnectAttempts, "/").concat(this.maxReconnectAttempts, ") in ").concat(delay, "ms..."));
            setTimeout(function () { return _this.connect(); }, delay);
        }
        else {
            this.logger.error('Max reconnection attempts reached. Please reconnect manually.');
            this.emit('maxReconnectAttemptsReached');
        }
    };
    WebSocketManager.prototype.send = function (message) {
        if (this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(message);
        }
        else {
            this.emit('error', new Error('WebSocket is not open'));
        }
    };
    WebSocketManager.prototype.close = function () {
        this.ws.close();
    };
    WebSocketManager.prototype.reconnect = function () {
        this.logger.debug('Manual reconnection initiated.');
        this.reconnectAttempts = 0;
        this.close();
        this.connect();
    };
    return WebSocketManager;
}(events_1.EventEmitter));
exports.WebSocketManager = WebSocketManager;
