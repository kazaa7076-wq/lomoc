import { useState } from 'react';
import { motion } from 'framer-motion';
import { Wifi, WifiOff, Trophy } from 'lucide-react';
import { Mode, Opponent, Matchmaking, useScores, grad } from './games/shared';
import { TicTacToe, RPS, MemoryGame } from './games/ClassicGames';
import {
  DartsGame,
  FootballGame,
  BilliardsGame,
  TennisGame,
  BowlingGame,
} from './games/SportsGames';

type GameId = 'ttt' | 'rps' | 'memory' | 'darts' | 'football' | 'billiards' | 'tennis' | 'bowling';

const GAMES: { id: GameId; emoji: string; title: string; fa: string; desc: string; cat: 'classic' | 'sport' }[] = [
  { id: 'darts', emoji: '🎯', title: 'Darts', fa: 'دارت', desc: '3 throws — highest score wins', cat: 'sport' },
  { id: 'football', emoji: '⚽', title: 'Penalty Shootout', fa: 'فوتبال — پنالتی', desc: 'Shoot & save, 5 rounds', cat: 'sport' },
  { id: 'billiards', emoji: '🎱', title: 'Billiards', fa: 'بیلیارد', desc: 'Time the power bar, 5 shots', cat: 'sport' },
  { id: 'tennis', emoji: '🎾', title: 'Tennis Rally', fa: 'تنیس', desc: 'First to 5 points', cat: 'sport' },
  { id: 'bowling', emoji: '🎳', title: 'Bowling', fa: 'بولینگ', desc: '3 frames — most pins wins', cat: 'sport' },
  { id: 'ttt', emoji: '❌', title: 'Tic Tac Toe', fa: 'دوز', desc: 'Classic 3×3 strategy', cat: 'classic' },
  { id: 'rps', emoji: '✊', title: 'Rock Paper Scissors', fa: 'سنگ کاغذ قیچی', desc: 'First to 3 wins', cat: 'classic' },
  { id: 'memory', emoji: '🧠', title: 'Memory Match', fa: 'بازی حافظه', desc: 'Find all 8 pairs', cat: 'classic' },
];

export default function GamesHub() {
  const [selected, setSelected] = useState<GameId | null>(null);
  const [mode, setMode] = useState<Mode | null>(null);
  const [matching, setMatching] = useState(false);
  const [opponent, setOpponent] = useState<Opponent | null>(null);
  const { scores, record } = useScores();

  const exit = () => {
    setSelected(null);
    setMode(null);
    setMatching(false);
    setOpponent(null);
  };

  const start = (id: GameId, m: Mode) => {
    setSelected(id);
    setMode(m);
    if (m === 'online') setMatching(true);
  };

  if (selected && mode === 'online' && matching) {
    return (
      <Matchmaking
        onFound={(opp) => {
          setOpponent(opp);
          setMatching(false);
        }}
      />
    );
  }

  if (selected && mode && (mode === 'offline' || opponent)) {
    const props = { mode, opponent, onBack: exit, record };
    switch (selected) {
      case 'ttt': return <TicTacToe {...props} />;
      case 'rps': return <RPS {...props} />;
      case 'memory': return <MemoryGame {...props} />;
      case 'darts': return <DartsGame {...props} />;
      case 'football': return <FootballGame {...props} />;
      case 'billiards': return <BilliardsGame {...props} />;
      case 'tennis': return <TennisGame {...props} />;
      case 'bowling': return <BowlingGame {...props} />;
    }
  }

  const totalW = Object.values(scores).reduce((a, s) => a + s.w, 0);
  const totalL = Object.values(scores).reduce((a, s) => a + s.l, 0);

  const renderCard = (g: (typeof GAMES)[number], i: number) => {
    const s = scores[g.id] || { w: 0, l: 0 };
    return (
      <motion.div
        key={g.id}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: i * 0.05 }}
        className="rounded-2xl bg-(--surface) border border-white/5 p-4"
      >
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
            style={{ background: 'linear-gradient(135deg, color-mix(in srgb, var(--acc1) 30%, transparent), color-mix(in srgb, var(--acc2) 30%, transparent))' }}
          >
            {g.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-semibold text-sm">{g.title}</h3>
            <p className="text-gray-500 text-xs truncate">{g.fa} — {g.desc}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[11px] flex items-center gap-1 justify-end text-yellow-400">
              <Trophy size={11} /> {s.w}W
            </p>
            <p className="text-gray-600 text-[11px]">{s.l}L</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => start(g.id, 'offline')}
            className="flex-1 py-2.5 rounded-xl bg-white/5 text-gray-200 text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-white/10"
          >
            <WifiOff size={13} /> آفلاین
          </button>
          <button
            onClick={() => start(g.id, 'online')}
            className="flex-1 py-2.5 rounded-xl text-white text-xs font-semibold flex items-center justify-center gap-1.5"
            style={grad}
          >
            <Wifi size={13} /> آنلاین
          </button>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-(--bg)">
      <div className="shrink-0 safe-top pb-3 px-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white mb-0.5">Games 🎮</h1>
          <p className="text-gray-500 text-sm">آفلاین یا آنلاین بازی کن</p>
        </div>
        <div className="text-right">
          <p className="text-yellow-400 text-sm font-bold flex items-center gap-1 justify-end">
            <Trophy size={13} /> {totalW}
          </p>
          <p className="text-gray-600 text-[11px]">{totalL} losses</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2 mt-1">⚡ Sports</p>
        <div className="space-y-3 mb-5">
          {GAMES.filter((g) => g.cat === 'sport').map(renderCard)}
        </div>
        <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2">🕹️ Classic</p>
        <div className="space-y-3">
          {GAMES.filter((g) => g.cat === 'classic').map((g, i) => renderCard(g, i + 5))}
        </div>
      </div>
    </div>
  );
}
