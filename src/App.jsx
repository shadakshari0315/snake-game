import useSnakeGame from "./useSnakeGame.js";
import { FRUITS } from "./game";
import Board from "./Components/Board";
import Snake from "./Components/Snake";
import Fruit, { ScorePops } from "./Components/Fruit";
import ScoreBoard, { Leaderboard } from "./Components/ScoreBoard";
import GameOverModal, { btn } from "./Components/GameOverModal";

const PAGE_IMAGE = "/page-bg.svg"; // picture behind the whole page (public folder)

function Panel({ children }) {
  return (
    <div className="fade-in absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 rounded-2xl bg-slate-950/85 p-4 text-center text-white">
      {children}
    </div>
  );
}

function DPad({ turn }) {
  const key = `${btn} !flex h-12 w-14 items-center justify-center !p-0 text-xl`;
  return (
    <div className="flex flex-col items-center gap-1.5 lg:hidden">
      <button className={key} onPointerDown={() => turn("UP")} aria-label="Up">▲</button>
      <div className="flex gap-1.5">
        <button className={key} onPointerDown={() => turn("LEFT")} aria-label="Left">◀</button>
        <button className={key} onPointerDown={() => turn("DOWN")} aria-label="Down">▼</button>
        <button className={key} onPointerDown={() => turn("RIGHT")} aria-label="Right">▶</button>
      </div>
    </div>
  );
}

export default function App() {
  const g = useSnakeGame();
  const over = g.status === "over";
  return (
    <main
      style={{ backgroundImage: `url('${PAGE_IMAGE}'), linear-gradient(#0a1633, #06182b)` }}
      className="flex min-h-screen flex-col items-center gap-4 bg-cover bg-center px-3 py-6 text-white"
    >
      <h1 className="text-4xl font-black tracking-tight drop-shadow-[0_2px_6px_rgba(0,0,0,0.7)]">Snake</h1>

      <div className="flex flex-col items-center gap-4 lg:flex-row lg:items-start">
        <div className="flex flex-col items-center gap-3">
          <ScoreBoard score={g.score} highScore={g.highScore} level={g.level} />

          <div className="relative aspect-square w-[min(92vw,480px)]">
            <Board shake={over && !g.result.won}>
              <Snake segments={g.snake} dead={over && !g.result.won} />
              <Fruit fruit={g.fruit} />
              <ScorePops pops={g.pops} />
            </Board>

            {g.status === "idle" && (
              <Panel>
                <h2 className="text-3xl font-black">Ready to play?</h2>
                <p className="text-sm text-slate-300">Eat fruit to grow. Don't touch yourself.</p>
                <ul className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm">
                  {FRUITS.map((f) => (
                    <li key={f.name}>{f.emoji} <b>{f.points}</b></li>
                  ))}
                </ul>
                <button className={btn} onClick={g.start}>Start</button>
                <p className="text-xs text-slate-400">Arrow keys or WASD. Space pauses. Enter restarts.</p>
              </Panel>
            )}

            {g.status === "paused" && (
              <Panel>
                <h2 className="text-3xl font-black">Paused</h2>
                <button className={btn} onClick={g.togglePause}>Resume</button>
              </Panel>
            )}

            {over && (
              <GameOverModal
                score={g.score}
                highScore={g.highScore}
                result={g.result}
                leaderboard={g.leaderboard}
                onSave={g.saveScore}
                onSkip={g.skipSave}
                onRestart={g.start}
              />
            )}
          </div>

          <DPad turn={g.turn} />

          <div className="flex items-center gap-3 rounded-xl bg-black/50 px-4 py-2 backdrop-blur">
            <button
              className={btn}
              onClick={g.togglePause}
              disabled={g.status !== "running" && g.status !== "paused"}
            >
              {g.status === "paused" ? "Resume" : "Pause"}
            </button>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={g.wrap} onChange={(e) => g.setWrap(e.target.checked)} />
              Wrap around walls
            </label>
          </div>
        </div>

        <Leaderboard list={g.leaderboard} />
      </div>
    </main>
  );
}