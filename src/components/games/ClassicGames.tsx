import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords } from 'lucide-react';
import { GameProps, GameHeader, ResultBanner } from './shared';

/* ================= Tic Tac Toe ================= */
const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

function winnerOf(b: (string | null)[]) {
  for (const [a, c, d] of LINES) {
    if (b[a] && b[a] === b[c] && b[a] === b[d]) return b[a];
  }
  return b.every(Boolean) ? 'draw' : null;
}

function aiMove(b: (string | null)[]): number {
  const tryFind = (mark: string) => {
    for (const [a, c, d] of LINES) {
      const line = [b[a], b[c], b[d]];
      if (line.filter((v) => v === mark).length === 2 && line.includes(null)) {
        return [a, c, d][line.indexOf(null)];
      }
    }
    return -1;
  };
  let m = tryFind('O');
  if (m >= 0) return m;
  m = tryFind('X');
  if (m >= 0) return m;
  if (!b[4]) return 4;
  const corners = [0, 2, 6, 8].filter((i) => !b[i]);
  if (corners.length) return corners[Math.floor(Math.random() * corners.length)];
  const empty = b.map((v, i) => (v ? -1 : i)).filter((i) => i >= 0);
  return empty[Math.floor(Math.random() * empty.length)];
}

export function TicTacToe({ mode, opponent, onBack, record }: GameProps) {
  const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null));
  const [myTurn, setMyTurn] = useState(true);
  const [result, setResult] = useState<'win' | 'lose' | 'draw' | null>(null);
  const doneRef = useRef(false);

  const finish = useCallback(
    (w: string) => {
      if (doneRef.current) return;
      doneRef.current = true;
      const r = w === 'X' ? 'win' : w === 'O' ? 'lose' : 'draw';
      setTimeout(() => setResult(r), 500);
      if (r !== 'draw') record('ttt', r === 'win');
    },
    [record]
  );

  const play = (i: number) => {
    if (!myTurn || board[i] || result || doneRef.current) return;
    const next = [...board];
    next[i] = 'X';
    setBoard(next);
    const w = winnerOf(next);
    if (w) return finish(w);
    setMyTurn(false);
    const delay = mode === 'online' ? 900 + Math.random() * 1400 : 500;
    setTimeout(() => {
      setBoard((cur) => {
        const w2 = winnerOf(cur);
        if (w2) return cur;
        const m = aiMove(cur);
        const after = [...cur];
        after[m] = 'O';
        const w3 = winnerOf(after);
        if (w3) finish(w3);
        return after;
      });
      setMyTurn(true);
    }, delay);
  };

  const restart = () => {
    setBoard(Array(9).fill(null));
    setMyTurn(true);
    setResult(null);
    doneRef.current = false;
  };

  return (
    <div className="flex flex-col h-full bg-(--bg) relative">
      <GameHeader title="Tic Tac Toe" mode={mode} opponent={opponent} onBack={onBack} />
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <p className="text-sm mb-6" style={{ color: myTurn ? 'var(--acc1)' : '#6b7280' }}>
          {result ? '' : myTurn ? 'Your turn (X)' : `${opponent?.name || 'AI'} is thinking…`}
        </p>
        <div className="grid grid-cols-3 gap-2 w-72">
          {board.map((cell, i) => (
            <motion.button
              key={i}
              whileTap={{ scale: 0.92 }}
              onClick={() => play(i)}
              className="aspect-square rounded-2xl bg-(--surface) border border-white/5 flex items-center justify-center text-4xl font-bold"
            >
              {cell && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  style={{ color: cell === 'X' ? 'var(--acc1)' : '#f87171' }}
                >
                  {cell}
                </motion.span>
              )}
            </motion.button>
          ))}
        </div>
      </div>
      <AnimatePresence>
        {result && <ResultBanner result={result} onRestart={restart} onExit={onBack} />}
      </AnimatePresence>
    </div>
  );
}

/* ================= Rock Paper Scissors ================= */
const HANDS = [
  { id: 'rock', emoji: '✊', beats: 'scissors' },
  { id: 'paper', emoji: '✋', beats: 'rock' },
  { id: 'scissors', emoji: '✌️', beats: 'paper' },
];

