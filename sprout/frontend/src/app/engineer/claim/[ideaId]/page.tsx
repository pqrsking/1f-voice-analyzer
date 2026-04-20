"use client";
import { useState, use } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api-client";

// Simple SHA-256 hash for email hashing client-side
async function sha256(msg: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(msg);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, "0")).join("");
}

export default function ClaimPage({ params }: { params: Promise<{ ideaId: string }> }) {
  const { ideaId } = use(params);
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [github, setGithub] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!displayName.trim() || !email.trim()) return;
    setLoading(true);
    setError("");

    try {
      const emailHash = await sha256(email.toLowerCase().trim());
      const eng = await api.registerEngineer({
        display_name: displayName.trim(),
        email_hash: emailHash,
        github_url: github.trim() || null,
        skills: [],
        languages: [navigator.language.split("-")[0] || "en"],
      }) as { id: string };

      await api.claimIdea(eng.id, ideaId);
      router.push(`/engineer/profile/${eng.id}`);
    } catch (err) {
      setError("Something went wrong. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-lg mx-auto px-6 py-12">
      <h1 className="text-2xl font-semibold text-gray-800 mb-2">Claim This Idea</h1>
      <p className="text-gray-500 mb-8 text-sm">
        You&apos;re about to commit to building this. Your display name and a hash of your email are stored — your raw email never is.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Display name *</label>
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
            placeholder="Your handle (public)"
            className="w-full border border-engineer-border rounded-xl px-4 py-3 text-sm outline-none focus:border-engineer-accent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="your@email.com (hashed before sending)"
            className="w-full border border-engineer-border rounded-xl px-4 py-3 text-sm outline-none focus:border-engineer-accent"
          />
          <p className="text-xs text-gray-400 mt-1">SHA-256 hash only. Raw email never stored.</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">GitHub URL (optional)</label>
          <input
            value={github}
            onChange={(e) => setGithub(e.target.value)}
            placeholder="https://github.com/yourusername"
            className="w-full border border-engineer-border rounded-xl px-4 py-3 text-sm outline-none focus:border-engineer-accent"
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-engineer-accent text-white font-semibold py-4 rounded-2xl hover:bg-indigo-700 transition disabled:opacity-50"
        >
          {loading ? "Claiming..." : "🚀 Claim & Start Building"}
        </button>
      </form>
    </main>
  );
}
