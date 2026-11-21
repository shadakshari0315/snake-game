const medals = ["🥇", "🥈", "🥉", "4", "5"];

export default function ScoreBoard({ score, highScore, level }) {
  const card = "rounded-xl bg-black/50 px-4 py-2 text-center backdrop-blur";
  return (
    <div className="grid w-[min(92vw,480px)] grid-cols-3 gap-2 text-sm text-slate-200">
      <div className={card}>
        Score
        <div key={score} className="bump block text-2xl font-black text-white">{score}</div>
      </div>
      <div className={card}>
        High score
        <div className="text-2xl font-black text-amber-300">{highScore}</div>
      </div>
      <div className={card}>
        Speed
        <div className="text-2xl font-black text-emerald-300">x{level}</div>
      </div>
    </div>
  );
}

export function Leaderboard({ list }) {
  return (
    <div className="w-[min(92vw,480px)] rounded-2xl bg-black/50 p-4 backdrop-blur lg:w-64">
      <h2 className="mb-2 text-lg font-bold text-amber-300">Top 5 players</h2>
      {list.length === 0 ? (
        <p className="text-sm text-slate-300">No scores yet. Be the first!</p>
      ) : (
        <ol className="space-y-1">
          {list.map((p, i) => (
            <li key={i} className="flex items-center justify-between rounded-lg bg-white/10 px-3 py-1">
              <span>{medals[i]} {p.name}</span>
              <b>{p.score}</b>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}