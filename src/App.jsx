import { useState, useEffect, useRef, useCallback } from "react";

const PAGE_IMAGE = "/page-bg.svg"; // picture behind the whole game page (public folder; use "/bg.jpg" for your own photo)
const BOARD_IMAGE = "/board-bg.svg"; // picture inside the board where the snake moves (public folder)
const SIZE = 20; // 20 x 20 grid
const CELL = 100 / SIZE; // cell size in % of the board
const START_SNAKE = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
const DIRS = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
};
const KEY_MAP = {
  ArrowUp: "UP", w: "UP", W: "UP",
  ArrowDown: "DOWN", s: "DOWN", S: "DOWN",
  ArrowLeft: "LEFT", a: "LEFT", A: "LEFT",
  ArrowRight: "RIGHT", d: "RIGHT", D: "RIGHT",
};
const FRUITS = [
  { name: "apple", emoji: "🍎", points: 1 },
  { name: "banana", emoji: "🍌", points: 1 },
  { name: "cherry", emoji: "🍒", points: 1 },
  { name: "grapes", emoji: "🍇", points: 1 },
  { name: "watermelon", emoji: "🍉", points: 1 },
];

// Pick a random fruit on a cell the snake is not occupying
function spawnFruit(snake) {
  const taken = new Set(snake.map((s) => `${s.x},${s.y}`));
  const free = [];
  for (let x = 0; x < SIZE; x++)
    for (let y = 0; y < SIZE; y++) if (!taken.has(`${x},${y}`)) free.push({ x, y });
  const cell = free[Math.floor(Math.random() * free.length)];
  const type = FRUITS[Math.floor(Math.random() * FRUITS.length)];
  return { ...cell, ...type };
}

function loadHighScore() {
  try {
    return Number(localStorage.getItem("snake-high-score")) || 0;
  } catch {
    return 0;
  }
}

