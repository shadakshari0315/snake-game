const BOARD_IMAGE = "/board-bg.svg"; // picture inside the board (public folder)

export default function Board({ shake, children }) {
  return (
    <div
      className={`relative size-full overflow-hidden rounded-2xl border-4 border-emerald-900/80 shadow-2xl shadow-black/60 inset-shadow-[0_0_40px_rgba(0,0,0,0.45)] ${shake ? "board-shake" : ""}`}
      style={{
        // checkerboard (one 2x2 tile = 10%), dark tint (keeps the snake visible), picture, fallback colour
        backgroundImage: `repeating-conic-gradient(rgba(255,255,255,0.11) 0% 25%, rgba(0,0,0,0.14) 0% 50%), linear-gradient(rgba(0,0,0,0.15), rgba(0,0,0,0.15)), url('${BOARD_IMAGE}'), linear-gradient(#0b3d5c, #1d3328)`,
        backgroundSize: "10% 10%, 100% 100%, cover, 100% 100%",
        backgroundPosition: "0 0, 0 0, center, 0 0",
      }}
    >
      {children}
    </div>
  );
}