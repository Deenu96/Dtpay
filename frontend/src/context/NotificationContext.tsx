import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/services/userService';
import type { Notification } from '@/types';
import toast from 'react-hot-toast';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  refetchNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const queryClient = useQueryClient();

  // Fetch notifications
  const { data, isLoading, refetch: refetchNotifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => userService.getNotifications({ limit: 50 }),
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Fetch unread count
  const { data: unreadCountData } = useQuery({
    queryKey: ['unreadNotificationCount'],
    queryFn: () => userService.getUnreadNotificationCount(),
    refetchInterval: 30000,
  });

  useEffect(() => {
    if (data) {
      setNotifications(data.data);
    }
  }, [data]);

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: userService.markNotificationAsRead,
    onSuccess: (updatedNotification) => {
      setNotifications((prev) =>
        prev.map((n) => (n.id === updatedNotification.id ? updatedNotification : n))
      );
      queryClient.invalidateQueries({ queryKey: ['unreadNotificationCount'] });
    },
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: userService.markAllNotificationsAsRead,
    onSuccess: () => {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      queryClient.invalidateQueries({ queryKey: ['unreadNotificationCount'] });
      toast.success('All notifications marked as read');
    },
  });

  // Delete notification mutation
  const deleteNotificationMutation = useMutation({
    mutationFn: userService.deleteNotification,
    onSuccess: (_, id) => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      queryClient.invalidateQueries({ queryKey: ['unreadNotificationCount'] });
    },
  });

  const markAsRead = useCallback(
    async (id: string) => {
      await markAsReadMutation.mutateAsync(id);
    },
    [markAsReadMutation]
  );

  const markAllAsRead = useCallback(async () => {
    await markAllAsReadMutation.mutateAsync();
  }, [markAllAsReadMutation]);

  const deleteNotification = useCallback(
    async (id: string) => {
      await deleteNotificationMutation.mutateAsync(id);
    },
    [deleteNotificationMutation]
  );

  const value: NotificationContextType = {
    notifications,
    unreadCount: unreadCountData?.count || 0,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refetchNotifications,
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

export const useNotificationContext = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return context;
};
