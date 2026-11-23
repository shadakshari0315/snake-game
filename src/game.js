export const SIZE = 20; // 20 x 20 grid
export const CELL = 100 / SIZE; // one cell in % of the board
export const START_SNAKE = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];

export const DIRS = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
};

export const KEY_MAP = {
  ArrowUp: "UP", w: "UP", W: "UP",
  ArrowDown: "DOWN", s: "DOWN", S: "DOWN",
  ArrowLeft: "LEFT", a: "LEFT", A: "LEFT",
  ArrowRight: "RIGHT", d: "RIGHT", D: "RIGHT",
};

// Each fruit has its own point value
export const FRUITS = [
  { name: "Apple", emoji: "🍎", points: 10, color: "#ef4444" },
  { name: "Banana", emoji: "🍌", points: 10, color: "#facc15" },
  { name: "Cherry", emoji: "🍒", points: 15, color: "#e11d48" },
  { name: "Grapes", emoji: "🍇", points: 20, color: "#a855f7" },
  { name: "Watermelon", emoji: "🍉", points: 25, color: "#22c55e" },
];

// Position of a grid cell as CSS percentages
export const place = (p) => ({
  left: `${p.x * CELL}%`,
  top: `${p.y * CELL}%`,
  width: `${CELL}%`,
  height: `${CELL}%`,
});

// Random fruit on a cell the snake does not occupy; null when the board is full
export function spawnFruit(snake) {
  const taken = new Set(snake.map((s) => `${s.x},${s.y}`));
  const free = [];
  for (let x = 0; x < SIZE; x++)
    for (let y = 0; y < SIZE; y++) if (!taken.has(`${x},${y}`)) free.push({ x, y });
  if (free.length === 0) return null;
  const cell = free[Math.floor(Math.random() * free.length)];
  const type = FRUITS[Math.floor(Math.random() * FRUITS.length)];
  return { ...cell, ...type, id: `${Date.now()}-${Math.random()}` };
}

/* ---------- Leaderboard (top 5, saved in localStorage) ---------- */
const LB_KEY = "snake-leaderboard";

export function loadLeaderboard() {
  try {
    const list = JSON.parse(localStorage.getItem(LB_KEY));
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function saveLeaderboard(list) {
  try {
    localStorage.setItem(LB_KEY, JSON.stringify(list));
  } catch {}
}

export const qualifies = (score, list) =>
  score > 0 && (list.length < 5 || score > list[list.length - 1].score);