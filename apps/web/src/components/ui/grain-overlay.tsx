/**
 * Fixed-position SVG grain that adds subtle parchment texture site-wide.
 * Non-blocking, pointer-events-none, respects reduce-motion.
 */
export function GrainOverlay() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[1] opacity-[0.05] mix-blend-multiply"
    >
      <svg
        width="100%"
        height="100%"
        xmlns="http://www.w3.org/2000/svg"
        role="presentation"
        style={{ width: '100%', height: '100%' }}
      >
        <title>Paper grain texture</title>
        <filter id="grain-filter">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves="2"
            stitchTiles="stitch"
          />
          <feColorMatrix values="0 0 0 0 0.61  0 0 0 0 0.52  0 0 0 0 0.39  0 0 0 1 0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain-filter)" />
      </svg>
    </div>
  );
}
