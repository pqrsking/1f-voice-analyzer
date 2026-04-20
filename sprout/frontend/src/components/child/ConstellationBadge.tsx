"use client";
import { useEffect, useState } from "react";
import { getOrCreateIdentity } from "@/lib/constellation-identity";

function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function buildConstellation(name: string): { x: number; y: number }[] {
  const stars: { x: number; y: number }[] = [];
  const count = 4 + (name.charCodeAt(0) % 4);
  for (let i = 0; i < count; i++) {
    stars.push({
      x: 10 + seededRandom(name.charCodeAt(i % name.length) + i * 7) * 80,
      y: 10 + seededRandom(name.charCodeAt(i % name.length) + i * 13) * 80,
    });
  }
  return stars;
}

export default function ConstellationBadge() {
  const [identity, setIdentity] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    getOrCreateIdentity().then(setIdentity);
  }, []);

  if (!identity) return null;

  const stars = buildConstellation(identity);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title={`あなたの星座ID: ${identity}`}
        className="fixed top-4 right-4 z-50"
        aria-label="あなたの星座IDを見る"
      >
        <svg width="48" height="48" viewBox="0 0 100 100" className="drop-shadow-lg">
          <rect width="100" height="100" rx="16" fill="#1e1b4b" />
          {stars.map((s, i) =>
            i < stars.length - 1 ? (
              <line
                key={`l${i}`}
                x1={s.x} y1={s.y}
                x2={stars[i + 1].x} y2={stars[i + 1].y}
                stroke="#818cf8" strokeWidth="1" opacity="0.5"
              />
            ) : null
          )}
          {stars.map((s, i) => (
            <circle key={`s${i}`} cx={s.x} cy={s.y} r={i === 0 ? 4 : 2.5} fill="#fbbf24" />
          ))}
        </svg>
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-[#1e1b4b] text-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <svg width="120" height="120" viewBox="0 0 100 100" className="mx-auto mb-4">
              {stars.map((s, i) =>
                i < stars.length - 1 ? (
                  <line key={`l${i}`} x1={s.x} y1={s.y} x2={stars[i + 1].x} y2={stars[i + 1].y}
                    stroke="#818cf8" strokeWidth="1.5" opacity="0.6" />
                ) : null
              )}
              {stars.map((s, i) => (
                <circle key={`s${i}`} cx={s.x} cy={s.y} r={i === 0 ? 5 : 3} fill="#fbbf24" />
              ))}
            </svg>
            <p className="text-sm text-indigo-300 mb-1">あなたのひみつの星座名</p>
            <p className="text-xl font-bold text-yellow-300 mb-4 break-all">{identity}</p>
            <p className="text-xs text-indigo-400 mb-6">
              これはあなただけの名前。このデバイスにだけ保存されていて、サーバーには送られていないよ。
            </p>
            <button
              onClick={() => setOpen(false)}
              className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-2 rounded-full font-semibold transition"
            >
              とじる
            </button>
          </div>
        </div>
      )}
    </>
  );
}
