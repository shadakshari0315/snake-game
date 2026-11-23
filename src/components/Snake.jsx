import { SIZE } from "../game";

// true when two cells are not neighbours (the snake wrapped through a wall, or the segment is brand new)
const far = (a, b) => !a || !b || Math.abs(a.x - b.x) > 1 || Math.abs(a.y - b.y) > 1;

// Green snake: shaded body that tapers to the tail, round head with eyes and a flicking tongue.
// Every segment slides smoothly to its next cell during one game tick (`ms`).
export default function Snake({ segments, prev, dead, smooth, fed, ms, chomp }) {
  const len = segments.length;
  const head = segments[0];
  const neck = segments[1];

  // Facing direction (flipped when the snake has just wrapped through a wall)
  let dx = head.x - neck.x;
  let dy = head.y - neck.y;
  if (dx > 1) dx = -1;
  if (dx < -1) dx = 1;
  if (dy > 1) dy = -1;
  if (dy < -1) dy = 1;
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);

  // Slide to the new cell, but jump (no animation) after a wall wrap or a restart
  const slide = (i) => (smooth && !far(prev[i], segments[i]) ? `transform ${ms}ms linear` : "none");
  const at = (s) => `translate(${s.x + 0.5}px, ${s.y + 0.5}px)`;

  return (
    <svg
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      className={`absolute inset-0 size-full drop-shadow-[0_2px_3px_rgba(0,0,0,0.55)] ${dead ? "grayscale" : ""}`}
    >
      <defs>
        <radialGradient id="skin" cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#9be8a0" />
          <stop offset="1" stopColor="#2e8b3a" />
        </radialGradient>
      </defs>

      {/* body: drawn tail first so the head end overlaps it */}
      {segments
        .map((s, i) => ({ s, i }))
        .slice(1)
        .reverse()
        .map(({ s, i }) => (
          <g key={i} style={{ transform: at(s), transition: slide(i) }}>
            {/* a segment that is carrying a swallowed fruit bulges for a moment */}
            <g style={{ transform: `scale(${fed.includes(i) ? 1.3 : 1})`, transition: "transform 150ms ease-out" }}>
              <circle
                r={Math.max(0.24, 0.5 - (i / len) * 0.26)}
                fill="url(#skin)"
                stroke="#1b5e20"
                strokeWidth="0.06"
              />
              {i % 2 === 0 && <circle r="0.14" fill="#1f6b2a" opacity="0.55" />}
            </g>
          </g>
        ))}

      {/* head: slides like the body, rotation snaps; drawn facing right and then rotated */}
      <g style={{ transform: at(head), transition: slide(0) }}>
        <g transform={`rotate(${angle})`}>
          {/* new key after every fruit replays the chomp animation */}
          <g key={chomp} className={chomp > 0 && !dead ? "chomp" : ""}>
            <path className="tongue" d="M0.6 0 L0.98 0 M0.98 0 L1.16 -0.13 M0.98 0 L1.16 0.13" stroke="#ef4444" strokeWidth="0.07" strokeLinecap="round" fill="none" />
            <ellipse cx="0.1" cy="0" rx="0.6" ry="0.5" fill="url(#skin)" stroke="#1b5e20" strokeWidth="0.06" />
            <circle cx="0.4" cy="-0.12" r="0.03" fill="#14532d" />
            <circle cx="0.4" cy="0.12" r="0.03" fill="#14532d" />
            {dead ? (
              <path d="M0.15 -0.3 l0.2 0.16 M0.35 -0.3 l-0.2 0.16 M0.15 0.14 l0.2 0.16 M0.35 0.14 l-0.2 0.16" stroke="#111" strokeWidth="0.05" strokeLinecap="round" />
            ) : (
              <>
                <circle cx="0.22" cy="-0.26" r="0.12" fill="#fff" />
                <circle cx="0.22" cy="0.26" r="0.12" fill="#fff" />
                <circle cx="0.26" cy="-0.26" r="0.06" fill="#111" />
                <circle cx="0.26" cy="0.26" r="0.06" fill="#111" />
              </>
            )}
          </g>
        </g>
      </g>
    </svg>
  );
}
