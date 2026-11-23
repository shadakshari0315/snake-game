import { place } from "../game";

// The fruit pops in when it appears and bobs gently; keyed by id so the pop replays for each new fruit.
// Each fruit glows in its own colour.
export default function Fruit({ fruit }) {
  if (!fruit) return null;
  return (
    <div
      key={fruit.id}
      style={{ ...place(fruit), filter: `drop-shadow(0 0 6px ${fruit.color}) drop-shadow(0 0 2px ${fruit.color})` }}
      title={`${fruit.name} (+${fruit.points})`}
      className="fruit-pop absolute flex items-center justify-center text-[clamp(14px,4vw,24px)] leading-none"
    >
      <span className="fruit-bob">{fruit.emoji}</span>
    </div>
  );
}

// Ring + sparks in the fruit's colour, shown where a fruit was eaten
export function Bursts({ pops }) {
  return pops.map((p) => (
    <div key={p.id} style={place(p)} className="pointer-events-none absolute z-[5]">
      <span className="ring" style={{ borderColor: p.color }} />
      {Array.from({ length: 8 }, (_, k) => {
        const a = (k / 8) * Math.PI * 2;
        return (
          <span
            key={k}
            className="spark"
            style={{ background: p.color, "--dx": `${Math.cos(a) * 140}%`, "--dy": `${Math.sin(a) * 140}%` }}
          />
        );
      })}
    </div>
  ));
}

// Floating "+points" labels shown where a fruit was eaten
export function ScorePops({ pops }) {
  return pops.map((p) => (
    <div
      key={p.id}
      style={place(p)}
      className="score-pop pointer-events-none absolute z-10 flex items-center justify-center text-sm font-black text-yellow-300 [text-shadow:0_1px_3px_#000]"
    >
      +{p.points}
    </div>
  ));
}
