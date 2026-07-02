import { useState } from 'react';
import {
  User,
  Shield,
  Bell,
  MessageCircle,
  Database,
  Smartphone,
  Palette,
  Globe,
  Info,
  ChevronRight,
  Plus,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettings, ACCENTS } from '../context/SettingsContext';
import SettingsDetail, { SettingsPageKey } from './settings/SettingsDetail';

export default function Settings() {
  const { settings, t } = useSettings();
  const [page, setPage] = useState<SettingsPageKey | null>(null);

  const items: {
    key: SettingsPageKey;
    icon: typeof User;
    label: string;
    value?: string;
  }[] = [
    { key: 'account', icon: User, label: 'Account' },
    {
      key: 'privacy',
      icon: Shield,
      label: 'Privacy & Security',
      value: settings.privacy.passcode ? '🔒' : undefined,
    },
    {
      key: 'notifications',
      icon: Bell,
      label: 'Notifications',
      value: settings.notifications.enabled ? 'On' : 'Off',
    },
    { key: 'chats', icon: MessageCircle, label: 'Chats' },
    {
      key: 'data',
      icon: Database,
      label: 'Data and Storage',
      value:
        settings.cacheMB >= 1024
          ? `${(settings.cacheMB / 1024).toFixed(1)} GB`
          : `${settings.cacheMB} MB`,
    },
    { key: 'devices', icon: Smartphone, label: 'Devices', value: '3' },
    {
      key: 'appearance',
      icon: Palette,
      label: 'Appearance',
      value: ACCENTS[settings.accent].name,
    },
    {
      key: 'language',
      icon: Globe,
      label: 'Language',
      value: settings.language === 'fa' ? 'فارسی' : 'English',
    },
    { key: 'about', icon: Info, label: 'About LumoChat' },
  ];

  return (
    <div className="relative h-full overflow-hidden bg-(--bg)">
      {/* main list */}
      <div className="flex flex-col h-full">
        <div className="shrink-0 safe-top pb-4 px-4">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-bold text-white">{t('Settings')}</h1>
            <button className="w-10 h-10 flex items-center justify-center text-gray-400">
              <Plus size={22} />
            </button>
          </div>

          {/* Profile */}
          <button
            onClick={() => setPage('account')}
            className="w-full flex items-center gap-4 text-left"
          >
            <div className="relative">
              <img
                src="https://i.pravatar.cc/150?u=amirreza"
                alt={settings.name}
                className="w-16 h-16 rounded-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://ui-avatars.com/api/?name=' +
                    encodeURIComponent(settings.name) +
                    '&background=7c3aed&color=fff';
                }}
              />
              {settings.privacy.onlineStatus && (
                <span className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-(--bg)" />
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-white font-semibold text-lg">{settings.name}</h2>
              {settings.privacy.onlineStatus ? (
                <p className="text-sm" style={{ color: 'var(--acc1)' }}>
                  {t('online')}
                </p>
              ) : (
                <p className="text-gray-500 text-sm">{settings.phone}</p>
              )}
            </div>
            <ChevronRight size={18} className="text-gray-600" />
          </button>
        </div>

        {/* Settings List */}
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          <div className="space-y-1">
            {items.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.button
                  key={item.key}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.04 }}
                  onClick={() => setPage(item.key)}
                  className="w-full flex items-center gap-4 px-3 py-3.5 rounded-xl hover:bg-white/5 transition-colors text-left"
                >
                  <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-gray-400">
                    <Icon size={18} />
                  </div>
                  <span className="flex-1 text-white text-sm font-medium">
                    {t(item.label)}
                  </span>
                  {item.value && (
                    <span className="text-gray-500 text-sm">{item.value}</span>
                  )}
                  <ChevronRight size={16} className="text-gray-600" />
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {/* detail overlay */}
      <AnimatePresence>
        {page && (
          <motion.div
            key={page}
            className="absolute inset-0 z-20"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
          >
            <SettingsDetail page={page} onBack={() => setPage(null)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
