'use client';

import { useEffect, useRef } from 'react';
import { useSocketContext } from '@/context/SocketContext';
import { SOCKET_EVENTS, type SocketEventName } from '@/lib/socket/events';

/**
 * Access the core Socket.IO instance and status
 */
export function useSocket() {
  return useSocketContext();
}

/**
 * Hook to subscribe to a Socket.IO event with automatic cleanup on unmount
 * Prevents memory leaks and duplicate handlers across React renders.
 */
export function useSocketEvent<T = unknown>(
  event: SocketEventName | string,
  handler: (data: T) => void,
  deps: unknown[] = []
) {
  const { socket } = useSocketContext();
  const handlerRef = useRef(handler);

  // Keep latest handler reference without re-binding socket listener unnecessarily
  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    if (!socket || typeof socket.on !== 'function') return;

    const eventListener = (data: T) => {
      if (handlerRef.current) {
        handlerRef.current(data);
      }
    };

    socket.on(event, eventListener);

    return () => {
      socket.off(event, eventListener);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, event, ...deps]);
}

/**
 * Hook to automatically track an order in real-time
 * Joins room order:<orderNumber> on mount, leaves on unmount
 */
export function useOrderTracking(orderNumber?: string | null) {
  const { socket, isConnected } = useSocketContext();

  useEffect(() => {
    if (!socket || !isConnected || !orderNumber) return;

    const trimmed = orderNumber.trim();
    if (!trimmed) return;

    socket.emit(SOCKET_EVENTS.ORDER_TRACK, { orderNumber: trimmed });

    return () => {
      socket.emit(SOCKET_EVENTS.ORDER_UNTRACK, { orderNumber: trimmed });
    };
  }, [socket, isConnected, orderNumber]);
}

/**
 * Hook for admin dashboard components to join the authenticated admin room
 */
export function useAdminSocket() {
  const { socket, isConnected } = useSocketContext();

  useEffect(() => {
    if (!socket || !isConnected) return;
    socket.emit(SOCKET_EVENTS.ADMIN_JOIN);
  }, [socket, isConnected]);
}
