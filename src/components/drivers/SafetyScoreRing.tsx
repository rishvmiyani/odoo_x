"use client";

import { getSafetyScoreColor } from "@/lib/utils";
import { cn }                  from "@/lib/utils";

interface SafetyScoreRingProps {
  score: number;
  size?: number;
}

export function SafetyScoreRing({ score, size = 56 }: SafetyScoreRingProps) {
  const radius      = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const filled      = (score / 100) * circumference;
  const colorClass  = getSafetyScoreColor(score);

  const strokeColor =
    score >= 80 ? "#10b981" :
    score >= 60 ? "#f59e0b" : "#ef4444";

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="#e5e7eb" strokeWidth={4} />
        <circle cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={strokeColor} strokeWidth={4}
          strokeDasharray={`${filled} ${circumference}`}
          strokeLinecap="round" />
      </svg>
      <span className={cn("absolute text-xs font-bold tabular-nums", colorClass)}>
        {score.toFixed(0)}
      </span>
    </div>
  );
}
