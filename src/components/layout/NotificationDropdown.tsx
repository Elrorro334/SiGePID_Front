'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, Trash2 } from 'lucide-react';
import { notificationsApi, NotificationResponse } from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import { motion, AnimatePresence } from 'framer-motion';

export const NotificationDropdown = () => {
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, user } = useAuthStore();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    if (isAuthenticated && user?.id) {
      try {
        const response = await notificationsApi.getNotificationsByUserId(user.id.toString());
        // Sort descending by date
        const sorted = response.data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setNotifications(sorted);
      } catch (error) {
        console.error("Failed to fetch notifications", error);
      }
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated, user]);

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationsApi.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (error) {
      console.error("Failed to mark as read", error);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (!isAuthenticated) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-content hover:text-primary transition-colors focus:outline-none"
      >
        <Bell size={24} />
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-1 -right-1 bg-status-danger text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.div>
          )}
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-2 w-80 bg-surface rounded-xl shadow-xl border border-surface-border overflow-hidden z-50 origin-top-right"
          >
            <div className="p-4 border-b border-surface-border flex justify-between items-center bg-surface-muted/30">
              <h3 className="font-semibold text-content-strong">Notificaciones</h3>
              <span className="text-xs text-content-muted">{unreadCount} sin leer</span>
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-content-muted text-sm">
                  No tienes notificaciones
                </div>
              ) : (
                <div className="divide-y divide-surface-border">
                  {notifications.map((notification) => (
                    <div 
                      key={notification.id} 
                      className={`p-4 transition-colors ${notification.read ? 'bg-surface opacity-75' : 'bg-primary-light/10'}`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <h4 className={`text-sm font-semibold ${notification.read ? 'text-content' : 'text-content-strong'}`}>
                          {notification.title}
                        </h4>
                        {!notification.read && (
                          <button 
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="text-primary hover:text-primary-dark p-1 rounded-full hover:bg-primary-light/50 transition-colors"
                            title="Marcar como leída"
                          >
                            <Check size={16} />
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-content-muted mb-2 line-clamp-2">
                        {notification.message}
                      </p>
                      <span className="text-[10px] text-content-muted block text-right">
                        {new Date(notification.createdAt).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
