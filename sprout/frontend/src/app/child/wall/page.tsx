"use client";
import Link from "next/link";
import WonderWall from "@/components/child/WonderWall";

export default function WallPage() {
  return (
    <main className="flex flex-col min-h-screen">
      <header className="px-4 py-3 bg-[#0f0f23]/80 backdrop-blur flex items-center justify-between">
        <h1 className="text-white font-extrabold text-xl font-child">🌍 世界のアイデアたち</h1>
        <Link href="/child" className="text-indigo-300 text-sm hover:text-white">← もどる</Link>
      </header>
      <div className="flex-1">
        <WonderWall />
      </div>
      <div className="bg-[#0f0f23]/80 px-4 py-3 text-center">
        <p className="text-indigo-300 text-xs font-child">
          それぞれの光がひとつのアイデア。大きいほど注目されてるよ✨
        </p>
      </div>
    </main>
  );
}
