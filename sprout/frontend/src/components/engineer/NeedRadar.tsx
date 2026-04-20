"use client";
import { useEffect, useRef } from "react";

interface Cell {
  category: string;
  theme: string;
  count: number;
  weight: number;
}

interface Props {
  grid: Cell[];
  onSelect?: (category: string, theme: string) => void;
}

function weightToColor(weight: number): string {
  const r = Math.round(255 * weight);
  const g = Math.round(255 * (1 - weight * 0.6));
  const b = 80;
  return `rgb(${r},${g},${b})`;
}

export default function NeedRadar({ grid, onSelect }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || grid.length === 0) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const categories = [...new Set(grid.map((c) => c.category))];
    const themes = [...new Set(grid.map((c) => c.theme))];
    const cellW = Math.min(120, (canvas.offsetWidth - 120) / categories.length);
    const cellH = 48;
    const offsetX = 120;
    const offsetY = 60;

    canvas.width = offsetX + cellW * categories.length + 20;
    canvas.height = offsetY + cellH * themes.length + 20;

    ctx.fillStyle = "#F8FAFC";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Column headers
    ctx.fillStyle = "#6366F1";
    ctx.font = "bold 11px Inter, sans-serif";
    categories.forEach((cat, ci) => {
      ctx.save();
      ctx.translate(offsetX + ci * cellW + cellW / 2, offsetY - 10);
      ctx.rotate(-Math.PI / 5);
      ctx.fillText(cat, 0, 0);
      ctx.restore();
    });

    // Row headers
    ctx.fillStyle = "#374151";
    ctx.font = "11px Inter, sans-serif";
    themes.forEach((theme, ti) => {
      ctx.fillText(theme.slice(0, 18), 4, offsetY + ti * cellH + cellH / 2 + 4);
    });

    // Cells
    themes.forEach((theme, ti) => {
      categories.forEach((cat, ci) => {
        const cell = grid.find((c) => c.category === cat && c.theme === theme);
        const weight = cell?.weight ?? 0;
        const x = offsetX + ci * cellW;
        const y = offsetY + ti * cellH;

        ctx.fillStyle = weight > 0 ? weightToColor(weight) : "#F1F5F9";
        ctx.fillRect(x + 1, y + 1, cellW - 2, cellH - 2);

        if (cell && cell.count > 0) {
          ctx.fillStyle = weight > 0.6 ? "white" : "#374151";
          ctx.font = "12px Inter, sans-serif";
          ctx.fillText(String(cell.count), x + cellW / 2 - 4, y + cellH / 2 + 4);
        }
      });
    });

    // Click handler
    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const ci = Math.floor((mx - offsetX) / cellW);
      const ti = Math.floor((my - offsetY) / cellH);
      if (ci >= 0 && ci < categories.length && ti >= 0 && ti < themes.length) {
        onSelect?.(categories[ci], themes[ti]);
      }
    };

    canvas.addEventListener("click", handleClick);
    return () => canvas.removeEventListener("click", handleClick);
  }, [grid, onSelect]);

  return (
    <div className="overflow-x-auto">
      <canvas ref={canvasRef} className="w-full" style={{ minHeight: 200 }} />
      {grid.length === 0 && (
        <p className="text-center text-gray-400 py-8">
          No clusters yet — check back after more ideas are submitted.
        </p>
      )}
    </div>
  );
}