export function RPS({ mode, opponent, onBack, record }: GameProps) {
  const [myPick, setMyPick] = useState<string | null>(null);
  const [oppPick, setOppPick] = useState<string | null>(null);
  const [score, setScore] = useState({ me: 0, opp: 0 });
  const [waiting, setWaiting] = useState(false);
  const [result, setResult] = useState<'win' | 'lose' | 'draw' | null>(null);

  const pick = (id: string) => {
    if (waiting || result) return;
    setMyPick(id);
    setWaiting(true);
    const delay = mode === 'online' ? 800 + Math.random() * 1500 : 600;
    setTimeout(() => {
      const opp = HANDS[Math.floor(Math.random() * 3)].id;
      setOppPick(opp);
      setWaiting(false);
      const mine = HANDS.find((h) => h.id === id)!;
      let me = score.me;
      let op = score.opp;
      if (opp !== id) {
        if (mine.beats === opp) me++;
        else op++;
      }
      setScore({ me, opp: op });
      if (me >= 3 || op >= 3) {
        const r = me >= 3 ? 'win' : 'lose';
        setTimeout(() => setResult(r), 700);
        record('rps', r === 'win');
      } else {
        setTimeout(() => {
          setMyPick(null);
          setOppPick(null);
        }, 1200);
      }
    }, delay);
  };

  const restart = () => {
    setMyPick(null);
    setOppPick(null);
    setScore({ me: 0, opp: 0 });
    setResult(null);
  };

  return (
    <div className="flex flex-col h-full bg-(--bg) relative">
      <GameHeader title="Rock Paper Scissors" mode={mode} opponent={opponent} onBack={onBack} />
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="flex items-center gap-6 mb-8">
          <div className="text-center">
            <p className="text-3xl font-bold" style={{ color: 'var(--acc1)' }}>{score.me}</p>
            <p className="text-gray-500 text-xs">You</p>
          </div>
          <span className="text-gray-600 text-sm">First to 3</span>
          <div className="text-center">
            <p className="text-3xl font-bold text-red-400">{score.opp}</p>
            <p className="text-gray-500 text-xs">{opponent?.name || 'AI'}</p>
          </div>
        </div>

        <div className="flex items-center gap-8 mb-10 h-24">
          <motion.div key={myPick || 'e1'} initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-6xl">
            {myPick ? HANDS.find((h) => h.id === myPick)?.emoji : '❔'}
          </motion.div>
          <Swords size={22} className="text-gray-600" />
          <motion.div key={oppPick || 'e2'} initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-6xl">
            {waiting ? (
              <motion.span
                animate={{ rotate: [0, -20, 20, 0] }}
                transition={{ repeat: Infinity, duration: 0.5 }}
                className="inline-block"
              >
                ✊
              </motion.span>
            ) : oppPick ? (
              HANDS.find((h) => h.id === oppPick)?.emoji
            ) : (
              '❔'
            )}
          </motion.div>
        </div>

        <div className="flex gap-4">
          {HANDS.map((h) => (
            <motion.button
              key={h.id}
              whileTap={{ scale: 0.9 }}
              onClick={() => pick(h.id)}
              disabled={waiting}
              className={`w-20 h-20 rounded-2xl text-4xl flex items-center justify-center border-2 transition-colors ${
                myPick === h.id ? 'border-(--acc1) bg-white/10' : 'border-white/10 bg-(--surface)'
              } disabled:opacity-50`}
            >
              {h.emoji}
            </motion.button>
          ))}
        </div>
      </div>
      <AnimatePresence>
        {result && <ResultBanner result={result} onRestart={restart} onExit={onBack} />}
      </AnimatePresence>
    </div>
  );
}

/* ================= Memory Match ================= */
const MEMO_EMOJIS = ['🚀', '🎮', '💜', '🔥', '🌙', '⭐', '🎧', '🍕'];

