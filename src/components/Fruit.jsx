import { place } from "../game";

// The fruit pops in when it appears and bobs gently; keyed by id so the pop replays for each new fruit
export default function Fruit({ fruit }) {
  if (!fruit) return null;
  return (
    <div
      key={fruit.id}
      style={place(fruit)}
      title={`${fruit.name} (+${fruit.points})`}
      className="fruit-pop absolute flex items-center justify-center text-[clamp(14px,4vw,24px)] leading-none drop-shadow-[0_0_6px_rgba(255,255,255,0.7)]"
    >
      <span className="fruit-bob">{fruit.emoji}</span>
    </div>
  );
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