import { useState } from "react";
import { Leaderboard } from "./ScoreBoard";

export const btn =
  "rounded-xl bg-amber-400 px-5 py-2 font-bold text-slate-900 shadow hover:brightness-110 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:opacity-40";

function savedName() {
  try { return localStorage.getItem("snake-player") || ""; } catch { return ""; }
}

export default function GameOverModal({ score, highScore, result, leaderboard, onSave, onSkip, onRestart }) {
  const [name, setName] = useState(savedName);
  return (
    <div className="fade-in absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 rounded-2xl bg-slate-950/90 p-4 text-center text-white">
      <h2 className="text-3xl font-black">{result.won ? "You win!" : "Game over"}</h2>
      {result.won && <p>You filled the whole board.</p>}
      <p className="text-lg">Score: <b>{score}</b> &nbsp; High score: <b>{highScore}</b></p>
      {result.newHigh && <p className="font-bold text-amber-300">New high score!</p>}

      {result.canSave ? (
        <div className="mt-2 flex flex-col items-center gap-2">
          <p className="text-sm">You made the top 5. Enter your name:</p>
          <input
            autoFocus
            type="text"
            maxLength={12}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSave(name)}
            placeholder="Your name"
            className="w-44 rounded-lg bg-white/15 px-3 py-2 text-center outline-none ring-amber-300 focus:ring-2"
          />
          <div className="flex gap-2">
            <button className={btn} onClick={() => onSave(name)}>Save score</button>
            <button className="rounded-xl bg-white/15 px-4 py-2 font-bold hover:bg-white/25" onClick={onSkip}>Skip</button>
          </div>
        </div>
      ) : (
        <>
          <div className="mt-1 scale-90"><Leaderboard list={leaderboard} /></div>
          <button className={btn} onClick={onRestart}>New game</button>
          <p className="text-xs text-slate-400">or press Enter</p>
        </>
      )}
    </div>
  );
}