/* ---------- Game logic hook ---------- */
function useSnakeGame() {
  const [snake, setSnake] = useState(START_SNAKE);
  const [fruit, setFruit] = useState(() => spawnFruit(START_SNAKE));
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(loadHighScore);
  const [newHigh, setNewHigh] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | running | paused | over
  const [wrap, setWrap] = useState(true); // true: wrap around, false: walls kill
  const [eaten, setEaten] = useState(0);

  // Refs hold the latest values so the interval and key handler never go stale
  const snakeRef = useRef(START_SNAKE);
  const fruitRef = useRef(fruit);
  const scoreRef = useRef(0);
  const dirRef = useRef(DIRS.RIGHT); // direction used on the last move
  const nextDirRef = useRef(DIRS.RIGHT); // direction requested by the player
  const wrapRef = useRef(true);
  wrapRef.current = wrap;

  const endGame = useCallback(() => {
    setStatus("over");
    if (scoreRef.current > loadHighScore()) {
      try {
        localStorage.setItem("snake-high-score", String(scoreRef.current));
      } catch {}
      setHighScore(scoreRef.current);
      setNewHigh(true);
    }
  }, []);

  const step = useCallback(() => {
    const dir = nextDirRef.current;
    dirRef.current = dir;
    const body = snakeRef.current;
    let nx = body[0].x + dir.x;
    let ny = body[0].y + dir.y;

    if (wrapRef.current) {
      nx = (nx + SIZE) % SIZE;
      ny = (ny + SIZE) % SIZE;
    } else if (nx < 0 || ny < 0 || nx >= SIZE || ny >= SIZE) {
      return endGame();
    }

    const f = fruitRef.current;
    const ate = nx === f.x && ny === f.y;
    // Growth rule: the tail is dropped on every move unless a fruit was eaten
    const kept = ate ? body : body.slice(0, -1);

    // Game over if the head touches the snake's own body
    if (kept.some((s) => s.x === nx && s.y === ny)) return endGame();

    const next = [{ x: nx, y: ny }, ...kept];
    snakeRef.current = next;
    setSnake(next);

    if (ate) {
      scoreRef.current += f.points;
      setScore(scoreRef.current);
      setEaten((n) => n + 1);
      const nf = spawnFruit(next);
      fruitRef.current = nf;
      setFruit(nf);
    }
  }, [endGame]);

  const start = useCallback(() => {
    snakeRef.current = START_SNAKE;
    dirRef.current = nextDirRef.current = DIRS.RIGHT;
    scoreRef.current = 0;
    const f = spawnFruit(START_SNAKE);
    fruitRef.current = f;
    setSnake(START_SNAKE);
    setFruit(f);
    setScore(0);
    setEaten(0);
    setNewHigh(false);
    setStatus("running");
  }, []);

  const turn = useCallback((name) => {
    const d = DIRS[name];
    const cur = dirRef.current;
    if (d.x === -cur.x && d.y === -cur.y) return; // no direct reversing
    nextDirRef.current = d;
  }, []);

  const togglePause = useCallback(() => {
    setStatus((s) => (s === "running" ? "paused" : s === "paused" ? "running" : s));
  }, []);

  // Game loop: starts slow (350 ms per move) and speeds up after every fruit, down to 100 ms
  const delay = Math.max(100, 350 - eaten * 15);
  useEffect(() => {
    if (status !== "running") return;
    const id = setInterval(step, delay);
    return () => clearInterval(id);
  }, [status, delay, step]);

  // Keyboard controls
  useEffect(() => {
    const onKey = (e) => {
      if (KEY_MAP[e.key]) {
        e.preventDefault();
        turn(KEY_MAP[e.key]);
      } else if (e.key === " ") {
        e.preventDefault();
        if (status === "idle" || status === "over") start();
        else togglePause();
      } else if (e.key === "Enter" && (status === "idle" || status === "over")) {
        start();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [status, start, turn, togglePause]);

  return { snake, fruit, score, highScore, newHigh, status, wrap, setWrap, start, turn, togglePause };
}

/* ---------- Components (Tailwind) ---------- */
const place = (p) => ({ left: `${p.x * CELL}%`, top: `${p.y * CELL}%`, width: `${CELL}%`, height: `${CELL}%` });

const btn =
  "rounded-lg bg-green-300 px-4 py-2 font-bold text-green-950 hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300 disabled:cursor-default disabled:opacity-40";

// Normal snake: green body with darker spots that tapers to the tail, round head, eyes and tongue
function Snake({ segments }) {
  const len = segments.length;
  const head = segments[0];
  const neck = segments[1];
  // Facing direction (also correct when the snake wraps around a wall)
  let dx = head.x - neck.x;
  let dy = head.y - neck.y;
  if (dx > 1) dx = -1;
  if (dx < -1) dx = 1;
  if (dy > 1) dy = -1;
  if (dy < -1) dy = 1;
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);

  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="absolute inset-0 size-full">
      {/* body: drawn tail first so the head end overlaps it */}
      {segments
        .map((s, i) => ({ s, i }))
        .slice(1)
        .reverse()
        .map(({ s, i }) => (
          <g key={i}>
            <circle
              cx={s.x + 0.5}
              cy={s.y + 0.5}
              r={Math.max(0.22, 0.48 - (i / len) * 0.26)}
              fill="#4caf50"
              stroke="#1b5e20"
              strokeWidth="0.06"
            />
            {i % 2 === 0 && <circle cx={s.x + 0.5} cy={s.y + 0.5} r="0.14" fill="#2e7d32" />}
          </g>
        ))}

      {/* head (drawn facing right, then rotated) */}
      <g transform={`translate(${head.x + 0.5} ${head.y + 0.5}) rotate(${angle})`}>
        <path d="M0.6 0 L0.95 0 M0.95 0 L1.12 -0.12 M0.95 0 L1.12 0.12" stroke="#e53935" strokeWidth="0.06" strokeLinecap="round" fill="none" />
        <ellipse cx="0.1" cy="0" rx="0.58" ry="0.46" fill="#43a047" stroke="#1b5e20" strokeWidth="0.06" />
        <circle cx="0.25" cy="-0.22" r="0.11" fill="#fff" />
        <circle cx="0.25" cy="0.22" r="0.11" fill="#fff" />
        <circle cx="0.28" cy="-0.22" r="0.055" fill="#111" />
        <circle cx="0.28" cy="0.22" r="0.055" fill="#111" />
      </g>
    </svg>
  );
}

function Fruit({ fruit }) {
  return (
    <div
      style={place(fruit)}
      title={fruit.name}
      className="absolute flex items-center justify-center text-[clamp(12px,3.6vw,22px)] leading-none"
    >
      {fruit.emoji}
    </div>
  );
}

function Board({ children }) {
  return (
    <div
      className="relative size-full overflow-hidden rounded-xl border-[3px] border-emerald-900"
      style={{
        // top to bottom: grid lines, dark tint (keeps the snake visible), your picture, fallback colour
        backgroundImage: `linear-gradient(#ffffff22 1px, transparent 1px), linear-gradient(90deg, #ffffff22 1px, transparent 1px), linear-gradient(rgba(0,0,0,0.15), rgba(0,0,0,0.15)), url('${BOARD_IMAGE}'), linear-gradient(#0b3d5c, #1d3328)`,
        backgroundSize: "5% 5%, 5% 5%, 100% 100%, cover, 100% 100%",
        backgroundPosition: "0 0, 0 0, 0 0, center, 0 0",
      }}
    >
      {children}
    </div>
  );
}

function ScoreBoard({ score, highScore }) {
  return (
    <div className="flex gap-7 rounded-lg bg-black/50 px-4 py-1 text-lg">
      <span>Score <b className="ml-1 text-2xl">{score}</b></span>
      <span>High score <b className="ml-1 text-2xl">{highScore}</b></span>
    </div>
  );
}

function Overlay({ status, score, highScore, newHigh, onStart }) {
  if (status === "running") return null;
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-xl bg-[#14211b]/90 text-center">
      {status === "over" && (
        <>
          <h2 className="mb-1 text-3xl font-bold">Game over</h2>
          <p>Score: {score}</p>
          <p>High score: {highScore}</p>
          {newHigh && <p className="font-bold text-amber-300">New high score!</p>}
        </>
      )}
      {status === "idle" && <h2 className="mb-1 text-3xl font-bold">Snake</h2>}
      {status === "paused" && <h2 className="mb-1 text-3xl font-bold">Paused</h2>}
      {status === "paused" ? (
        <p>Press Space to resume</p>
      ) : (
        <button className={btn} onClick={onStart}>
          {status === "over" ? "New game" : "Start"}
        </button>
      )}
    </div>
  );
}

export default function App() {
  const g = useSnakeGame();
  const pad = "h-11 w-14 !p-0";
  return (
    <main
      style={{ backgroundImage: `url('${PAGE_IMAGE}'), linear-gradient(#0a1633, #06182b)` }}
      className="flex min-h-screen flex-col items-center gap-3.5 bg-cover bg-center px-3 py-5 text-green-50"
    >
      <ScoreBoard score={g.score} highScore={g.highScore} />
      <div className="relative aspect-square w-[min(92vw,480px)]">
        <Board>
          <Snake segments={g.snake} />
          <Fruit fruit={g.fruit} />
        </Board>
        <Overlay
          status={g.status}
          score={g.score}
          highScore={g.highScore}
          newHigh={g.newHigh}
          onStart={g.start}
        />
      </div>

      <div className="flex flex-col items-center gap-1.5">
        <button className={`${btn} ${pad}`} onClick={() => g.turn("UP")} aria-label="Up">▲</button>
        <div className="flex gap-1.5">
          <button className={`${btn} ${pad}`} onClick={() => g.turn("LEFT")} aria-label="Left">◀</button>
          <button className={`${btn} ${pad}`} onClick={() => g.turn("DOWN")} aria-label="Down">▼</button>
          <button className={`${btn} ${pad}`} onClick={() => g.turn("RIGHT")} aria-label="Right">▶</button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className={btn} onClick={g.togglePause} disabled={g.status !== "running" && g.status !== "paused"}>
          {g.status === "paused" ? "Resume" : "Pause"}
        </button>
        <label className="flex items-center gap-1.5">
          <input type="checkbox" checked={g.wrap} onChange={(e) => g.setWrap(e.target.checked)} />
          Wrap around walls
        </label>
      </div>
      <p className="rounded bg-black/50 px-2 py-0.5 text-sm">Arrow keys or WASD to move, Space to pause, Enter to restart</p>
    </main>
  );
}
