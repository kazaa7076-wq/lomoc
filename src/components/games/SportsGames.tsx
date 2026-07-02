import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameProps, GameHeader, ResultBanner, grad, useOscillator } from './shared';

type R = 'win' | 'lose' | 'draw';

function decide(me: number, opp: number): R {
  return me > opp ? 'win' : me < opp ? 'lose' : 'draw';
}

/* ==================== DARTS 🎯 ==================== */
export function DartsGame({ mode, opponent, onBack, record }: GameProps) {
  const [throws, setThrows] = useState<{ x: number; y: number; pts: number }[]>([]);
  const [oppScore, setOppScore] = useState<number[]>([]);
  const [phase, setPhase] = useState<'me' | 'opp' | 'done'>('me');
  const [result, setResult] = useState<R | null>(null);
  const running = phase === 'me' && !result;
  const ox = useOscillator(running, 1.7);
  const oy = useOscillator(running, 2.3);

  const myTotal = throws.reduce((a, t) => a + t.pts, 0);
  const oppTotal = oppScore.reduce((a, b) => a + b, 0);

  const throwDart = () => {
    if (phase !== 'me' || throws.length >= 3) return;
    const x = (ox - 50) / 50; // -1..1
    const y = (oy - 50) / 50;
    const d = Math.sqrt(x * x + y * y);
    const pts = d < 0.12 ? 50 : d < 0.3 ? 40 : d < 0.5 ? 30 : d < 0.72 ? 20 : d < 0.95 ? 10 : 0;
    const next = [...throws, { x, y, pts }];
    setThrows(next);
    if (next.length === 3) {
      setPhase('opp');
      // opponent throws with delays
      [0, 1, 2].forEach((i) => {
        setTimeout(() => {
          setOppScore((prev) => {
            const s = [...prev, [10, 20, 20, 30, 30, 40, 50][Math.floor(Math.random() * 7)]];
            if (s.length === 3) {
              const total = s.reduce((a, b) => a + b, 0);
              const myT = next.reduce((a, t) => a + t.pts, 0);
              const r = decide(myT, total);
              setTimeout(() => {
                setPhase('done');
                setResult(r);
                if (r !== 'draw') record('darts', r === 'win');
              }, 800);
            }
            return s;
          });
        }, (i + 1) * (mode === 'online' ? 1400 : 800));
      });
    }
  };

  const restart = () => {
    setThrows([]);
    setOppScore([]);
    setPhase('me');
    setResult(null);
  };

  const cx = 50 + ((ox - 50) / 50) * 46;
  const cy = 50 + ((oy - 50) / 50) * 46;

  return (
    <div className="flex flex-col h-full bg-(--bg) relative">
      <GameHeader title="Darts 🎯" mode={mode} opponent={opponent} onBack={onBack} />
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="flex items-center gap-8 mb-5 text-sm">
          <span style={{ color: 'var(--acc1)' }}>You: <b className="text-lg">{myTotal}</b></span>
          <span className="text-gray-600">Darts: {throws.length}/3</span>
          <span className="text-red-400">{opponent?.name || 'AI'}: <b className="text-lg">{oppTotal}</b></span>
        </div>

        {/* board */}
        <div className="relative w-64 h-64 mb-6">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle cx="50" cy="50" r="48" fill="#1a1a22" stroke="#333" />
            <circle cx="50" cy="50" r="44" fill="#0f3d2e" />
            <circle cx="50" cy="50" r="33" fill="#7a1f1f" />
            <circle cx="50" cy="50" r="23" fill="#0f3d2e" />
            <circle cx="50" cy="50" r="14" fill="#7a1f1f" />
            <circle cx="50" cy="50" r="5.5" fill="#d4af37" />
            {throws.map((t, i) => (
              <circle key={i} cx={50 + t.x * 46} cy={50 + t.y * 46} r="2.2" fill="var(--acc1)" stroke="white" strokeWidth="0.6" />
            ))}
            {running && (
              <g>
                <line x1={cx - 6} y1={cy} x2={cx + 6} y2={cy} stroke="white" strokeWidth="1" />
                <line x1={cx} y1={cy - 6} x2={cx} y2={cy + 6} stroke="white" strokeWidth="1" />
                <circle cx={cx} cy={cy} r="4" fill="none" stroke="white" strokeWidth="0.8" />
              </g>
            )}
          </svg>
        </div>

        {phase === 'me' ? (
          <button onClick={throwDart} className="px-10 py-3.5 rounded-2xl text-white font-bold" style={grad}>
            🎯 Throw!
          </button>
        ) : (
          <p className="text-gray-400 text-sm animate-pulse">
            {phase === 'opp' ? `${opponent?.name || 'AI'} is throwing… (${oppScore.length}/3)` : ''}
          </p>
        )}
      </div>
      <AnimatePresence>
        {result && <ResultBanner result={result} onRestart={restart} onExit={onBack} />}
      </AnimatePresence>
    </div>
  );
}

