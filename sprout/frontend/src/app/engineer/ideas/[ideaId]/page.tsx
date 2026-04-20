"use client";
import { useEffect, useState, use } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import IdeaSpecPanel from "@/components/engineer/IdeaSpecPanel";
import { api } from "@/lib/api-client";

interface Spec {
  idea_id: string;
  language: string;
  problem_statement: string;
  core_requirements: { id: string; priority: string; text: string }[];
  suggested_tech: string[];
  complexity_level: string;
  estimated_hours?: number | null;
  open_questions: string[];
  emotion_driver: string;
  imagined_user: string;
  magic_moment: string;
  childs_exact_words?: string | null;
}

export default function IdeaDetailPage({ params }: { params: Promise<{ ideaId: string }> }) {
  const { ideaId } = use(params);
  const searchParams = useSearchParams();
  const router = useRouter();
  const lang = searchParams.get("lang") ?? "en";
  const [spec, setSpec] = useState<Spec | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getIdeaSpec(ideaId, lang)
      .then((s) => setSpec(s as Spec))
      .catch(() => setError("Spec not yet available — the AI is still generating it. Check back soon."));
  }, [ideaId, lang]);

  function handleClaim() {
    router.push(`/engineer/claim/${ideaId}`);
  }

  if (error) {
    return (
      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 text-center">
          <p className="text-yellow-700">{error}</p>
        </div>
      </main>
    );
  }

  if (!spec) {
    return (
      <main className="flex items-center justify-center min-h-[60vh]">
        <div className="text-gray-400">Loading specification...</div>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="text-sm text-gray-400 hover:text-gray-600 mb-4 block"
        >
          ← Back to ideas
        </button>
        <span className="text-xs text-gray-400">Spec language: {spec.language.toUpperCase()}</span>
      </div>
      <IdeaSpecPanel spec={spec as Parameters<typeof IdeaSpecPanel>[0]["spec"]} onClaim={handleClaim} />
    </main>
  );
}
