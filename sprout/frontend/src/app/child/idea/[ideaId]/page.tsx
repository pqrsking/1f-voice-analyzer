"use client";
import { useEffect, useState, use } from "react";
import Link from "next/link";
import DreamGenome from "@/components/child/DreamGenome";
import { api } from "@/lib/api-client";

interface Stage {
  key: string;
  label_ja: string;
  label_en: string;
  completed: boolean;
  active: boolean;
}

interface StatusData {
  idea_id: string;
  status: string;
  child_summary: string | null;
  dream_genome_stages: Stage[];
}

export default function IdeaStatusPage({ params }: { params: Promise<{ ideaId: string }> }) {
  const { ideaId } = use(params);
  const [data, setData] = useState<StatusData | null>(null);

  useEffect(() => {
    fetchStatus();
    // Poll every 5 seconds while building
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, [ideaId]); // eslint-disable-line react-hooks/exhaustive-deps

  async function fetchStatus() {
    try {
      const res = await api.getIdeaStatus(ideaId) as StatusData;
      setData(res);
      if (res.status === "deployed") clearInterval(0);
    } catch {
      // backend not yet available
    }
  }

  if (!data) {
    return (
      <main className="flex items-center justify-center min-h-screen">
        <div className="text-5xl animate-bounce">🌱</div>
      </main>
    );
  }

  return (
    <main className="flex flex-col items-center min-h-screen p-6">
      <h1 className="text-3xl font-extrabold text-sprout-green mb-2 text-center">
        きみのアイデアが育ってるよ！
      </h1>
      {data.child_summary && (
        <p className="text-center text-gray-600 max-w-sm mb-8 text-base leading-relaxed">
          {data.child_summary}
        </p>
      )}

      <DreamGenome stages={data.dream_genome_stages} />

      <div className="mt-10 flex flex-col gap-3 w-full max-w-xs text-center">
        <Link href="/child/wall" className="bg-sprout-green text-white py-4 rounded-3xl font-bold text-lg hover:scale-105 transition-transform">
          🌍 世界のアイデアを見る
        </Link>
        <Link href="/child/idea" className="text-sprout-green underline text-base">
          別のアイデアを話す
        </Link>
      </div>
    </main>
  );
}
