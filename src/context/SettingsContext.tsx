import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import { AnimatePresence, motion } from 'framer-motion';

/* ---------------- Accent colors ---------------- */
export const ACCENTS = {
  violet: { a: '#8b5cf6', b: '#3b82f6', name: 'Violet' },
  blue: { a: '#3b82f6', b: '#06b6d4', name: 'Ocean' },
  pink: { a: '#ec4899', b: '#a855f7', name: 'Pink' },
  emerald: { a: '#10b981', b: '#14b8a6', name: 'Emerald' },
  orange: { a: '#f97316', b: '#ef4444', name: 'Sunset' },
} as const;
export type AccentKey = keyof typeof ACCENTS;

/* ---------------- Settings model ---------------- */
export interface AppSettings {
  accent: AccentKey;
  theme: 'amoled' | 'dark';
  fontSize: number;
  bubbleStyle: 'rounded' | 'extra';
  language: 'en' | 'fa';
  name: string;
  phone: string;
  username: string;
  notifications: {
    enabled: boolean;
    preview: boolean;
    sound: boolean;
    vibrate: boolean;
  };
  privacy: {
    readReceipts: boolean;
    lastSeen: boolean;
    onlineStatus: boolean;
    passcode: boolean;
    twoStep: boolean;
  };
  data: {
    autoPhotos: boolean;
    autoVoice: boolean;
    dataSaver: boolean;
  };
  cacheMB: number;
}

const DEFAULTS: AppSettings = {
  accent: 'violet',
  theme: 'amoled',
  fontSize: 14,
  bubbleStyle: 'rounded',
  language: 'en',
  name: 'AmirReza',
  phone: '+98 912 345 6789',
  username: '@amirreza',
  notifications: { enabled: true, preview: true, sound: true, vibrate: true },
  privacy: {
    readReceipts: true,
    lastSeen: true,
    onlineStatus: true,
    passcode: false,
    twoStep: false,
  },
  data: { autoPhotos: true, autoVoice: true, dataSaver: false },
  cacheMB: 1240,
};

/* ---------------- Translations ---------------- */
const FA: Record<string, string> = {
  Settings: 'تنظیمات',
  Account: 'حساب کاربری',
  'Privacy & Security': 'حریم خصوصی و امنیت',
  Notifications: 'اعلان‌ها',
  Chats: 'چت‌ها',
  'Data and Storage': 'داده و حافظه',
  Devices: 'دستگاه‌ها',
  Appearance: 'ظاهر',
  Language: 'زبان',
  'About LumoChat': 'درباره LumoChat',
  online: 'آنلاین',
  Calls: 'تماس‌ها',
  Games: 'بازی‌ها',
  'Read Receipts': 'رسید خواندن',
  'Last Seen': 'آخرین بازدید',
  'Online Status': 'وضعیت آنلاین',
  'Passcode Lock': 'قفل رمز',
  'Two-Step Verification': 'تأیید دو مرحله‌ای',
  'Enable Notifications': 'فعال‌سازی اعلان‌ها',
  'Message Preview': 'پیش‌نمایش پیام',
  Sound: 'صدا',
  Vibrate: 'لرزش',
  'Send Test Notification': 'ارسال اعلان آزمایشی',
  Theme: 'تم',
  'Accent Color': 'رنگ اصلی',
  'AMOLED Black': 'مشکی AMOLED',
  Dark: 'تیره',
  'Font Size': 'اندازه فونت',
  'Bubble Style': 'شکل حباب پیام',
  Rounded: 'گرد',
  'Extra Round': 'خیلی گرد',
  'Auto-Download Photos': 'دانلود خودکار عکس',
  'Auto-Download Voice': 'دانلود خودکار ویس',
  'Data Saver': 'صرفه‌جویی داده',
  'Clear Cache': 'پاک کردن کش',
  'Storage Used': 'حافظه مصرف‌شده',
  Name: 'نام',
  Phone: 'شماره تلفن',
  Username: 'نام کاربری',
  'Current Device': 'دستگاه فعلی',
  'Terminate All Other Sessions': 'خروج از همه دستگاه‌های دیگر',
  Version: 'نسخه',
  'Cache cleared!': 'کش پاک شد!',
  'New Message': 'پیام جدید',
  Preview: 'پیش‌نمایش',
};

