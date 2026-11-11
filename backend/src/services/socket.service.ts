import type { Server as HttpServer } from 'node:http';
import { Server as SocketIOServer, type Socket } from 'socket.io';
import type { Environment } from '../config/env';
import { getAuthenticatedAdmin } from './auth.service';
import { SOCKET_EVENTS, type SocketEventName } from '../constants/socket-events';
import { logger } from '../utils/logger';

let io: SocketIOServer | null = null;

function parseCookie(cookieHeader?: string, name?: string): string | undefined {
  if (!cookieHeader || !name) return undefined;
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : undefined;
}

export function initSocketService(httpServer: HttpServer, env: Environment): SocketIOServer {
  if (io) {
    logger.warn('Socket.IO service already initialized');
    return io;
  }

  const allowedOrigins = env.FRONTEND_ORIGIN.split(',').map((o) => o.trim().replace(/\/$/, ''));

  io = new SocketIOServer(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        const normalized = origin.replace(/\/$/, '');
        const isAllowedExplicit = allowedOrigins.includes(normalized);
        const isLocal = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
        const isVercel = /^https:\/\/[a-zA-Z0-9_.-]+\.vercel\.app$/.test(normalized);
        const isRender = /^https:\/\/[a-zA-Z0-9_.-]+\.onrender\.com$/.test(normalized);
        const isYumnestDomain = /^https:\/\/(www\.)?yumnest\.in$/.test(normalized);

        if (isAllowedExplicit || isLocal || isVercel || isRender || isYumnestDomain) {
          return callback(null, true);
        }
        logger.warn('Socket.IO connection rejected by CORS', { origin });
        callback(new Error('Origin not allowed by CORS'));
      },
      credentials: true,
      methods: ['GET', 'POST'],
    },
    transports: ['websocket', 'polling'],
    pingTimeout: 30000,
    pingInterval: 25000,
    connectTimeout: 45000,
  });

  // ── Authentication Middleware for Sockets ───────────────────────────────────
  io.use(async (socket: Socket, next) => {
    try {
      const cookieHeader = socket.request.headers.cookie;
      const cookieToken = parseCookie(cookieHeader, env.SESSION_COOKIE_NAME);
      const authToken = (socket.handshake.auth?.token as string | undefined) || cookieToken;

      if (authToken) {
        const admin = await getAuthenticatedAdmin(authToken);
        if (admin) {
          socket.data.admin = admin;
          logger.info('Socket authenticated as admin', {
            socketId: socket.id,
            adminId: admin.id,
            email: admin.email,
          });
        }
      }
      next();
    } catch (error) {
      logger.warn('Socket authentication middleware error (continuing as guest)', {
        socketId: socket.id,
        error: error instanceof Error ? error.message : String(error),
      });
      next();
    }
  });

  // ── Connection Handling ───────────────────────────────────────────────────
  io.on('connection', (socket: Socket) => {
    logger.info('Socket client connected', {
      socketId: socket.id,
      transport: socket.conn.transport.name,
      isAdmin: Boolean(socket.data.admin),
    });

    // Automatically join admin room if authenticated
    if (socket.data.admin) {
      void socket.join('admin:all');
    }

    // Customer or admin requests to track a specific order
    socket.on(SOCKET_EVENTS.ORDER_TRACK, (data: { orderNumber?: string }) => {
      const orderNumber = String(data?.orderNumber || '').trim();
      if (!orderNumber || !/^[A-Za-z0-9-_]{3,40}$/.test(orderNumber)) {
        return;
      }
      const room = `order:${orderNumber}`;
      void socket.join(room);
      logger.info('Socket subscribed to order room', {
        socketId: socket.id,
        room,
      });
    });

    // Customer leaves order tracking room
    socket.on(SOCKET_EVENTS.ORDER_UNTRACK, (data: { orderNumber?: string }) => {
      const orderNumber = String(data?.orderNumber || '').trim();
      if (!orderNumber) return;
      void socket.leave(`order:${orderNumber}`);
    });

    // Admin explicitly requests to join admin room (with validation)
    socket.on(SOCKET_EVENTS.ADMIN_JOIN, () => {
      if (!socket.data.admin) {
        socket.emit('error', { code: 'UNAUTHORIZED', message: 'Admin authentication required' });
        return;
      }
      void socket.join('admin:all');
    });

    socket.on('disconnect', (reason) => {
      logger.info('Socket client disconnected', {
        socketId: socket.id,
        reason,
      });
    });
  });

  logger.info('Socket.IO service initialized successfully');
  return io;
}

export function getSocketIO(): SocketIOServer | null {
  return io;
}

/**
 * Emit an event to ALL connected clients (e.g. public products, videos, categories)
 */
export function emitToAll(event: SocketEventName, payload: unknown): void {
  if (!io) return;
  try {
    io.emit(event, payload);
    logger.info('Socket event emitted to all', { event });
  } catch (err) {
    logger.error('Failed to emit socket event to all', { event, err });
  }
}

/**
 * Emit an event strictly to authenticated admin room
 */
export function emitToAdmin(event: SocketEventName, payload: unknown): void {
  if (!io) return;
  try {
    io.to('admin:all').emit(event, payload);
    logger.info('Socket event emitted to admin:all', { event });
  } catch (err) {
    logger.error('Failed to emit socket event to admin', { event, err });
  }
}

/**
 * Emit an order update to the specific customer order room, plus to admin:all
 */
export function emitToOrder(orderNumber: string, event: SocketEventName, payload: unknown): void {
  if (!io) return;
  try {
    const room = `order:${orderNumber}`;
    io.to(room).emit(event, payload);
    io.to('admin:all').emit(event, payload);
    logger.info('Socket event emitted to order room and admin', { room, event });
  } catch (err) {
    logger.error('Failed to emit socket event to order room', { orderNumber, event, err });
  }
}

export function closeSocketService(): Promise<void> {
  return new Promise((resolve) => {
    if (!io) {
      resolve();
      return;
    }
    io.close(() => {
      io = null;
      logger.info('Socket.IO service closed');
      resolve();
    });
  });
}
