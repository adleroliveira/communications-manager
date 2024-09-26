"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HeartbeatManager = void 0;
var Logger_1 = require("./Logger");
var HeartbeatManager = /** @class */ (function () {
    function HeartbeatManager(requestManager, heartbeatInterval, websocketServiceAddress) {
        if (heartbeatInterval === void 0) { heartbeatInterval = 30000; }
        if (websocketServiceAddress === void 0) { websocketServiceAddress = "websockets"; }
        this.requestManager = requestManager;
        this.heartbeatInterval = heartbeatInterval;
        this.websocketServiceAddress = websocketServiceAddress;
        this.heartbeatTimer = null;
        this.logger = new Logger_1.Logger(Logger_1.LogLevel.INFO);
    }
    HeartbeatManager.prototype.startHeartbeat = function () {
        var _this = this;
        this.stopHeartbeat();
        this.heartbeatTimer = setInterval(function () {
            _this.requestManager.request("heartbeat", new Date().toISOString(), _this.websocketServiceAddress)
                .catch(function (error) { return _this.logger.error('Heartbeat failed:', error); });
        }, this.heartbeatInterval);
    };
    HeartbeatManager.prototype.stopHeartbeat = function () {
        if (this.heartbeatTimer) {
            clearInterval(this.heartbeatTimer);
            this.heartbeatTimer = null;
        }
    };
    return HeartbeatManager;
}());
exports.HeartbeatManager = HeartbeatManager;
