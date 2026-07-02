import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Phone,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  Video,
  Mic,
  MicOff,
  PhoneOff,
  Volume2,
} from 'lucide-react';

const CALLS = [
  { id: 1, name: 'Alan Smith', avatar: 'https://i.pravatar.cc/150?u=alan', type: 'outgoing', time: 'Today, 9:15 AM', duration: '12:34' },
  { id: 2, name: 'Linda', avatar: 'https://i.pravatar.cc/150?u=linda', type: 'incoming', time: 'Yesterday, 8:02 PM', duration: '45:12' },
  { id: 3, name: 'Emma', avatar: 'https://i.pravatar.cc/150?u=emma2', type: 'missed', time: 'Yesterday, 2:30 PM', duration: '' },
  { id: 4, name: 'Max', avatar: 'https://i.pravatar.cc/150?u=max', type: 'incoming', time: 'Mon, 6:44 PM', duration: '3:05' },
  { id: 5, name: 'Alan Smith', avatar: 'https://i.pravatar.cc/150?u=alan', type: 'missed', time: 'Sun, 11:20 AM', duration: '' },
];

function fmt(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

function InCall({ person, onEnd }: { person: { name: string; avatar: string }; onEnd: () => void }) {
  const [phase, setPhase] = useState<'ringing' | 'active'>('ringing');
  const [seconds, setSeconds] = useState(0);
  const [muted, setMuted] = useState(false);
  const [speaker, setSpeaker] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setPhase('active'), 2500);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (phase !== 'active') return;
    const iv = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(iv);
  }, [phase]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 40 }}
      className="absolute inset-0 z-40 flex flex-col items-center justify-between py-20"
      style={{
        background:
          'radial-gradient(circle at 50% 20%, color-mix(in srgb, var(--acc1) 25%, transparent), var(--bg) 70%)',
      }}
    >
      <div className="flex flex-col items-center mt-8">
        <motion.div
          animate={phase === 'ringing' ? { scale: [1, 1.06, 1] } : {}}
          transition={{ repeat: Infinity, duration: 1.2 }}
          className="relative mb-6"
        >
          <div className="absolute -inset-3 rounded-full border border-white/10" />
          <div className="absolute -inset-6 rounded-full border border-white/5" />
          <img src={person.avatar} alt="" className="w-28 h-28 rounded-full object-cover" />
        </motion.div>
        <h2 className="text-white font-bold text-2xl mb-2">{person.name}</h2>
        <p className="text-gray-400 text-sm">
          {phase === 'ringing' ? 'Ringing…' : fmt(seconds)}
        </p>
        <p className="text-gray-600 text-xs mt-1">🔒 End-to-end encrypted</p>
      </div>

      <div className="flex items-center gap-5">
        <button
          onClick={() => setMuted(!muted)}
          className={`w-14 h-14 rounded-full flex items-center justify-center ${
            muted ? 'bg-white text-black' : 'bg-white/10 text-white'
          }`}
        >
          {muted ? <MicOff size={22} /> : <Mic size={22} />}
        </button>
        <button
          onClick={onEnd}
          className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center text-white shadow-lg shadow-red-500/40"
        >
          <PhoneOff size={26} />
        </button>
        <button
          onClick={() => setSpeaker(!speaker)}
          className={`w-14 h-14 rounded-full flex items-center justify-center ${
            speaker ? 'bg-white text-black' : 'bg-white/10 text-white'
          }`}
        >
          <Volume2 size={22} />
        </button>
      </div>
    </motion.div>
  );
}

export default function CallsScreen() {
  const [calling, setCalling] = useState<{ name: string; avatar: string } | null>(null);

  return (
    <div className="flex flex-col h-full bg-(--bg) relative">
      <div className="shrink-0 safe-top pb-4 px-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">Calls</h1>
        <button
          onClick={() => setCalling({ name: 'Alan Smith', avatar: 'https://i.pravatar.cc/150?u=alan' })}
          className="w-10 h-10 rounded-full flex items-center justify-center text-white"
          style={{ background: 'linear-gradient(135deg, var(--acc1), var(--acc2))' }}
        >
          <Phone size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-4">
        {CALLS.map((call, i) => (
          <motion.div
            key={call.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-3 px-3 py-3 rounded-2xl hover:bg-white/5"
          >
            <img src={call.avatar} alt="" className="w-12 h-12 rounded-full object-cover" />
            <div className="flex-1 min-w-0">
              <h3 className={`font-semibold text-sm ${call.type === 'missed' ? 'text-red-400' : 'text-white'}`}>
                {call.name}
              </h3>
              <p className="text-gray-500 text-xs flex items-center gap-1.5 mt-0.5">
                {call.type === 'outgoing' && <PhoneOutgoing size={11} className="text-green-400" />}
                {call.type === 'incoming' && <PhoneIncoming size={11} style={{ color: 'var(--acc1)' }} />}
                {call.type === 'missed' && <PhoneMissed size={11} className="text-red-400" />}
                {call.time}
                {call.duration && <span>• {call.duration}</span>}
              </p>
            </div>
            <button
              onClick={() => setCalling({ name: call.name, avatar: call.avatar })}
              className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white"
            >
              <Phone size={18} />
            </button>
            <button
              onClick={() => setCalling({ name: call.name, avatar: call.avatar })}
              className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white"
            >
              <Video size={18} />
            </button>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {calling && <InCall person={calling} onEnd={() => setCalling(null)} />}
      </AnimatePresence>
    </div>
  );
}