/* ---------------- Context ---------------- */
interface Toast {
  id: number;
  title: string;
  body: string;
}

interface SettingsCtx {
  settings: AppSettings;
  patch: (p: Partial<AppSettings>) => void;
  patchSection: <K extends 'notifications' | 'privacy' | 'data'>(
    section: K,
    p: Partial<AppSettings[K]>
  ) => void;
  t: (key: string) => string;
  notify: (title: string, body: string) => void;
}

const Ctx = createContext<SettingsCtx | null>(null);

export function useSettings() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useSettings outside provider');
  return ctx;
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const raw = localStorage.getItem('lumo-settings');
      if (raw) return { ...DEFAULTS, ...JSON.parse(raw) };
    } catch {
      /* ignore */
    }
    return DEFAULTS;
  });
  const [toasts, setToasts] = useState<Toast[]>([]);

  /* persist */
  useEffect(() => {
    try {
      localStorage.setItem('lumo-settings', JSON.stringify(settings));
    } catch {
      /* ignore */
    }
  }, [settings]);

  /* apply CSS variables */
  useEffect(() => {
    const root = document.documentElement;
    const acc = ACCENTS[settings.accent];
    root.style.setProperty('--acc1', acc.a);
    root.style.setProperty('--acc2', acc.b);
    const bg = settings.theme === 'amoled' ? '#000000' : '#0d0d16';
    const surface = settings.theme === 'amoled' ? '#131316' : '#181826';
    root.style.setProperty('--bg', bg);
    root.style.setProperty('--surface', surface);
    document.body.style.background = bg;
  }, [settings.accent, settings.theme]);

  const patch = useCallback((p: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...p }));
  }, []);

  const patchSection = useCallback(
    <K extends 'notifications' | 'privacy' | 'data'>(
      section: K,
      p: Partial<AppSettings[K]>
    ) => {
      setSettings((prev) => ({
        ...prev,
        [section]: { ...prev[section], ...p },
      }));
    },
    []
  );

  const t = useCallback(
    (key: string) => (settings.language === 'fa' ? FA[key] ?? key : key),
    [settings.language]
  );

  const notify = useCallback(
    (title: string, body: string) => {
      if (!settings.notifications.enabled) return;
      const id = Date.now();
      setToasts((prev) => [
        ...prev,
        { id, title, body: settings.notifications.preview ? body : '•••' },
      ]);
      /* play a soft beep if sound is on */
      if (settings.notifications.sound) {
        try {
          const AC =
            window.AudioContext ||
            (window as unknown as { webkitAudioContext: typeof AudioContext })
              .webkitAudioContext;
          const ctx = new AC();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.value = 880;
          gain.gain.setValueAtTime(0.08, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);
          osc.connect(gain).connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.4);
        } catch {
          /* ignore */
        }
      }
      if (settings.notifications.vibrate && navigator.vibrate) {
        navigator.vibrate(80);
      }
      setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
      }, 3200);
    },
    [settings.notifications]
  );

  return (
    <Ctx.Provider value={{ settings, patch, patchSection, t, notify }}>
      {children}
      {/* Toast host */}
      <div className="fixed top-4 left-0 right-0 z-[999] flex flex-col items-center gap-2 pointer-events-none px-4">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ y: -60, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -60, opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#16161c]/95 backdrop-blur-xl px-4 py-3 shadow-2xl flex items-center gap-3"
            >
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                style={{
                  background: 'linear-gradient(135deg, var(--acc1), var(--acc2))',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-white text-sm font-semibold truncate">{toast.title}</p>
                <p className="text-gray-400 text-xs truncate">{toast.body}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </Ctx.Provider>
  );
}
