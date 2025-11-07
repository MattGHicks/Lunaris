'use client';

import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useSession } from 'next-auth/react';
import { SOCKET_EVENTS } from '@/lib/socket/events';

/**
 * Custom hook for Socket.io connection
 * Automatically connects when user is authenticated
 */
export function useSocket() {
  const { data: session } = useSession();
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!session?.user?.id) {
      // Not authenticated, don't connect
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setIsConnected(false);
      return;
    }

    // Initialize Socket.io connection
    const socket = io({
      path: '/socket.io/',
      autoConnect: true,
    });

    socket.on(SOCKET_EVENTS.CONNECT, () => {
      console.log('Socket.io connected:', socket.id);
      setIsConnected(true);

      // Authenticate with user ID so server knows which room to join
      socket.emit('authenticate', session.user.id);
    });

    socket.on(SOCKET_EVENTS.DISCONNECT, () => {
      console.log('Socket.io disconnected');
      setIsConnected(false);
    });

    socket.on(SOCKET_EVENTS.ERROR, (error) => {
      console.error('Socket.io error:', error);
    });

    socketRef.current = socket;

    // Cleanup
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [session?.user?.id]);

  return {
    socket: socketRef.current,
    isConnected,
  };
}

/**
 * Hook to listen for specific Socket.io events
 */
export function useSocketEvent<T = any>(
  eventName: string,
  callback: (data: T) => void,
  enabled: boolean = true
) {
  const { socket } = useSocket();
  const callbackRef = useRef(callback);

  // Keep callback ref up to date
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!socket || !enabled) {
      console.log(`Socket event ${eventName} - not enabled or no socket`);
      return;
    }

    const handler = (data: T) => {
      console.log(`Socket event received: ${eventName}`, data);
      callbackRef.current(data);
    };

    console.log(`Registering listener for: ${eventName}`);
    socket.on(eventName, handler);

    return () => {
      console.log(`Unregistering listener for: ${eventName}`);
      socket.off(eventName, handler);
    };
  }, [socket, eventName, enabled]);
}