export function MemoryGame({ mode, opponent, onBack, record }: GameProps) {
  const [cards, setCards] = useState(() => shuffle());
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<Set<number>>(new Set());
  const [moves, setMoves] = useState(0);
  const [oppPairs, setOppPairs] = useState(0);
  const [result, setResult] = useState<'win' | 'lose' | 'draw' | null>(null);
  const lockRef = useRef(false);
  const doneRef = useRef(false);

  function shuffle() {
    return [...MEMO_EMOJIS, ...MEMO_EMOJIS]
      .map((e) => ({ e, r: Math.random() }))
      .sort((a, b) => a.r - b.r)
      .map((c, i) => ({ id: i, emoji: c.e }));
  }

  useEffect(() => {
    if (mode !== 'online' || doneRef.current) return;
    const iv = setInterval(() => {
      setOppPairs((p) => {
        if (doneRef.current) return p;
        const next = Math.min(8, p + (Math.random() < 0.5 ? 1 : 0));
        if (next >= 8 && !doneRef.current) {
          doneRef.current = true;
          setTimeout(() => setResult('lose'), 500);
          record('memory', false);
        }
        return next;
      });
    }, 3000);
    return () => clearInterval(iv);
  }, [mode, record]);

  const flip = (id: number) => {
    if (lockRef.current || flipped.includes(id) || matched.has(id) || result) return;
    const next = [...flipped, id];
    setFlipped(next);
    if (next.length === 2) {
      lockRef.current = true;
      setMoves((m) => m + 1);
      const [a, b] = next;
      if (cards[a].emoji === cards[b].emoji) {
        setTimeout(() => {
          setMatched((prev) => {
            const s = new Set(prev);
            s.add(a);
            s.add(b);
            if (s.size === 16 && !doneRef.current) {
              doneRef.current = true;
              setTimeout(() => setResult('win'), 400);
              record('memory', true);
            }
            return s;
          });
          setFlipped([]);
          lockRef.current = false;
        }, 400);
      } else {
        setTimeout(() => {
          setFlipped([]);
          lockRef.current = false;
        }, 800);
      }
    }
  };

  const restart = () => {
    setCards(shuffle());
    setFlipped([]);
    setMatched(new Set());
    setMoves(0);
    setOppPairs(0);
    setResult(null);
    lockRef.current = false;
    doneRef.current = false;
  };

  const myPairs = matched.size / 2;

  return (
    <div className="flex flex-col h-full bg-(--bg) relative">
      <GameHeader title="Memory Match" mode={mode} opponent={opponent} onBack={onBack} />
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="flex items-center gap-6 mb-5 text-sm">
          <span className="text-gray-400">
            Moves: <b className="text-white">{moves}</b>
          </span>
          <span style={{ color: 'var(--acc1)' }}>
            You: <b>{myPairs}/8</b>
          </span>
          {mode === 'online' && (
            <span className="text-red-400">
              {opponent?.name}: <b>{oppPairs}/8</b>
            </span>
          )}
        </div>
        {mode === 'online' && (
          <div className="w-64 h-1.5 rounded-full bg-white/10 mb-5 overflow-hidden">
            <motion.div className="h-full bg-red-400 rounded-full" animate={{ width: `${(oppPairs / 8) * 100}%` }} />
          </div>
        )}
        <div className="grid grid-cols-4 gap-2">
          {cards.map((card) => {
            const isUp = flipped.includes(card.id) || matched.has(card.id);
            return (
              <motion.button
                key={card.id}
                whileTap={{ scale: 0.92 }}
                onClick={() => flip(card.id)}
                className="w-16 h-16 rounded-xl flex items-center justify-center text-2xl border"
                animate={{ rotateY: isUp ? 0 : 180 }}
                style={{
                  background: matched.has(card.id)
                    ? 'color-mix(in srgb, var(--acc1) 25%, transparent)'
                    : isUp
                    ? 'var(--surface)'
                    : 'linear-gradient(135deg, var(--acc1), var(--acc2))',
                  borderColor: 'rgba(255,255,255,0.08)',
                }}
              >
                {isUp ? card.emoji : ''}
              </motion.button>
            );
          })}
        </div>
      </div>
      <AnimatePresence>
        {result && <ResultBanner result={result} onRestart={restart} onExit={onBack} />}
      </AnimatePresence>
    </div>
  );
}
