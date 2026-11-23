import { useState, useEffect, useRef, useCallback } from "react";
import {
  SIZE, START_SNAKE, DIRS, KEY_MAP, spawnFruit,
  loadLeaderboard, saveLeaderboard, qualifies,
} from "./game";

export default function useSnakeGame() {
  const [snake, setSnake] = useState(START_SNAKE);
  const [fruit, setFruit] = useState(() => spawnFruit(START_SNAKE));
  const [score, setScore] = useState(0);
  const [leaderboard, setLeaderboard] = useState(loadLeaderboard);
  const [status, setStatus] = useState("idle"); // idle | running | paused | over
  const [wrap, setWrap] = useState(true); // true: wrap around walls, false: walls end the game
  const [eaten, setEaten] = useState(0);
  const [result, setResult] = useState({ newHigh: false, canSave: false, won: false });
  const [pops, setPops] = useState([]); // floating "+10" labels + burst effect
  const [prev, setPrev] = useState(START_SNAKE); // snake before the last move (used to animate sliding)
  const [smooth, setSmooth] = useState(false); // false right after a reset so the snake does not slide back to the start
  const [fed, setFed] = useState([]); // body segments currently "carrying" a swallowed fruit

  // Refs always hold the latest values, so the timer and key handler never read stale state
  const snakeRef = useRef(START_SNAKE);
  const fruitRef = useRef(fruit);
  const scoreRef = useRef(0);
  const dirRef = useRef(DIRS.RIGHT); // direction of the last move
  const queueRef = useRef([]); // buffered turns (max 2) so quick key presses are not lost
  const wrapRef = useRef(wrap);
  wrapRef.current = wrap;

  const endGame = useCallback((won = false) => {
    const board = loadLeaderboard();
    const s = scoreRef.current;
    setResult({ newHigh: s > 0 && s > (board[0]?.score ?? 0), canSave: qualifies(s, board), won });
    setStatus("over");
  }, []);

  const step = useCallback(() => {
    // 1. take the next buffered turn, if any
    if (queueRef.current.length) dirRef.current = queueRef.current.shift();
    const dir = dirRef.current;
    const body = snakeRef.current;

    // 2. new head position
    let nx = body[0].x + dir.x;
    let ny = body[0].y + dir.y;
    if (wrapRef.current) {
      nx = (nx + SIZE) % SIZE;
      ny = (ny + SIZE) % SIZE;
    } else if (nx < 0 || ny < 0 || nx >= SIZE || ny >= SIZE) {
      return endGame();
    }

    // 3. growth rule: the tail is removed on every move unless a fruit was eaten
    const f = fruitRef.current;
    const ate = !!f && nx === f.x && ny === f.y;
    const kept = ate ? body : body.slice(0, -1);

    // 4. collision: head touching any body segment ends the game
    if (kept.some((s) => s.x === nx && s.y === ny)) return endGame();

    // 5. move
    const next = [{ x: nx, y: ny }, ...kept];
    snakeRef.current = next;
    setPrev(body);
    setSmooth(true);
    setSnake(next);
    setFed((f) => {
      const moved = f.map((i) => i + 1).filter((i) => i < next.length);
      return ate ? [0, ...moved] : moved;
    });

    // 6. eat
    if (ate) {
      scoreRef.current += f.points;
      setScore(scoreRef.current);
      setEaten((n) => n + 1);
      const pop = { id: f.id, x: f.x, y: f.y, points: f.points, color: f.color };
      setPops((p) => [...p.slice(-3), pop]);
      setTimeout(() => setPops((p) => p.filter((q) => q.id !== pop.id)), 800);

      const nf = spawnFruit(next);
      fruitRef.current = nf;
      setFruit(nf);
      if (!nf) endGame(true); // the whole board is filled: the player wins
    }
  }, [endGame]);

  const start = useCallback(() => {
    snakeRef.current = START_SNAKE;
    dirRef.current = DIRS.RIGHT;
    queueRef.current = [];
    scoreRef.current = 0;
    const f = spawnFruit(START_SNAKE);
    fruitRef.current = f;
    setSnake(START_SNAKE);
    setPrev(START_SNAKE);
    setSmooth(false);
    setFed([]);
    setFruit(f);
    setScore(0);
    setEaten(0);
    setPops([]);
    setResult({ newHigh: false, canSave: false, won: false });
    setStatus("running");
  }, []);

  const turn = useCallback((name) => {
    const d = DIRS[name];
    const q = queueRef.current;
    const last = q.length ? q[q.length - 1] : dirRef.current;
    const reverse = d.x === -last.x && d.y === -last.y;
    const same = d.x === last.x && d.y === last.y;
    if (reverse || same) return; // never reverse into itself
    if (q.length < 2) q.push(d);
  }, []);

  const togglePause = useCallback(() => {
    setStatus((s) => (s === "running" ? "paused" : s === "paused" ? "running" : s));
  }, []);

  const saveScore = useCallback((name) => {
    const clean = name.trim().slice(0, 12) || "Player";
    try { localStorage.setItem("snake-player", clean); } catch {}
    const next = [...loadLeaderboard(), { name: clean, score: scoreRef.current }]
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
    saveLeaderboard(next);
    setLeaderboard(next);
    setResult((r) => ({ ...r, canSave: false }));
  }, []);

  const skipSave = useCallback(() => setResult((r) => ({ ...r, canSave: false })), []);

  // Game loop: starts slow (350 ms) and speeds up with every fruit, down to 90 ms
  const delay = Math.max(90, 350 - eaten * 15);
  useEffect(() => {
    if (status !== "running") return;
    const id = setInterval(step, delay);
    return () => clearInterval(id);
  }, [status, delay, step]);

  // Keyboard controls
  useEffect(() => {
    const locked = status === "over" && result.canSave; // waiting for a name: keys belong to the form
    const typing = (e) => e.target.tagName === "INPUT" && e.target.type === "text";
    const onKeyDown = (e) => {
      if (typing(e)) return;
      if (KEY_MAP[e.key]) {
        e.preventDefault();
        turn(KEY_MAP[e.key]);
      } else if (e.key === " ") {
        e.preventDefault();
        if (locked) return;
        if (status === "idle" || status === "over") start();
        else togglePause();
      } else if (e.key === "Enter" && !locked && (status === "idle" || status === "over")) {
        e.preventDefault();
        start();
      }
    };
    const onKeyUp = (e) => { if (e.key === " " && !typing(e)) e.preventDefault(); };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [status, result.canSave, start, turn, togglePause]);

  return {
    snake, fruit, score, leaderboard, status, wrap, setWrap, result, pops,
    prev, smooth, fed, eaten, delay,
    highScore: leaderboard[0]?.score ?? 0,
    level: Math.min(eaten, 18) + 1,
    start, turn, togglePause, saveScore, skipSave,
  };
}