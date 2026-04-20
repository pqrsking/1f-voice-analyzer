"use client";
import { useEffect, useRef } from "react";

interface Stage {
  key: string;
  label_ja: string;
  label_en: string;
  completed: boolean;
  active: boolean;
}

interface Props {
  stages: Stage[];
}

const STAGE_COLORS = [
  "#FCD34D", // yellow
  "#6EE7B7", // green
  "#60A5FA", // blue
  "#C084FC", // purple
  "#FB923C", // orange
  "#FDE68A", // gold
];

export default function DreamGenome({ stages }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);

  const width = 320;
  const height = 500;
  const cx = width / 2;
  const amplitude = 60;
  const nodeYs = stages.map((_, i) => 40 + i * (height - 80) / (stages.length - 1));

  // Sine wave path for left and right strands
  function strandPath(side: 1 | -1): string {
    const points: string[] = [];
    for (let t = 0; t <= 1; t += 0.02) {
      const x = cx + side * amplitude * Math.sin(t * Math.PI * 3);
      const y = 40 + t * (height - 80);
      points.push(`${x.toFixed(1)},${y.toFixed(1)}`);
    }
    return `M ${points.join(" L ")}`;
  }

  return (
    <div className="flex flex-col items-center font-child">
      <svg
        ref={svgRef}
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="overflow-visible"
      >
        {/* Strands */}
        <path d={strandPath(1)} fill="none" stroke="#D1FAE5" strokeWidth="3" strokeLinecap="round" />
        <path d={strandPath(-1)} fill="none" stroke="#D1FAE5" strokeWidth="3" strokeLinecap="round" />

        {/* Stage nodes */}
        {stages.map((stage, i) => {
          const y = nodeYs[i];
          const color = STAGE_COLORS[i];
          const isCompleted = stage.completed;
          const isActive = stage.active;

          return (
            <g key={stage.key}>
              {/* Connector line to center */}
              {i < stages.length - 1 && (
                <line
                  x1={cx} y1={y} x2={cx} y2={nodeYs[i + 1]}
                  stroke={isCompleted ? "#A7F3D0" : "#E5E7EB"}
                  strokeWidth="2"
                  strokeDasharray={isCompleted ? "0" : "6 4"}
                />
              )}

              {/* Node circle */}
              <circle
                cx={cx} cy={y}
                r={isActive ? 20 : 16}
                fill={isCompleted || isActive ? color : "#E5E7EB"}
                stroke={isActive ? color : "none"}
                strokeWidth={isActive ? 4 : 0}
                opacity={isActive ? 1 : isCompleted ? 1 : 0.4}
                className={isActive ? "animate-pulse_slow" : ""}
              />

              {/* Checkmark for completed */}
              {isCompleted && (
                <text x={cx} y={y + 5} textAnchor="middle" fontSize="14" fill="white" fontWeight="bold">
                  ✓
                </text>
              )}

              {/* Stage number for future */}
              {!isCompleted && !isActive && (
                <text x={cx} y={y + 5} textAnchor="middle" fontSize="12" fill="#9CA3AF">
                  {i + 1}
                </text>
              )}

              {/* Label */}
              <text
                x={i % 2 === 0 ? cx + 34 : cx - 34}
                y={y + 5}
                textAnchor={i % 2 === 0 ? "start" : "end"}
                fontSize="13"
                fill={isCompleted || isActive ? "#374151" : "#9CA3AF"}
                fontWeight={isActive ? "bold" : "normal"}
              >
                {stage.label_ja}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
