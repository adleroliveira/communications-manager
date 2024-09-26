// Mock WebSocket
global.WebSocket = class {
  constructor(url) {
    this.url = url;
    this.readyState = WebSocket.CONNECTING;
  }

  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;

  send(data) { }
  close() { }
};
