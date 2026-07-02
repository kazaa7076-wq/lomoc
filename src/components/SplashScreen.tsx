import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Shield, Sparkles, Bot, Download } from 'lucide-react';

interface SplashScreenProps {
  onEnter: () => void;
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function SplashScreen({ onEnter }: SplashScreenProps) {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setInstallEvent(null);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const install = async () => {
    if (!installEvent) return;
    await installEvent.prompt();
    const choice = await installEvent.userChoice;
    if (choice.outcome === 'accepted') setInstalled(true);
    setInstallEvent(null);
  };
  const features = [
    { icon: Zap, label: 'سریع و هوشمند', color: 'text-cyan-400' },
    { icon: Shield, label: 'امن و خصوصی', color: 'text-blue-400' },
    { icon: Bot, label: 'دستیار هوشمند', color: 'text-purple-400' },
    { icon: Sparkles, label: 'امکانات پیشرفته', color: 'text-pink-400' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-full w-full bg-black flex flex-col items-center justify-center px-6 relative overflow-hidden"
    >
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-64 h-64 bg-purple-600/20 rounded-full blur-[80px]" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-64 h-64 bg-blue-600/20 rounded-full blur-[80px]" />

      {/* Logo */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative mb-8"
      >
        <div className="w-32 h-32 rounded-full flex items-center justify-center relative">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 opacity-30 blur-md animate-pulse" />
          <div className="absolute inset-0 rounded-full border-2 border-blue-400/50 shadow-[0_0_30px_rgba(59,130,246,0.5)]" />
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" className="relative z-10">
            <path
              d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"
              stroke="url(#grad1)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <circle cx="9" cy="11.5" r="0.8" fill="#60a5fa" />
            <circle cx="12" cy="11.5" r="0.8" fill="#a78bfa" />
            <circle cx="15" cy="11.5" r="0.8" fill="#f472b6" />
            <defs>
              <linearGradient id="grad1" x1="3" y1="3" x2="21" y2="21" gradientUnits="userSpaceOnUse">
                <stop stopColor="#3b82f6" />
                <stop offset="0.5" stopColor="#a855f7" />
                <stop offset="1" stopColor="#ec4899" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </motion.div>

      {/* Title */}
      <motion.h1
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-4xl font-bold text-white mb-2"
        style={{ fontFamily: 'system-ui' }}
      >
        <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          Lumo
        </span>
        <span className="text-white">Chat</span>
      </motion.h1>

      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-gray-400 text-lg mb-10"
        dir="rtl"
      >
        چت هاتو روشن کن.
      </motion.p>

      {/* Features */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="w-full max-w-xs space-y-3"
      >
        {features.map((f, i) => (
          <motion.button
            key={i}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onEnter}
            className="w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors"
          >
            <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center ${f.color}`}>
              <f.icon size={20} />
            </div>
            <span className="text-white text-sm font-medium">{f.label}</span>
          </motion.button>
        ))}
      </motion.div>

      {/* Enter + Install buttons */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-10 flex items-center gap-3"
      >
        <button
          onClick={onEnter}
          className="px-8 py-3 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium text-sm shadow-[0_0_20px_rgba(124,58,237,0.4)] hover:shadow-[0_0_30px_rgba(124,58,237,0.6)] transition-shadow"
        >
          شروع کنید
        </button>
        {installEvent && !installed && (
          <button
            onClick={install}
            className="px-6 py-3 rounded-full bg-white/10 border border-white/20 text-white font-medium text-sm flex items-center gap-2 hover:bg-white/15"
          >
            <Download size={15} />
            نصب اپ
          </button>
        )}
        {installed && (
          <span className="px-5 py-3 rounded-full bg-green-500/15 border border-green-500/30 text-green-400 text-sm">
            ✓ نصب شد
          </span>
        )}
      </motion.div>
    </motion.div>
  );
}
