import React, { useState, useEffect } from 'react';
import { Bell, CheckCheck, AlertTriangle, Info, Calendar, Award } from 'lucide-react';
import notificationService from '../../services/notificationService';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';

export const DonorNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifs = async () => {
    setIsLoading(true);
    try {
      const res = await notificationService.getNotifications();
      setNotifications(res.data || []);
    } catch (err) {
      toast.error('Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (err) {
      toast.error('Failed to mark read');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      toast.success('All notifications marked as read');
    } catch (err) {
      toast.error('Failed to mark all as read');
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const getIcon = (type) => {
    switch (type) {
      case 'ALERT':
        return <AlertTriangle className="w-5 h-5 text-rose-600" />;
      case 'SUCCESS':
        return <Award className="w-5 h-5 text-emerald-600" />;
      case 'EVENT':
        return <Calendar className="w-5 h-5 text-purple-600" />;
      case 'INFO':
      default:
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  return (
    <div className="space-y-6 max-w-3xl animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="font-heading text-2xl font-bold text-slate-900">Notifications</h2>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-crimson-100 text-crimson-900">
                {unreadCount} unread
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500">Alerts, blood requests matching your group, and appointment confirmations</p>
        </div>

        {unreadCount > 0 && (
          <Button variant="secondary" size="sm" onClick={handleMarkAllRead} icon={CheckCheck}>
            Mark All as Read
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {notifications.length === 0 ? (
          <EmptyState
            title="No Notifications"
            description="You are completely caught up. We will notify you when emergency blood requests or new appointments arrive."
          />
        ) : (
          notifications.map((item) => (
            <Card
              key={item.id}
              onClick={() => !item.is_read && handleMarkAsRead(item.id)}
              className={`border transition-all cursor-pointer ${
                item.is_read
                  ? 'border-slate-100 bg-white opacity-80'
                  : 'border-crimson-200 bg-crimson-50/20 shadow-xs'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-xl bg-slate-100 flex-shrink-0">
                  {getIcon(item.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h4 className="font-heading text-base font-bold text-slate-900 truncate">
                      {item.title}
                    </h4>
                    <span className="text-[11px] text-slate-400 whitespace-nowrap">
                      {item.created_at?.split('T')[0]}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{item.message}</p>
                </div>

                {!item.is_read && (
                  <span className="w-2.5 h-2.5 rounded-full bg-crimson-600 flex-shrink-0 mt-2"></span>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default DonorNotifications;
