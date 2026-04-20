"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import FilterSidebar from "@/components/engineer/FilterSidebar";
import { api } from "@/lib/api-client";

interface IdeaCard {
  idea_id: string;
  category: string;
  status: string;
  interest_count: number;
  complexity_level: string | null;
  child_summary: string | null;
  submitted_lang: string;
  has_claim: boolean;
  created_at: string;
}

const STATUS_COLOR: Record<string, string> = {
  specced: "bg-blue-100 text-blue-700",
  claimed: "bg-purple-100 text-purple-700",
  building: "bg-yellow-100 text-yellow-700",
  deployed: "bg-green-100 text-green-700",
};

const CATEGORY_EMOJI: Record<string, string> = {
  environment: "🌿",
  health: "❤️",
  play: "🎮",
  accessibility: "♿",
  safety: "🛡️",
  other: "💡",
};

export default function EngineerHome() {
  const [ideas, setIdeas] = useState<IdeaCard[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: "all",
    complexity: "all",
    status: "specced",
    lang: "en",
  });

  useEffect(() => {
    fetchIdeas();
  }, [filters]); // eslint-disable-line react-hooks/exhaustive-deps

  async function fetchIdeas() {
    setLoading(true);
    try {
      const params: Record<string, string> = { lang: filters.lang, status: filters.status };
      if (filters.category !== "all") params.category = filters.category;
      if (filters.complexity !== "all") params.complexity = filters.complexity;
      const res = await api.listIdeas(params) as { ideas: IdeaCard[]; total: number };
      setIdeas(res.ideas);
      setTotal(res.total);
    } catch {
      setIdeas([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Children&apos;s Ideas, Ready to Build</h1>
        <p className="text-gray-500 text-sm mt-1">
          {total} ideas waiting for an engineer. Each one came from a real child.
        </p>
      </div>

      <div className="flex gap-8">
        <FilterSidebar
          filters={filters}
          onChange={(f) => setFilters((prev) => ({ ...prev, ...f }))}
        />

        <div className="flex-1">
          {loading ? (
            <div className="text-center py-20 text-gray-400">Loading ideas...</div>
          ) : ideas.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              No ideas match your filters yet.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {ideas.map((idea) => (
                <Link
                  key={idea.idea_id}
                  href={`/engineer/ideas/${idea.idea_id}?lang=${filters.lang}`}
                  className="bg-white rounded-2xl border border-engineer-border p-5 hover:shadow-md hover:border-engineer-accent transition-all block"
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-2xl">{CATEGORY_EMOJI[idea.category] ?? "💡"}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[idea.status] ?? ""}`}>
                      {idea.status}
                    </span>
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed line-clamp-3 mb-4">
                    {idea.child_summary ?? "Spec being generated..."}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span>👍 {idea.interest_count}</span>
                    {idea.complexity_level && <span>📊 {idea.complexity_level}</span>}
                    <span>🌐 {idea.submitted_lang}</span>
                    {idea.has_claim && <span className="text-purple-500 font-medium">🔧 Claimed</span>}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
