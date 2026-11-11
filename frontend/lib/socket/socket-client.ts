import { io, Socket } from 'socket.io-client';

let socketInstance: Socket | null = null;

export function getSocketBaseUrl(): string {
  // 1. Explicit socket URL if defined
  if (process.env.NEXT_PUBLIC_SOCKET_URL) {
    return process.env.NEXT_PUBLIC_SOCKET_URL.replace(/\/$/, '');
  }

  // 2. Base API URL (strip trailing /api or /api/v1)
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
  if (apiUrl) {
    return apiUrl.replace(/\/api(\/v\d+)?\/?$/, '').replace(/\/$/, '');
  }

  // 3. Browser environment fallback
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:5000';
    }
  }

  // 4. Production Render backend default
  return 'https://yumnest-in.onrender.com';
}

export function getSocket(): Socket {
  if (typeof window === 'undefined') {
    // Return dummy on server side
    return {} as Socket;
  }

  if (!socketInstance) {
    const url = getSocketBaseUrl();
    socketInstance = io(url, {
      transports: ['websocket', 'polling'],
      withCredentials: true,
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });
  }

  return socketInstance;
}

export function disconnectSocket(): void {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
}
