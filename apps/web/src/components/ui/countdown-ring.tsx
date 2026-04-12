'use client';

interface CountdownRingProps {
  secondsRemaining: number;
  progress: number; // 0 to 1
  size?: number;
}

export function CountdownRing({ secondsRemaining, progress, size = 120 }: CountdownRingProps) {
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - Math.max(0, Math.min(1, progress)));

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <title>Countdown timer</title>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-sand-pale"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          className="text-gold transition-[stroke-dashoffset] duration-1000 ease-linear"
        />
      </svg>
      <span className="absolute text-2xl font-semibold tabular-nums text-carbon">
        {secondsRemaining}
      </span>
    </div>
  );
}
