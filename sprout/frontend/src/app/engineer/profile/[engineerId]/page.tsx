"use client";
import { useEffect, useState, use } from "react";
import Link from "next/link";
import EngineerBadge from "@/components/engineer/EngineerBadge";
import { api } from "@/lib/api-client";

interface Engineer {
  id: string;
  display_name: string;
  github_url?: string | null;
  skills: string[];
  languages: string[];
  bio?: string | null;
  badge_ids: string[];
  total_builds: number;
  children_helped: number;
}

export default function ProfilePage({ params }: { params: Promise<{ engineerId: string }> }) {
  const { engineerId } = use(params);
  const [eng, setEng] = useState<Engineer | null>(null);

  useEffect(() => {
    api.getEngineer(engineerId).then((e) => setEng(e as Engineer));
  }, [engineerId]);

  if (!eng) return <main className="flex items-center justify-center min-h-[60vh] text-gray-400">Loading profile...</main>;

  return (
    <main className="max-w-2xl mx-auto px-6 py-12">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-3xl">
          👷
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{eng.display_name}</h1>
          {eng.github_url && (
            <a href={eng.github_url} target="_blank" rel="noopener noreferrer" className="text-sm text-engineer-accent hover:underline">
              GitHub →
            </a>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-engineer-border p-5 text-center">
          <p className="text-3xl font-bold text-engineer-accent">{eng.total_builds}</p>
          <p className="text-sm text-gray-500">builds completed</p>
        </div>
        <div className="bg-white rounded-2xl border border-engineer-border p-5 text-center">
          <p className="text-3xl font-bold text-green-600">{eng.children_helped}</p>
          <p className="text-sm text-gray-500">children helped</p>
        </div>
      </div>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Constellation Badges</h2>
        <EngineerBadge badgeIds={eng.badge_ids} />
      </section>

      {eng.skills.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">Skills</h2>
          <div className="flex flex-wrap gap-2">
            {eng.skills.map((s) => (
              <span key={s} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">{s}</span>
            ))}
          </div>
        </section>
      )}

      <div className="mt-10 flex gap-4">
        <Link href="/engineer" className="bg-engineer-accent text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition">
          Browse More Ideas
        </Link>
      </div>
    </main>
  );
}
