export default function AnimatedQ() {
  return (
    <svg
      viewBox="0 0 400 400"
      className="h-64 w-64 sm:h-80 sm:w-80 lg:h-96 lg:w-96"
      aria-hidden="true"
    >
      <g
        fill="none"
        stroke="#1e293b"
        strokeWidth="20"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
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
    </svg>
  );
}
