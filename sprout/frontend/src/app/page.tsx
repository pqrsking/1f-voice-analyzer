"use client";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-sprout-bg to-sprout-bgalt flex flex-col items-center justify-center p-8 font-child">
      <div className="text-center max-w-2xl">
        {/* Logo */}
        <div className="text-8xl mb-4 animate-float inline-block">🌱</div>
        <h1 className="text-5xl font-extrabold text-sprout-green mb-3">SPROUT</h1>
        <p className="text-xl text-gray-600 mb-2">子供のアイデアを、世界の技術者へ。</p>
        <p className="text-sm text-gray-400 mb-12">Children's ideas. Engineers worldwide. Real solutions.</p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/child"
            className="bg-sprout-green text-white text-2xl font-bold px-10 py-5 rounded-3xl shadow-lg hover:scale-105 transition-transform"
          >
            🧒 アイデアを出す
          </Link>
          <Link
            href="/engineer"
            className="bg-white text-engineer-accent text-xl font-semibold px-10 py-5 rounded-3xl shadow-lg border border-engineer-border hover:scale-105 transition-transform"
          >
            👷 技術者として参加
          </Link>
        </div>

        <p className="mt-12 text-xs text-gray-300">
          子供のプライバシーを最優先。個人情報は一切保存しません。
        </p>
      </div>
    </main>
  );
}
