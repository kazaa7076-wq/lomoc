import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Wifi, WifiOff, RotateCcw } from 'lucide-react';

export type Mode = 'offline' | 'online';
export interface Opponent {
  name: string;
  avatar: string;
}

export const OPPONENTS: Opponent[] = [
  { name: 'Max', avatar: 'https://i.pravatar.cc/100?u=max' },
  { name: 'Sara', avatar: 'https://i.pravatar.cc/100?u=sara' },
  { name: 'Nima', avatar: 'https://i.pravatar.cc/100?u=nima' },
  { name: 'Emma', avatar: 'https://i.pravatar.cc/100?u=emma2' },
];

export const grad = { background: 'linear-gradient(90deg, var(--acc1), var(--acc2))' };

export interface GameProps {
  mode: Mode;
  opponent: Opponent | null;
  onBack: () => void;
  record: (game: string, win: boolean) => void;
}

export function useScores() {
  const [scores, setScores] = useState<Record<string, { w: number; l: number }>>(() => {
    try {
      return JSON.parse(localStorage.getItem('lumo-scores') || '{}');
    } catch {
      return {};
    }
  });
  const record = useCallback((game: string, win: boolean) => {
    setScores((s) => {
      const cur = s[game] || { w: 0, l: 0 };
      const next = { ...s, [game]: { w: cur.w + (win ? 1 : 0), l: cur.l + (win ? 0 : 1) } };
      try {
        localStorage.setItem('lumo-scores', JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);
  return { scores, record };
}

export function ResultBanner({
  result,
  onRestart,
  onExit,
}: {
  result: 'win' | 'lose' | 'draw';
  onRestart: () => void;
  onExit: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="absolute inset-0 z-30 bg-black/70 backdrop-blur-sm flex items-center justify-center"
    >
      <div className="bg-[#16161c] border border-white/10 rounded-3xl p-8 text-center w-64">
        <div className="text-5xl mb-3">
          {result === 'win' ? '🏆' : result === 'lose' ? '😢' : '🤝'}
        </div>
        <h3 className="text-white font-bold text-xl mb-1">
          {result === 'win' ? 'You Win!' : result === 'lose' ? 'You Lose!' : 'Draw!'}
        </h3>
        <p className="text-gray-500 text-xs mb-5">
          {result === 'win' ? 'برنده شدی! 🎉' : result === 'lose' ? 'باختی! دوباره تلاش کن' : 'مساوی شد!'}
        </p>
        <button
          onClick={onRestart}
          className="w-full py-2.5 rounded-xl text-white text-sm font-semibold mb-2 flex items-center justify-center gap-2"
          style={grad}
        >
          <RotateCcw size={14} /> Play Again
        </button>
        <button onClick={onExit} className="w-full py-2.5 rounded-xl bg-white/5 text-gray-300 text-sm">
          Exit
        </button>
      </div>
    </motion.div>
  );
}

export function GameHeader({
  title,
  mode,
  opponent,
  onBack,
}: {
  title: string;
  mode: Mode;
  opponent: Opponent | null;
  onBack: () => void;
}) {
  return (
    <div className="shrink-0 safe-top pb-3 px-4 border-b border-white/5 flex items-center gap-2">
      <button onClick={onBack} className="w-10 h-10 flex items-center justify-center text-gray-400">
        <ArrowLeft size={22} />
      </button>
      <div className="flex-1">
        <h2 className="text-white font-bold">{title}</h2>
        <p className="text-xs flex items-center gap-1 text-gray-500">
          {mode === 'online' ? (
            <>
              <Wifi size={11} className="text-green-400" />
              <span className="text-green-400">Online</span>
              {opponent && <span>— vs {opponent.name}</span>}
            </>
          ) : (
            <>
              <WifiOff size={11} /> Offline — vs AI
            </>
          )}
        </p>
      </div>
      {opponent && (
        <img src={opponent.avatar} alt="" className="w-9 h-9 rounded-full object-cover ring-2 ring-green-400/40" />
      )}
    </div>
  );
}

export function Matchmaking({ onFound }: { onFound: (opp: Opponent) => void }) {
  const [found, setFound] = useState<Opponent | null>(null);
  useEffect(() => {
    const t1 = setTimeout(() => {
      const opp = OPPONENTS[Math.floor(Math.random() * OPPONENTS.length)];
      setFound(opp);
      setTimeout(() => onFound(opp), 1100);
    }, 2200);
    return () => clearTimeout(t1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col h-full bg-(--bg) items-center justify-center px-6">
      {found ? (
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
          <img src={found.avatar} alt="" className="w-20 h-20 rounded-full mx-auto mb-4 ring-4 ring-green-400/50" />
          <h3 className="text-white font-bold text-lg mb-1">Opponent found!</h3>
          <p className="text-sm" style={{ color: 'var(--acc1)' }}>{found.name}</p>
        </motion.div>
      ) : (
        <>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
            className="w-16 h-16 rounded-full border-4 border-white/10 mb-6"
            style={{ borderTopColor: 'var(--acc1)' }}
          />
          <h3 className="text-white font-semibold mb-1">Finding opponent…</h3>
          <p className="text-gray-500 text-sm">در حال یافتن حریف آنلاین</p>
        </>
      )}
    </div>
  );
}

/* oscillating value hook (for aim/power bars) */
export function useOscillator(running: boolean, speed = 2.2) {
  const [v, setV] = useState(0); // 0..100
  useEffect(() => {
    if (!running) return;
    let raf: number;
    const start = performance.now();
    const tick = (t: number) => {
      const s = (t - start) / 1000;
      setV(50 + 50 * Math.sin(s * speed * Math.PI));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [running, speed]);
  return v;
}
