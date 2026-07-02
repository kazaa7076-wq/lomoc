import { MessageCircle, Phone, Gamepad2, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSettings } from '../context/SettingsContext';
import { useChatStore } from '../store/ChatStore';

interface BottomNavProps {
  active: string;
  onChange: (tab: string) => void;
}

const tabs = [
  { id: 'chats', label: 'Chats', icon: MessageCircle },
  { id: 'calls', label: 'Calls', icon: Phone },
  { id: 'games', label: 'Games', icon: Gamepad2 },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function BottomNav({ active, onChange }: BottomNavProps) {
  const { t } = useSettings();
  const { unread } = useChatStore();
  const totalUnread = Object.values(unread).reduce((a, b) => a + b, 0);
  return (
    <div className="shrink-0 bg-(--bg)/80 backdrop-blur-xl border-t border-white/5 px-4 safe-bottom">
      <div className="flex items-center justify-around h-[72px]">
        {tabs.map((tab) => {
          const isActive = active === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className="relative flex flex-col items-center gap-1 py-2 px-4"
            >
              {isActive && (
                <motion.div
                  layoutId="bottomNav"
                  className="absolute -top-1 w-8 h-1 rounded-full"
                  style={{ background: 'linear-gradient(90deg, var(--acc1), var(--acc2))' }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
              <div className="relative">
                <Icon
                  size={22}
                  className={isActive ? '' : 'text-gray-500'}
                  style={isActive ? { color: 'var(--acc1)' } : undefined}
                />
                {tab.id === 'chats' && totalUnread > 0 && (
                  <span
                    className="absolute -top-1.5 -right-2 min-w-4 h-4 px-0.5 rounded-full text-[9px] text-white flex items-center justify-center font-bold"
                    style={{ background: 'var(--acc1)' }}
                  >
                    {totalUnread}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] font-medium ${isActive ? '' : 'text-gray-500'}`}
                style={isActive ? { color: 'var(--acc1)' } : undefined}
              >
                {t(tab.label)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
