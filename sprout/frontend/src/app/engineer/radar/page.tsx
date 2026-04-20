"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import NeedRadar from "@/components/engineer/NeedRadar";
import { api } from "@/lib/api-client";

interface Cell {
  category: string;
  theme: string;
  count: number;
  weight: number;
}

export default function RadarPage() {
  const [grid, setGrid] = useState<Cell[]>([]);
  const [generated_at, setGeneratedAt] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    api.getRadarHeatmap()
      .then((res) => {
        const r = res as { grid: Cell[]; generated_at: string };
        setGrid(r.grid);
        setGeneratedAt(r.generated_at);
      })
      .catch(() => {});
  }, []);

  function handleSelect(category: string, theme: string) {
    router.push(`/engineer?category=${category}&theme=${encodeURIComponent(theme)}`);
  }

  return (
    <main className="max-w-5xl mx-auto px-6 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Need Radar</h1>
        <p className="text-gray-500 text-sm mt-1">
          Which problems are children submitting most? Darker = more ideas in that cluster.
          {generated_at && (
            <span className="ml-2 text-xs text-gray-400">
              Updated {new Date(generated_at).toLocaleString()}
            </span>
          )}
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-engineer-border p-6">
        <NeedRadar grid={grid} onSelect={handleSelect} />
      </div>

      <div className="mt-6 flex flex-wrap gap-3 text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ background: "rgb(255,220,80)" }} />
          <span>Low frequency</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ background: "rgb(255,140,80)" }} />
          <span>Medium</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ background: "rgb(255,40,80)" }} />
          <span>High frequency</span>
        </div>
      </div>
    </main>
  );
}
