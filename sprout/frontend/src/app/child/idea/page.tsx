"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import MascotChat from "@/components/child/MascotChat";

export default function IdeaPage() {
  const router = useRouter();
  const [lang, setLang] = useState("ja");

  const LANGS = [
    { code: "ja", label: "日本語" },
    { code: "en", label: "English" },
    { code: "es", label: "Español" },
    { code: "zh", label: "中文" },
    { code: "ko", label: "한국어" },
    { code: "fr", label: "Français" },
    { code: "de", label: "Deutsch" },
    { code: "pt", label: "Português" },
  ];

  function handleComplete(ideaId: string) {
    router.push(`/child/idea/${ideaId}`);
  }

  return (
    <main className="flex flex-col h-screen max-h-screen">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-sprout-mint bg-white/80 backdrop-blur">
        <h1 className="text-xl font-extrabold text-sprout-green">🌱 アイデアを話そう</h1>
        <select
          value={lang}
          onChange={(e) => setLang(e.target.value)}
          className="text-sm border border-gray-200 rounded-full px-3 py-1"
          aria-label="言語を選ぶ"
        >
          {LANGS.map((l) => (
            <option key={l.code} value={l.code}>{l.label}</option>
          ))}
        </select>
      </header>

      {/* Chat */}
      <div className="flex-1 overflow-hidden">
        <MascotChat lang={lang} onComplete={handleComplete} />
      </div>
    </main>
  );
}