/* ==================== FOOTBALL ⚽ (Penalty Shootout) ==================== */
const DIRS = ['left', 'center', 'right'] as const;
type Dir = (typeof DIRS)[number];
const DIR_X: Record<Dir, number> = { left: -70, center: 0, right: 70 };

export function FootballGame({ mode, opponent, onBack, record }: GameProps) {
  const [round, setRound] = useState(1);
  const [stage, setStage] = useState<'shoot' | 'anim' | 'save' | 'saveAnim'>('shoot');
  const [score, setScore] = useState({ me: 0, opp: 0 });
  const [ballDir, setBallDir] = useState<Dir | null>(null);
  const [keeperDir, setKeeperDir] = useState<Dir | null>(null);
  const [banner, setBanner] = useState<string | null>(null);
  const [result, setResult] = useState<R | null>(null);

  const finishRound = (me: number, opp: number, r: number) => {
    if (r >= 5) {
      const res = decide(me, opp);
      setTimeout(() => {
        setResult(res);
        if (res !== 'draw') record('football', res === 'win');
      }, 900);
    } else {
      setTimeout(() => {
        setRound(r + 1);
        setStage('shoot');
        setBallDir(null);
        setKeeperDir(null);
        setBanner(null);
      }, 1300);
    }
  };

  const shoot = (dir: Dir) => {
    if (stage !== 'shoot') return;
    const keeper = DIRS[Math.floor(Math.random() * 3)];
    setBallDir(dir);
    setKeeperDir(keeper);
    setStage('anim');
    setTimeout(() => {
      const goal = keeper !== dir;
      setBanner(goal ? '⚽ GOAL!' : '🧤 SAVED!');
      const me = score.me + (goal ? 1 : 0);
      setScore((s) => ({ ...s, me }));
      setTimeout(() => {
        setStage('save');
        setBallDir(null);
        setKeeperDir(null);
        setBanner(null);
      }, 1100);
    }, mode === 'online' ? 900 : 600);
  };

  const dive = (dir: Dir) => {
    if (stage !== 'save') return;
    const shot = DIRS[Math.floor(Math.random() * 3)];
    setBallDir(shot);
    setKeeperDir(dir);
    setStage('saveAnim');
    setTimeout(() => {
      const saved = shot === dir;
      setBanner(saved ? '🧤 YOU SAVED IT!' : '😖 They scored');
      const opp = score.opp + (saved ? 0 : 1);
      setScore((s) => ({ ...s, opp }));
      finishRound(score.me, opp, round);
    }, mode === 'online' ? 900 : 600);
  };

  const restart = () => {
    setRound(1);
    setStage('shoot');
    setScore({ me: 0, opp: 0 });
    setBallDir(null);
    setKeeperDir(null);
    setBanner(null);
    setResult(null);
  };

  const shooting = stage === 'shoot' || stage === 'anim';

  return (
    <div className="flex flex-col h-full bg-(--bg) relative">
      <GameHeader title="Penalty ⚽" mode={mode} opponent={opponent} onBack={onBack} />
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="flex items-center gap-6 mb-4 text-sm">
          <span style={{ color: 'var(--acc1)' }}>You: <b className="text-lg">{score.me}</b></span>
          <span className="text-gray-600">Round {round}/5</span>
          <span className="text-red-400">{opponent?.name || 'AI'}: <b className="text-lg">{score.opp}</b></span>
        </div>

        {/* pitch */}
        <div className="relative w-72 h-44 rounded-2xl overflow-hidden mb-4" style={{ background: 'linear-gradient(#14532d, #166534)' }}>
          {/* goal */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 w-56 h-20 border-4 border-white/80 border-b-0 rounded-t-sm" />
          {/* keeper */}
          <motion.div
            className="absolute top-8 left-1/2 text-3xl"
            animate={{ x: keeperDir ? DIR_X[keeperDir] - 16 : -16, rotate: keeperDir && keeperDir !== 'center' ? (keeperDir === 'left' ? -40 : 40) : 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            🧤
          </motion.div>
          {/* ball */}
          <motion.div
            className="absolute bottom-3 left-1/2 text-2xl"
            animate={ballDir ? { x: DIR_X[ballDir] - 12, y: -78, scale: 0.6 } : { x: -12, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            ⚽
          </motion.div>
          {banner && (
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <span className="text-2xl font-black text-white drop-shadow-lg">{banner}</span>
            </motion.div>
          )}
        </div>

        <p className="text-gray-400 text-xs mb-3">
          {shooting ? '⚽ Shoot — pick a corner!' : '🧤 Now save — pick a dive direction!'}
        </p>
        <div className="flex gap-3">
          {DIRS.map((d) => (
            <button
              key={d}
              onClick={() => (shooting ? shoot(d) : dive(d))}
              disabled={stage === 'anim' || stage === 'saveAnim'}
              className="px-5 py-3 rounded-xl text-white text-sm font-semibold capitalize disabled:opacity-40"
              style={grad}
            >
              {d === 'left' ? '↖ Left' : d === 'center' ? '↑ Center' : '↗ Right'}
            </button>
          ))}
        </div>
      </div>
      <AnimatePresence>
        {result && <ResultBanner result={result} onRestart={restart} onExit={onBack} />}
      </AnimatePresence>
    </div>
  );
}

/* ==================== BILLIARDS 🎱 ==================== */
export function BilliardsGame({ mode, opponent, onBack, record }: GameProps) {
  const [shot, setShot] = useState(0);
  const [me, setMe] = useState(0);
  const [opp, setOpp] = useState(0);
  const [zone] = useState(() => Array.from({ length: 5 }, () => 35 + Math.random() * 35));
  const [locked, setLocked] = useState<number | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [potted, setPotted] = useState(false);
  const [result, setResult] = useState<R | null>(null);
  const running = locked === null && !result && shot < 5;
  const power = useOscillator(running, 1.9);

  const zoneStart = zone[Math.min(shot, 4)];
  const zoneW = 18;

  const strike = () => {
    if (!running) return;
    const p = power;
    setLocked(p);
    const hit = p >= zoneStart && p <= zoneStart + zoneW;
    setPotted(hit);
    setMsg(hit ? '🎱 Potted!' : '❌ Missed!');
    const newMe = me + (hit ? 1 : 0);
    setMe(newMe);
    setTimeout(() => {
      // opponent shot
      const oppHit = Math.random() < (mode === 'online' ? 0.62 : 0.55);
      const newOpp = opp + (oppHit ? 1 : 0);
      setOpp(newOpp);
      setMsg(oppHit ? `${opponent?.name || 'AI'} potted 🎱` : `${opponent?.name || 'AI'} missed ❌`);
      setTimeout(() => {
        const next = shot + 1;
        setShot(next);
        setLocked(null);
        setMsg(null);
        setPotted(false);
        if (next >= 5) {
          const r = decide(newMe, newOpp);
          setResult(r);
          if (r !== 'draw') record('billiards', r === 'win');
        }
      }, 1100);
    }, mode === 'online' ? 1500 : 1000);
  };

  const restart = () => {
    setShot(0);
    setMe(0);
    setOpp(0);
    setLocked(null);
    setMsg(null);
    setPotted(false);
    setResult(null);
  };

  const barVal = locked ?? power;

  return (
    <div className="flex flex-col h-full bg-(--bg) relative">
      <GameHeader title="Billiards 🎱" mode={mode} opponent={opponent} onBack={onBack} />
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="flex items-center gap-6 mb-4 text-sm">
          <span style={{ color: 'var(--acc1)' }}>You: <b className="text-lg">{me}</b></span>
          <span className="text-gray-600">Shot {Math.min(shot + 1, 5)}/5</span>
          <span className="text-red-400">{opponent?.name || 'AI'}: <b className="text-lg">{opp}</b></span>
        </div>

        {/* table */}
        <div className="relative w-72 h-40 rounded-2xl mb-6 border-8 border-[#5b3a1e]" style={{ background: '#0e5c3f' }}>
          {[['-6px', '-6px'], ['-6px', 'calc(100%-14px)'], ['calc(100%-14px)', '-6px'], ['calc(100%-14px)', 'calc(100%-14px)']].map((p, i) => (
            <div key={i} className="absolute w-5 h-5 rounded-full bg-black" style={{ top: p[0].replace('calc(100%-14px)', 'calc(100% - 14px)'), left: p[1].replace('calc(100%-14px)', 'calc(100% - 14px)') }} />
          ))}
          {/* cue ball */}
          <div className="absolute bottom-4 left-8 w-5 h-5 rounded-full bg-white shadow" />
          {/* 8 ball */}
          <motion.div
            className="absolute top-1/2 left-1/2 w-5 h-5 rounded-full bg-black border border-white/40 flex items-center justify-center text-[8px] text-white font-bold"
            animate={potted ? { x: 100, y: -55, scale: 0.3, opacity: 0 } : { x: -10, y: -10, scale: 1, opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            8
          </motion.div>
          {msg && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-black text-white drop-shadow">{msg}</span>
            </motion.div>
          )}
        </div>

        {/* power bar */}
        <div className="w-72 mb-2">
          <div className="relative h-5 rounded-full bg-white/10 overflow-hidden">
            <div
              className="absolute top-0 bottom-0 bg-green-500/40 border-x-2 border-green-400"
              style={{ left: `${zoneStart}%`, width: `${zoneW}%` }}
            />
            <motion.div
              className="absolute top-0 bottom-0 w-1.5 rounded-full bg-white"
              style={{ left: `${barVal}%` }}
            />
          </div>
          <p className="text-gray-500 text-[10px] mt-1 text-center">توپ رو وقتی نشانگر توی محدوده سبزه بزن!</p>
        </div>

        <button onClick={strike} disabled={!running} className="px-10 py-3.5 rounded-2xl text-white font-bold disabled:opacity-40" style={grad}>
          🎱 Strike!
        </button>
      </div>
      <AnimatePresence>
        {result && <ResultBanner result={result} onRestart={restart} onExit={onBack} />}
      </AnimatePresence>
    </div>
  );
}

/* ==================== TENNIS 🎾 ==================== */
export function TennisGame({ mode, opponent, onBack, record }: GameProps) {
  const [me, setMe] = useState(0);
  const [opp, setOpp] = useState(0);
  const [rally, setRally] = useState(0);
  const [zoneStart, setZoneStart] = useState(38);
  const [msg, setMsg] = useState<string | null>(null);
  const [paused, setPaused] = useState(false);
  const [result, setResult] = useState<R | null>(null);
  const running = !paused && !result;
  const marker = useOscillator(running, 1.6 + rally * 0.18);
  const zoneW = Math.max(12, 26 - rally * 2);

  const point = (mine: boolean, text: string) => {
    setPaused(true);
    setMsg(text);
    const newMe = me + (mine ? 1 : 0);
    const newOpp = opp + (mine ? 0 : 1);
    setMe(newMe);
    setOpp(newOpp);
    setTimeout(() => {
      if (newMe >= 5 || newOpp >= 5) {
        const r = newMe >= 5 ? 'win' : 'lose';
        setResult(r);
        record('tennis', r === 'win');
      } else {
        setRally(0);
        setZoneStart(25 + Math.random() * 40);
        setMsg(null);
        setPaused(false);
      }
    }, 1200);
  };

  const swing = () => {
    if (!running) return;
    const hit = marker >= zoneStart && marker <= zoneStart + zoneW;
    if (!hit) {
      point(false, '😖 Out! Point for ' + (opponent?.name || 'AI'));
      return;
    }
    // opponent may miss — chance grows with rally
    const oppMiss = Math.random() < Math.min(0.2 + rally * 0.09, 0.65);
    if (oppMiss) {
      point(true, '🎾 Winner! Your point!');
    } else {
      setRally((r) => r + 1);
      setZoneStart(15 + Math.random() * 55);
      setMsg(null);
    }
  };

  const restart = () => {
    setMe(0);
    setOpp(0);
    setRally(0);
    setZoneStart(38);
    setMsg(null);
    setPaused(false);
    setResult(null);
  };

  return (
    <div className="flex flex-col h-full bg-(--bg) relative">
      <GameHeader title="Tennis 🎾" mode={mode} opponent={opponent} onBack={onBack} />
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="flex items-center gap-6 mb-4 text-sm">
          <span style={{ color: 'var(--acc1)' }}>You: <b className="text-lg">{me}</b></span>
          <span className="text-gray-600">First to 5 • Rally {rally}</span>
          <span className="text-red-400">{opponent?.name || 'AI'}: <b className="text-lg">{opp}</b></span>
        </div>

        {/* court */}
        <div className="relative w-72 h-36 rounded-2xl mb-6 overflow-hidden" style={{ background: '#1d4ed8' }}>
          <div className="absolute inset-3 border-2 border-white/70 rounded" />
          <div className="absolute top-3 bottom-3 left-1/2 w-0.5 bg-white/70" />
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 text-2xl"
            animate={{ left: rally % 2 === 0 ? '15%' : '75%' }}
            transition={{ duration: 0.45, ease: 'easeInOut' }}
          >
            🎾
          </motion.div>
          {msg && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 flex items-center justify-center bg-black/30">
              <span className="text-sm font-black text-white text-center px-4">{msg}</span>
            </motion.div>
          )}
        </div>

        {/* timing bar */}
        <div className="w-72 mb-2">
          <div className="relative h-5 rounded-full bg-white/10 overflow-hidden">
            <div
              className="absolute top-0 bottom-0 bg-green-500/40 border-x-2 border-green-400"
              style={{ left: `${zoneStart}%`, width: `${zoneW}%` }}
            />
            <motion.div className="absolute top-0 bottom-0 w-1.5 rounded-full bg-white" style={{ left: `${marker}%` }} />
          </div>
          <p className="text-gray-500 text-[10px] mt-1 text-center">وقتی نشانگر توی محدوده سبزه، ضربه بزن! هر رالی سخت‌تر می‌شه</p>
        </div>

        <button onClick={swing} disabled={!running} className="px-10 py-3.5 rounded-2xl text-white font-bold disabled:opacity-40" style={grad}>
          🎾 Swing!
        </button>
      </div>
      <AnimatePresence>
        {result && <ResultBanner result={result} onRestart={restart} onExit={onBack} />}
      </AnimatePresence>
    </div>
  );
}

/* ==================== BOWLING 🎳 ==================== */
export function BowlingGame({ mode, opponent, onBack, record }: GameProps) {
  const [frame, setFrame] = useState(0);
  const [myRolls, setMyRolls] = useState<number[]>([]);
  const [oppRolls, setOppRolls] = useState<number[]>([]);
  const [rolling, setRolling] = useState(false);
  const [ballX, setBallX] = useState<number | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [result, setResult] = useState<R | null>(null);
  const running = !rolling && !result && frame < 3;
  const aim = useOscillator(running, 2.0);
  const doneRef = useRef(false);

  const myTotal = myRolls.reduce((a, b) => a + b, 0);
  const oppTotal = oppRolls.reduce((a, b) => a + b, 0);

  const roll = () => {
    if (!running) return;
    setRolling(true);
    const offset = Math.abs(aim - 50); // 0 = perfect
    setBallX(aim);
    const pins = offset < 5 ? 10 : Math.max(0, 10 - Math.round(offset / 5));
    setTimeout(() => {
      setMsg(pins === 10 ? '💥 STRIKE!' : `🎳 ${pins} pins!`);
      const newMy = [...myRolls, pins];
      setMyRolls(newMy);
      setTimeout(() => {
        const oppPins = 4 + Math.floor(Math.random() * 7);
        const newOpp = [...oppRolls, Math.min(10, oppPins)];
        setOppRolls(newOpp);
        setMsg(`${opponent?.name || 'AI'}: ${newOpp[newOpp.length - 1]} pins`);
        setTimeout(() => {
          const next = frame + 1;
          setFrame(next);
          setRolling(false);
          setBallX(null);
          setMsg(null);
          if (next >= 3 && !doneRef.current) {
            doneRef.current = true;
            const mt = newMy.reduce((a, b) => a + b, 0);
            const ot = newOpp.reduce((a, b) => a + b, 0);
            const r = decide(mt, ot);
            setResult(r);
            if (r !== 'draw') record('bowling', r === 'win');
          }
        }, 1100);
      }, mode === 'online' ? 1500 : 1000);
    }, 700);
  };

  const restart = () => {
    setFrame(0);
    setMyRolls([]);
    setOppRolls([]);
    setRolling(false);
    setBallX(null);
    setMsg(null);
    setResult(null);
    doneRef.current = false;
  };

  return (
    <div className="flex flex-col h-full bg-(--bg) relative">
      <GameHeader title="Bowling 🎳" mode={mode} opponent={opponent} onBack={onBack} />
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="flex items-center gap-6 mb-4 text-sm">
          <span style={{ color: 'var(--acc1)' }}>You: <b className="text-lg">{myTotal}</b></span>
          <span className="text-gray-600">Frame {Math.min(frame + 1, 3)}/3</span>
          <span className="text-red-400">{opponent?.name || 'AI'}: <b className="text-lg">{oppTotal}</b></span>
        </div>

        {/* lane */}
        <div className="relative w-56 h-64 rounded-t-3xl rounded-b-xl mb-5 overflow-hidden" style={{ background: 'linear-gradient(#3f2d1d, #5b3a1e)' }}>
          <div className="absolute inset-y-0 left-3 w-1.5 bg-black/30 rounded" />
          <div className="absolute inset-y-0 right-3 w-1.5 bg-black/30 rounded" />
          {/* pins */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 flex flex-col items-center gap-0.5">
            <div className="flex gap-2">{'🎳🎳🎳🎳'.split('🎳').slice(0, 4).map((_, i) => <span key={i} className="text-sm">🎳</span>)}</div>
            <div className="flex gap-2">{[0, 1, 2].map((i) => <span key={i} className="text-sm">🎳</span>)}</div>
            <div className="flex gap-2">{[0, 1].map((i) => <span key={i} className="text-sm">🎳</span>)}</div>
            <span className="text-sm">🎳</span>
          </div>
          {/* ball */}
          <motion.div
            className="absolute text-2xl"
            animate={
              rolling && ballX !== null
                ? { top: 10, left: `${18 + (ballX / 100) * 60}%` }
                : { top: 220, left: running ? `${18 + (aim / 100) * 60}%` : '45%' }
            }
            transition={rolling ? { duration: 0.65, ease: 'easeIn' } : { duration: 0 }}
          >
            🔮
          </motion.div>
          {msg && (
            <motion.div initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} className="absolute inset-0 flex items-center justify-center bg-black/40">
              <span className="text-xl font-black text-white">{msg}</span>
            </motion.div>
          )}
        </div>

        <p className="text-gray-500 text-[10px] mb-2">توپ چپ و راست می‌ره — وسط خط رها کن تا استرایک بزنی!</p>
        <button onClick={roll} disabled={!running} className="px-10 py-3.5 rounded-2xl text-white font-bold disabled:opacity-40" style={grad}>
          🎳 Roll!
        </button>
      </div>
      <AnimatePresence>
        {result && <ResultBanner result={result} onRestart={restart} onExit={onBack} />}
      </AnimatePresence>
    </div>
  );
}
