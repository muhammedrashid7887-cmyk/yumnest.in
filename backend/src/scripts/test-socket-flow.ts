import { createServer } from 'node:http';
import express from 'express';
import { io as Client } from 'socket.io-client';
import { initSocketService, closeSocketService, emitToAll, emitToOrder } from '../services/socket.service';
import { SOCKET_EVENTS } from '../constants/socket-events';
import type { Environment } from '../config/env';

async function runSocketVerification() {
  console.log('--- Starting Yumnest Socket.IO Integration Test ---');

  const dummyEnv: Environment = {
    NODE_ENV: 'test',
    PORT: 51234,
    MONGODB_URI: 'mongodb://localhost:27017/dummy',
    FRONTEND_ORIGIN: 'http://localhost:3000,http://localhost:51234',
    SESSION_COOKIE_NAME: 'yumnest_admin_session',
    SESSION_TTL_DAYS: 7,
    SESSION_COOKIE_SECURE: false,
    SESSION_COOKIE_SAME_SITE: 'lax',
    AUTH_RATE_LIMIT_WINDOW_MS: 900000,
    AUTH_RATE_LIMIT_MAX: 100,
    ADMIN_NAME: 'Test Admin',
    ADMIN_EMAIL: 'admin@yumnest.in',
    ADMIN_PASSWORD: 'Password123!',
  };

  const app = express();
  const httpServer = createServer(app);
  const ioServer = initSocketService(httpServer, dummyEnv);

  await new Promise<void>((resolve) => {
    httpServer.listen(dummyEnv.PORT, '127.0.0.1', () => {
      console.log(`[Test Server] Listening on port ${dummyEnv.PORT}`);
      resolve();
    });
  });

  const clientSocket = Client(`http://127.0.0.1:${dummyEnv.PORT}`, {
    transports: ['websocket'],
    autoConnect: true,
  });

  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Connection timed out')), 5000);
    clientSocket.on('connect', () => {
      console.log('[Test Client] Connected with ID:', clientSocket.id);
      clearTimeout(timeout);
      resolve();
    });
    clientSocket.on('connect_error', reject);
  });

  // Test 1: Public Broadcast (product:updated)
  console.log('Testing Scenario 1: Public Broadcast (product:updated)...');
  const productPromise = new Promise<void>((resolve) => {
    clientSocket.on(SOCKET_EVENTS.PRODUCT_UPDATED, (data) => {
      console.log('[Test Client] Received product:updated:', data);
      resolve();
    });
  });
  emitToAll(SOCKET_EVENTS.PRODUCT_UPDATED, { productId: 'test_123', name: 'Broast Masala 100g' });
  await productPromise;
  console.log('Scenario 1 Passed!');

  // Test 2: Video Management (video:created)
  console.log('Testing Scenario 2: Video Management (video:created)...');
  const videoPromise = new Promise<void>((resolve) => {
    clientSocket.on(SOCKET_EVENTS.VIDEO_CREATED, (data) => {
      console.log('[Test Client] Received video:created:', data);
      resolve();
    });
  });
  emitToAll(SOCKET_EVENTS.VIDEO_CREATED, { id: 'vid_01', title: 'Crispy Broast Recipe' });
  await videoPromise;
  console.log('Scenario 2 Passed!');

  // Test 3: Private Order Room Tracking (order:status_updated)
  console.log('Testing Scenario 3: Private Order Room Tracking...');
  clientSocket.emit(SOCKET_EVENTS.ORDER_TRACK, { orderNumber: 'YN-TEST-001' });

  // Small delay for room join to register in socket server
  await new Promise((r) => setTimeout(r, 200));

  const orderPromise = new Promise<void>((resolve) => {
    clientSocket.on(SOCKET_EVENTS.ORDER_STATUS_UPDATED, (data) => {
      console.log('[Test Client] Received order:status_updated in private room:', data);
      resolve();
    });
  });

  emitToOrder('YN-TEST-001', SOCKET_EVENTS.ORDER_STATUS_UPDATED, {
    order: { orderNumber: 'YN-TEST-001', status: 'shipped' },
  });
  await orderPromise;
  console.log('Scenario 3 Passed!');

  // Cleanup
  clientSocket.disconnect();
  await closeSocketService();
  await new Promise<void>((resolve) => httpServer.close(() => resolve()));

  console.log('--- All Socket.IO Integration Tests Passed Successfully! ---');
}

runSocketVerification().catch((err) => {
  console.error('Socket Verification Failed:', err);
  process.exit(1);
});
