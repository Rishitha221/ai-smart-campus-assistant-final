import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, X, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ title = 'Dashboard' }) => {
  const { user, apiCall } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      const data = await apiCall('/admin/notifications');
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  // 1. Fetch notifications on load
  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  // 2. Real-Time Notification SSE Stream Listener
  useEffect(() => {
    if (!user) return;

    const eventSource = new EventSource('http://localhost:5000/api/admin/notifications/stream');

    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        // Only trigger toast for the user whom the notification is aimed at
        if (payload.user_id === user.id) {
          const toastId = Date.now();
          const newToast = { id: toastId, message: payload.message, complaintId: payload.complaint_id };
          
          // Add toast to UI
          setToasts((prev) => [...prev, newToast]);
          
          // Auto-remove toast after 5 seconds
          setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== toastId));
          }, 5000);

          // Update notifications list
          fetchNotifications();
        }
      } catch (err) {
        console.error("Error parsing SSE data:", err);
      }
    };

    eventSource.onerror = (err) => {
      console.error("SSE Connection Error. Reconnecting...", err);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [user]);

  // Handle clicking outside notifications dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id, e) => {
    e.stopPropagation(); // prevent closing dropdown
    try {
      await apiCall(`/admin/notifications/${id}/read`, { method: 'PUT' });
      fetchNotifications();
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const handleNotificationClick = async (notif) => {
    // Mark as read
    if (!notif.is_read) {
      try {
        await apiCall(`/admin/notifications/${notif.id}/read`, { method: 'PUT' });
      } catch (err) {
        console.error(err);
      }
    }
    setDropdownOpen(false);
    fetchNotifications();
    
    // Redirect to complaint details page if attached
    if (notif.complaint_id) {
      navigate(`/complaint/${notif.complaint_id}`);
    }
  };

  return (
    <header className="h-16 fixed top-0 right-0 left-64 z-10 flex items-center justify-between px-8 border-b border-slate-200 bg-white/85 dark:border-slate-800 dark:bg-slate-900/85 backdrop-blur-md transition-all duration-300">
      {/* Page Title */}
      <h2 className="text-xl font-bold text-slate-800 dark:text-white font-sans">{title}</h2>

      {/* Action Buttons */}
      <div className="flex items-center gap-4">
        {/* Theme Switcher */}
        <ThemeToggle />

        {/* Notifications Icon with Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 transition-all duration-200 focus:outline-none relative"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-600 dark:bg-indigo-500"></span>
              </span>
            )}
          </button>

          {/* Dropdown Box */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white border border-slate-200 shadow-xl dark:bg-slate-900 dark:border-slate-800 py-2 overflow-hidden z-30 transition-all duration-300">
              <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-sm font-bold text-slate-800 dark:text-white">Notifications</span>
                {unreadCount > 0 && (
                  <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-semibold dark:bg-indigo-950/50 dark:text-indigo-400">
                    {unreadCount} Unread
                  </span>
                )}
              </div>

              {/* List */}
              <div className="max-h-64 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                    <Info className="h-8 w-8 text-slate-300 mb-2" />
                    <p className="text-xs text-slate-400">No notifications yet</p>
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => handleNotificationClick(notif)}
                      className={`flex gap-3 px-4 py-3 border-b border-slate-50 last:border-0 dark:border-slate-800/50 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors ${
                        !notif.is_read ? 'bg-indigo-50/20 dark:bg-indigo-950/10' : ''
                      }`}
                    >
                      <div className="flex-1">
                        <p className={`text-xs ${!notif.is_read ? 'text-slate-800 dark:text-white font-medium' : 'text-slate-500 dark:text-slate-400'}`}>
                          {notif.message}
                        </p>
                        <span className="text-[9px] text-slate-400 mt-1 block">
                          {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      {!notif.is_read && (
                        <button
                          onClick={(e) => handleMarkAsRead(notif.id, e)}
                          className="h-5 w-5 flex items-center justify-center rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-950 text-indigo-600 dark:text-indigo-400"
                          title="Mark as read"
                        >
                          <Check className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating Animated Toasts List */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 max-w-sm pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            onClick={() => {
              if (t.complaintId) navigate(`/complaint/${t.complaintId}`);
            }}
            className="flex items-start gap-3 p-4 rounded-2xl bg-white/95 border border-indigo-100 shadow-2xl backdrop-blur-md dark:bg-slate-900/95 dark:border-indigo-950 pointer-events-auto cursor-pointer translate-x-0 animate-slide-in transition-all duration-300"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
              <Bell className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <h4 className="text-xs font-bold text-slate-800 dark:text-white">Campus Alert</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">{t.message}</p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setToasts((prev) => prev.filter((toast) => toast.id !== t.id));
              }}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </header>
  );
};

export default Navbar;
