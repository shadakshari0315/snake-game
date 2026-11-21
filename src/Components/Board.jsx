const BOARD_IMAGE = "/board-bg.svg"; // picture inside the board (public folder)

export default function Board({ shake, children }) {
  return (
    <div
      className={`relative size-full overflow-hidden rounded-2xl border-4 border-emerald-900/80 shadow-2xl shadow-black/60 ${shake ? "board-shake" : ""}`}
      style={{
        // grid lines, dark tint (keeps the snake visible), picture, fallback colour
        backgroundImage: `linear-gradient(#ffffff1f 1px, transparent 1px), linear-gradient(90deg, #ffffff1f 1px, transparent 1px), linear-gradient(rgba(0,0,0,0.15), rgba(0,0,0,0.15)), url('${BOARD_IMAGE}'), linear-gradient(#0b3d5c, #1d3328)`,
        backgroundSize: "5% 5%, 5% 5%, 100% 100%, cover, 100% 100%",
        backgroundPosition: "0 0, 0 0, 0 0, center, 0 0",
      }}
    >
      {children}
    </div>
  );
}