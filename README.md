# CommunicationsManager

## Overview

CommunicationsManager is a robust, TypeScript-based WebSocket communication library designed for browser environments. It provides a high-level interface for managing WebSocket connections, handling authentication, and managing subscriptions.

## Features

- WebSocket connection management with automatic reconnection
- Authentication handling
- Request-response pattern over WebSocket
- Subscription management
- Heartbeat mechanism
- Comprehensive error handling and logging
- TypeScript support

## Installation

As this package is not published on npm, you can include it in your project using one of the following methods:

### Local Path

1. Clone this repository to your local machine.
2. In your project's `package.json`, add the following dependency:

```json
"dependencies": {
  "communications-manager": "file:../path/to/communications-manager"
}
```

3. Run `npm install` or `yarn install` in your project.

### Git Submodule

1. Add this repository as a submodule to your project:

```
git submodule add https://github.com/adleroliveira/communications-manager.git
```

2. In your project's `package.json`, add the following dependency:

```json
"dependencies": {
  "communications-manager": "file:./communications-manager"
}
```

3. Run `npm install` or `yarn install` in your project.

### Private Git Repository

In your project's `package.json`, add the following dependency:

```json
"dependencies": {
  "communications-manager": "git+https://github.com/adleroliveira/communications-manager.git#v1.0.0"
}
```

Replace `v1.0.0` with the desired version or branch.

## Usage

Here's a basic example of how to use the CommunicationsManager:

```typescript
import { CommunicationsManager, ICommunicationsManagerConfig } from 'communications-manager';

const config: ICommunicationsManagerConfig = {
  url: 'wss://your-websocket-server.com',
  secure: true,
  authToken: 'your-auth-token',
  maxReconnectAttempts: 5,
  reconnectInterval: 5000,
  heartbeatInterval: 30000,
  requestTimeout: 10000
};

const commsManager = new CommunicationsManager(config);

// Set up event listeners
commsManager.onOpen(() => {
  console.log('Connection opened');
});

commsManager.onClose((event) => {
  console.log('Connection closed', event);
});

commsManager.onError((error) => {
  console.error('WebSocket error', error);
});

// Make a request
commsManager.request('get_user_data', { userId: '123' })
  .then((response) => {
    console.log('User data:', response.data);
  })
  .catch((error) => {
    console.error('Error fetching user data:', error);
  });

// Subscribe to a channel
commsManager.subscribe('user_updates')
  .then(() => {
    console.log('Subscribed to user updates');
  })
  .catch((error) => {
    console.error('Error subscribing to user updates:', error);
  });

// Handle incoming requests
commsManager.onRequest('update_user', (data, respond) => {
  // Process the update
  console.log('Updating user:', data);
  // Send a response
  respond({ success: true });
});

// Close the connection when done
commsManager.close();
```

## API Reference

### `CommunicationsManager`

#### Constructor

```typescript
constructor(config: ICommunicationsManagerConfig)
```

- `config`: Configuration object for the CommunicationsManager

#### Methods

- `request<I, O>(requestType: string, body: I, to?: string): Promise<IResponseData<O>>`
  - Send a request over the WebSocket connection
- `subscribe(channel: string): Promise<void>`
  - Subscribe to a channel
- `setAuthToken(token: string): void`
  - Set the authentication token
- `close(): void`
  - Close the WebSocket connection
- `reconnect(): void`
  - Manually initiate a reconnection
- `onOpen(callback: () => void): void`
  - Set a callback for when the connection opens
- `onClose(callback: (event: CloseEvent) => void): void`
  - Set a callback for when the connection closes
- `onError(callback: (error: Event) => void): void`
  - Set a callback for when an error occurs
- `onMessage(callback: (data: string) => void): void`
  - Set a callback for incoming messages
- `onRequest<T>(requestType: string, callback: (body: T, respond: (responseBody: any) => void) => void): void`
  - Set a callback for handling incoming requests

## Development

### Building the Package

To build the package, run:

```
npm run build
```

This will compile the TypeScript files and generate the output in the `dist` directory.

### Running Tests

To run the test suite, use:

```
npm test
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.