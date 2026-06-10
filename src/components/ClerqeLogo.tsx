export default function ClerqeLogo({ className }: { className?: string }) {
  const gap = 8;
  // Estimated glyph widths at fontSize=64 for Google Sans
  const w = { C: 42, l: 13, e: 33, r: 27, e2: 34 };
  const qDiam = 80 * 0.22 * 2 + 36 * 0.22; // bowl diameter + stroke width after scale

  let x = 5;
  const cX = x; x += w.C + gap;
  const lX = x; x += w.l + gap;
  const e1X = x; x += w.e + gap;
  const rX = x; x += w.r + gap;
  // Q slot: x is the left edge of Q
  const qTranslateX = x - 22.44; // maps Q bowl left edge to x
  x += qDiam + gap;
  const e2X = x;

  return (
    <svg
      viewBox="0 0 280 100"
      className={className}
      aria-hidden="true"
    >
      <text x={cX} y="68" fontFamily="inherit" fontSize="64" fontWeight="800" fill="currentColor">C</text>
      <text x={lX} y="68" fontFamily="inherit" fontSize="64" fontWeight="800" fill="currentColor">l</text>
      <text x={e1X} y="68" fontFamily="inherit" fontSize="64" fontWeight="800" fill="currentColor">e</text>
      <text x={rX} y="68" fontFamily="inherit" fontSize="64" fontWeight="800" fill="currentColor">r</text>
      <g transform={`translate(${qTranslateX}, 4) scale(0.22)`}>
        <g fill="none" stroke="currentColor" strokeWidth="36" strokeLinecap="round" strokeLinejoin="round">
          <path
            d="M120 200 a80 80 0 1 1 160 0 a80 80 0 1 1 -160 0"
            strokeDasharray="503"
            strokeDashoffset="503"
            className="animate-draw-q"
          />
          <path
            d="M228 228 l57 57"
            strokeDasharray="81"
            strokeDashoffset="81"
            className="animate-draw-q-tail"
          />
        </g>
      </g>
      <text x={e2X} y="68" fontFamily="inherit" fontSize="64" fontWeight="800" fill="currentColor">e</text>
    </svg>
  );
}
