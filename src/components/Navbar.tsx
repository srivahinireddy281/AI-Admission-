import React, { useState, useEffect } from 'react';
import { Bell, LogOut, ShieldAlert, BookOpen, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { User, Notification } from '../types';
import { api } from '../services/api';

interface NavbarProps {
  user: User;
  onLogout: () => void;
}

export default function Navbar({ user, onLogout }: NavbarProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [time, setTime] = useState<string>(new Date().toISOString());

  // Dynamic ticking UTC clock for academic audit tracking
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toISOString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchNotifications = async () => {
    try {
      const data = await api.getNotifications();
      setNotifications(data);
    } catch (err) {
      console.error('Failed to update navbar notification panel', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // Poll notifications
    return () => clearInterval(interval);
  }, []);

  const handleNotificationsRead = async () => {
    try {
      await api.markNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Failed to change notifications state', err);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const roleLabels = {
    admin: { bg: 'bg-indigo-50 border-indigo-200 text-indigo-700', label: 'Primary Admin' },
    officer: { bg: 'bg-amber-50 border-amber-200 text-amber-700', label: 'Admission Officer' },
    student: { bg: 'bg-emerald-50 border-emerald-200 text-emerald-700', label: 'Registered Candidate' },
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Institutional Branding */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white shadow-md shadow-indigo-100">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-sans text-base font-bold tracking-tight text-slate-900">
              AI-Admission
            </h1>
            <p className="font-mono text-[10px] tracking-wider text-slate-500 uppercase">
              University Portal
            </p>
          </div>
        </div>

        {/* Central status bar */}
        <div className="hidden md:flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50/50 px-3 py-1 font-mono text-[11px] text-slate-600 shadow-sm">
          <Clock className="h-3.5 w-3.5 text-slate-400" />
          <span>System UTC: {time.substring(11, 19)}</span>
        </div>

        {/* User Identity Toolbar */}
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="font-sans text-sm font-medium text-slate-900">
              {user.name}
            </span>
            <span className={`rounded border px-1.5 py-0.5 font-mono text-[9px] tracking-wider uppercase font-semibold ${roleLabels[user.role].bg}`}>
              {roleLabels[user.role].label}
            </span>
          </div>

          {/* Notifications Trigger */}
          <div className="relative">
            <button
              onClick={() => {
                setShowDropdown(!showDropdown);
                if (!showDropdown && unreadCount > 0) {
                  handleNotificationsRead();
                }
              }}
              className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-all hover:bg-slate-50 hover:text-slate-900 focus:outline-none"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 font-mono text-[10px] font-bold text-white shadow-md shadow-rose-100 pulse-glow">
                  {unreadCount}
                </span>
              )}
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl ring-1 ring-black/5">
                <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2 pb-3">
                  <h3 className="font-sans text-xs font-bold text-slate-800">
                    Notifications Panel
                  </h3>
                  {unreadCount > 0 && (
                    <span className="rounded bg-sky-50 px-1.5 py-0.5 font-mono text-[9px] font-bold text-sky-700 uppercase">
                      {unreadCount} New
                    </span>
                  )}
                </div>
                <div className="max-h-60 overflow-y-auto py-1">
                  {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-6 text-center">
                      <CheckCircle className="h-8 w-8 text-slate-300" />
                      <p className="mt-2 font-sans text-xs text-slate-500">
                        Dossier clear: No notifications
                      </p>
                    </div>
                  ) : (
                    notifications.map(n => (
                      <div
                        key={n.id}
                        className={`flex gap-3 rounded-xl p-2.5 transition-colors hover:bg-slate-50 ${!n.isRead ? 'bg-sky-50/40' : ''}`}
                      >
                        <div className="mt-0.5">
                          {n.message.toLowerCase().includes('approve') ? (
                            <CheckCircle className="h-4 w-4 text-emerald-500" />
                          ) : n.message.toLowerCase().includes('reject') ? (
                            <ShieldAlert className="h-4 w-4 text-rose-500" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-amber-500" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-sans text-xs leading-relaxed text-slate-700">
                            {n.message}
                          </p>
                          <span className="font-mono text-[9px] text-slate-400">
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Secure Logout Trigger */}
          <button
            onClick={onLogout}
            id="btn_navbar_logout"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-rose-100 bg-rose-50/50 text-rose-600 transition-all hover:bg-rose-100 hover:text-rose-700"
          >
            <LogOut className="h-4 w-4" />
          </button>

        </div>
      </div>
    </header>
  );
}
