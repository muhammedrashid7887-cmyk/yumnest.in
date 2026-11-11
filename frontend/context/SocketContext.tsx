'use client';

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import type { Socket } from 'socket.io-client';
import { getSocket, disconnectSocket } from '@/lib/socket/socket-client';
import { SOCKET_EVENTS } from '@/lib/socket/events';

interface SocketContextValue {
  socket: Socket | null;
  isConnected: boolean;
  transport: string;
  lastConnectedAt: Date | null;
}

const SocketContext = createContext<SocketContextValue>({
  socket: null,
  isConnected: false,
  transport: 'none',
  lastConnectedAt: null,
});

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [transport, setTransport] = useState('none');
  const [lastConnectedAt, setLastConnectedAt] = useState<Date | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const s = getSocket();
    setSocket(s);

    const onConnect = () => {
      setIsConnected(true);
      setTransport(s.io.engine?.transport?.name || 'websocket');
      setLastConnectedAt(new Date());

      // If transport upgrades from polling to websocket
      s.io.engine?.on('upgrade', (rawTransport: { name: string }) => {
        setTransport(rawTransport.name);
      });
    };

    const onDisconnect = (reason: string) => {
      setIsConnected(false);
      setTransport('none');
      if (reason === 'io server disconnect') {
        // the disconnection was initiated by the server, reconnect manually
        s.connect();
      }
    };

    const onConnectError = (error: Error) => {
      console.warn('Socket connection error (will auto-retry):', error.message);
      setIsConnected(false);
    };

    if (s.connected) {
      onConnect();
    }

    s.on(SOCKET_EVENTS.CONNECT, onConnect);
    s.on(SOCKET_EVENTS.DISCONNECT, onDisconnect);
    s.on('connect_error', onConnectError);

    return () => {
      s.off(SOCKET_EVENTS.CONNECT, onConnect);
      s.off(SOCKET_EVENTS.DISCONNECT, onDisconnect);
      s.off('connect_error', onConnectError);
    };
  }, []);

  const value = useMemo(
    () => ({
      socket,
      isConnected,
      transport,
      lastConnectedAt,
    }),
    [socket, isConnected, transport, lastConnectedAt]
  );

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

export function useSocketContext(): SocketContextValue {
  return useContext(SocketContext);
}
