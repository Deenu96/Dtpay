import { useEffect, useRef, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { SOCKET_URL } from '@/utils/constants';
import { storage } from '@/utils/helpers';
import { STORAGE_KEYS } from '@/utils/constants';

type SocketEventHandler = (data: unknown) => void;

interface UseSocketOptions {
  autoConnect?: boolean;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
}

export const useSocket = (options: UseSocketOptions = {}) => {
  const { autoConnect = true, onConnect, onDisconnect, onError } = options;
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const token = storage.get<string>(STORAGE_KEYS.TOKEN);
    
    if (!token) return;

    socketRef.current = io(SOCKET_URL, {
      auth: { token },
      autoConnect,
      transports: ['websocket'],
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      setIsConnected(true);
      onConnect?.();
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      onDisconnect?.();
    });

    socket.on('error', (error: Error) => {
      onError?.(error);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [autoConnect, onConnect, onDisconnect, onError]);

  const subscribe = useCallback((event: string, handler: SocketEventHandler) => {
    if (socketRef.current) {
      socketRef.current.on(event, handler);
    }
  }, []);

  const unsubscribe = useCallback((event: string, handler: SocketEventHandler) => {
    if (socketRef.current) {
      socketRef.current.off(event, handler);
    }
  }, []);

  const emit = useCallback((event: string, data?: unknown) => {
    if (socketRef.current) {
      socketRef.current.emit(event, data);
    }
  }, []);

  const joinRoom = useCallback((room: string) => {
    if (socketRef.current) {
      socketRef.current.emit('join', room);
    }
  }, []);

  const leaveRoom = useCallback((room: string) => {
    if (socketRef.current) {
      socketRef.current.emit('leave', room);
    }
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
    subscribe,
    unsubscribe,
    emit,
    joinRoom,
    leaveRoom,
  };
};

// Hook for trade updates
export const useTradeSocket = (tradeId?: string) => {
  const { subscribe, unsubscribe, joinRoom, leaveRoom, isConnected } = useSocket();

  useEffect(() => {
    if (!tradeId || !isConnected) return;

    joinRoom(`trade:${tradeId}`);

    return () => {
      leaveRoom(`trade:${tradeId}`);
    };
  }, [tradeId, isConnected, joinRoom, leaveRoom]);

  const onTradeUpdate = useCallback(
    (handler: (data: unknown) => void) => {
      subscribe('trade:update', handler);
      return () => unsubscribe('trade:update', handler);
    },
    [subscribe, unsubscribe]
  );

  const onNewMessage = useCallback(
    (handler: (data: unknown) => void) => {
      subscribe('trade:message', handler);
      return () => unsubscribe('trade:message', handler);
    },
    [subscribe, unsubscribe]
  );

  return { onTradeUpdate, onNewMessage, isConnected };
};

// Hook for order book updates
export const useOrderBookSocket = () => {
  const { subscribe, unsubscribe, joinRoom, leaveRoom, isConnected } = useSocket();

  useEffect(() => {
    if (!isConnected) return;

    joinRoom('orderbook');

    return () => {
      leaveRoom('orderbook');
    };
  }, [isConnected, joinRoom, leaveRoom]);

  const onOrderBookUpdate = useCallback(
    (handler: (data: unknown) => void) => {
      subscribe('orderbook:update', handler);
      return () => unsubscribe('orderbook:update', handler);
    },
    [subscribe, unsubscribe]
  );

  const onNewOrder = useCallback(
    (handler: (data: unknown) => void) => {
      subscribe('order:new', handler);
      return () => unsubscribe('order:new', handler);
    },
    [subscribe, unsubscribe]
  );

  const onOrderUpdate = useCallback(
    (handler: (data: unknown) => void) => {
      subscribe('order:update', handler);
      return () => unsubscribe('order:update', handler);
    },
    [subscribe, unsubscribe]
  );

  return { onOrderBookUpdate, onNewOrder, onOrderUpdate, isConnected };
};

// Hook for price updates
export const usePriceSocket = () => {
  const { subscribe, unsubscribe, joinRoom, leaveRoom, isConnected } = useSocket();

  useEffect(() => {
    if (!isConnected) return;

    joinRoom('prices');

    return () => {
      leaveRoom('prices');
    };
  }, [isConnected, joinRoom, leaveRoom]);

  const onPriceUpdate = useCallback(
    (handler: (data: unknown) => void) => {
      subscribe('price:update', handler);
      return () => unsubscribe('price:update', handler);
    },
    [subscribe, unsubscribe]
  );

  return { onPriceUpdate, isConnected };
};

// Hook for notification updates
export const useNotificationSocket = () => {
  const { subscribe, unsubscribe, isConnected } = useSocket();

  const onNotification = useCallback(
    (handler: (data: unknown) => void) => {
      subscribe('notification:new', handler);
      return () => unsubscribe('notification:new', handler);
    },
    [subscribe, unsubscribe]
  );

  return { onNotification, isConnected };
};

// Hook for wallet updates
export const useWalletSocket = () => {
  const { subscribe, unsubscribe, isConnected } = useSocket();

  const onWalletUpdate = useCallback(
    (handler: (data: unknown) => void) => {
      subscribe('wallet:update', handler);
      return () => unsubscribe('wallet:update', handler);
    },
    [subscribe, unsubscribe]
  );

  const onTransaction = useCallback(
    (handler: (data: unknown) => void) => {
      subscribe('transaction:new', handler);
      return () => unsubscribe('transaction:new', handler);
    },
    [subscribe, unsubscribe]
  );

  return { onWalletUpdate, onTransaction, isConnected };
};
