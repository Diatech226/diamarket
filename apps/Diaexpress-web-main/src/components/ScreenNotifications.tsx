import React from 'react';
import { motion } from 'motion/react';
import { Bell, Check, Trash2, ArrowLeft, AlertTriangle, CheckCircle, Info, Flame } from 'lucide-react';
import { NotificationItem } from '../types';

interface ScreenNotificationsProps {
  notifications: NotificationItem[];
  onNavigate: (screen: any) => void;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onClearNotifications: () => void;
}

export default function ScreenNotifications({
  notifications,
  onNavigate,
  onMarkRead,
  onMarkAllRead,
  onClearNotifications,
}: ScreenNotificationsProps) {
  return (
    <div className="max-w-3xl mx-auto py-6 px-4" id="screen-notifications">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => onNavigate('accueil')}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
          id="btn-notif-back"
        >
          <ArrowLeft className="w-4 h-4" /> Retour
        </button>
        <div className="flex gap-2">
          {notifications.some(n => !n.read) && (
            <button
              onClick={onMarkAllRead}
              className="px-3 py-1.5 text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg transition-colors cursor-pointer"
              id="btn-notif-mark-all"
            >
              Tout marquer comme lu
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={onClearNotifications}
              className="px-3 py-1.5 text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
              id="btn-notif-clear-all"
            >
              <Trash2 className="w-3.5 h-3.5" /> Effacer
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-display text-slate-800">Centre de Notifications</h2>
            <p className="text-sm text-slate-500">Alertes sur vos expéditions, taxes de douane et réponses d'assistance</p>
          </div>
        </div>

        {notifications.length === 0 ? (
          <div className="text-center py-12 text-slate-400 space-y-3" id="notif-empty-state">
            <Bell className="w-12 h-12 mx-auto stroke-1" />
            <p className="text-sm">Vous n'avez aucune notification pour le moment.</p>
          </div>
        ) : (
          <div className="space-y-3" id="notif-list">
            {notifications.map((notif) => (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-xl border flex items-start gap-3 transition-all relative ${
                  notif.read 
                    ? 'bg-slate-50/50 border-slate-100 text-slate-600' 
                    : 'bg-indigo-50/30 border-indigo-100 shadow-xs text-slate-800'
                }`}
              >
                {/* Type Indicator Icon */}
                <div className="mt-0.5">
                  {notif.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />}
                  {notif.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />}
                  {notif.type === 'info' && <Info className="w-5 h-5 text-blue-500 shrink-0" />}
                  {notif.type === 'error' && <Flame className="w-5 h-5 text-rose-500 shrink-0" />}
                </div>

                <div className="flex-1 space-y-1 pr-6">
                  <div className="flex items-center gap-2">
                    <h4 className={`text-sm font-bold ${notif.read ? 'text-slate-700' : 'text-slate-900'}`}>
                      {notif.title}
                    </h4>
                    {!notif.read && (
                      <span className="w-2 h-2 bg-indigo-600 rounded-full shrink-0"></span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">{notif.message}</p>
                  <p className="text-[10px] text-slate-400 font-mono mt-1">{notif.date}</p>
                </div>

                {/* Mark read individual */}
                {!notif.read && (
                  <button
                    onClick={() => onMarkRead(notif.id)}
                    className="absolute top-4 right-4 p-1.5 bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-300 rounded-lg shadow-sm transition-all cursor-pointer"
                    title="Marquer comme lu"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
