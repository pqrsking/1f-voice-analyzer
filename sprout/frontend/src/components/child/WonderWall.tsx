"use client";
import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api-client";
import { connectWonderWall } from "@/lib/sse-client";

interface Seed {
  idea_id: string;
  category: string;
  status: string;
  interest_count: number;
  age_hours: number;
  has_claim: boolean;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  pulse?: number;
}

const CATEGORY_COLORS: Record<string, string> = {
  environment: "#68D391",
  health: "#FC8181",
  play: "#76E4F7",
  accessibility: "#D6BCFA",
  safety: "#F6AD55",
  other: "#A0AEC0",
};

export default function WonderWall() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const seedsRef = useRef<Map<string, Seed>>(new Map());
  const animFrameRef = useRef<number>(0);

  useEffect(() => {
    loadSeeds();
    const disconnect = connectWonderWall(handleWallEvent);
    const animate = () => {
      drawFrame();
      animFrameRef.current = requestAnimationFrame(animate);
    };
    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      disconnect();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function loadSeeds() {
    try {
      const res = await api.getWallSeeds();
      const canvas = canvasRef.current;
      if (!canvas) return;
      (res.seeds as Seed[]).forEach((seed) => {
        placeSeed(seed, canvas.width, canvas.height);
      });
    } catch {
      // backend not yet available
    }
  }

  function placeSeed(seed: Seed, w: number, h: number) {
    const existing = seedsRef.current.get(seed.idea_id);
    seedsRef.current.set(seed.idea_id, {
      ...seed,
      x: existing?.x ?? Math.random() * (w - 60) + 30,
      y: existing?.y ?? Math.random() * (h - 60) + 30,
      vx: existing?.vx ?? (Math.random() - 0.5) * 0.3,
      vy: existing?.vy ?? (Math.random() - 0.5) * 0.3,
      pulse: 0,
    });
  }

  function handleWallEvent(event: { type: string; data: object }) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const d = event.data as Seed;
    if (event.type === "seed_added") {
      placeSeed(d, canvas.width, canvas.height);
    } else {
      const existing = seedsRef.current.get(d.idea_id);
      if (existing) {
        seedsRef.current.set(d.idea_id, { ...existing, ...d, pulse: 1.0 });
      }
    }
  }

  function drawFrame() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    const { width: w, height: h } = canvas;

    // Dark starfield background
    ctx.fillStyle = "#0f0f23";
    ctx.fillRect(0, 0, w, h);

    // Draw static background stars
    ctx.fillStyle = "rgba(255,255,255,0.15)";
    for (let i = 0; i < 80; i++) {
      const bx = ((i * 137.5) % 1) * w;
      const by = ((i * 93.7) % 1) * h;
      ctx.beginPath();
      ctx.arc(bx, by, 0.8, 0, Math.PI * 2);
      ctx.fill();
    }

    seedsRef.current.forEach((seed) => {
      if (!seed.x || !seed.y) return;

      // Physics
      seed.x += seed.vx ?? 0;
      seed.y += seed.vy ?? 0;
      if (seed.x < 20 || seed.x > w - 20) seed.vx = -(seed.vx ?? 0);
      if (seed.y < 20 || seed.y > h - 20) seed.vy = -(seed.vy ?? 0);

      const r = 8 + Math.log1p(seed.interest_count) * 4;
      const color = CATEGORY_COLORS[seed.category] ?? CATEGORY_COLORS.other;

      if (seed.pulse && seed.pulse > 0) {
        ctx.beginPath();
        ctx.arc(seed.x, seed.y, r * (1 + seed.pulse), 0, Math.PI * 2);
        ctx.fillStyle = color.replace(")", `, ${seed.pulse * 0.4})`).replace("rgb", "rgba");
        ctx.fill();
        seed.pulse = Math.max(0, seed.pulse - 0.03);
      }

      // Glow
      const grd = ctx.createRadialGradient(seed.x, seed.y, 0, seed.x, seed.y, r * 2);
      grd.addColorStop(0, color);
      grd.addColorStop(1, "transparent");
      ctx.beginPath();
      ctx.arc(seed.x, seed.y, r * 2, 0, Math.PI * 2);
      ctx.fillStyle = grd;
      ctx.fill();

      // Core
      ctx.beginPath();
      ctx.arc(seed.x, seed.y, r, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();

      // "Claimed" indicator: tiny orbiting dot
      if (seed.has_claim || seed.status === "claimed" || seed.status === "building") {
        const angle = Date.now() / 800;
        const ox = seed.x + (r + 8) * Math.cos(angle);
        const oy = seed.y + (r + 8) * Math.sin(angle);
        ctx.beginPath();
        ctx.arc(ox, oy, 3, 0, Math.PI * 2);
        ctx.fillStyle = "#FDE68A";
        ctx.fill();
      }

      // "Deployed" burst rings
      if (seed.status === "deployed") {
        ctx.beginPath();
        ctx.arc(seed.x, seed.y, r + 6, 0, Math.PI * 2);
        ctx.strokeStyle = "#FDE68A";
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    });
  }

  return (
    <div className="relative w-full h-full min-h-[400px] rounded-2xl overflow-hidden">
      <canvas ref={canvasRef} className="w-full h-full" />
      <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
        {Object.entries(CATEGORY_COLORS).map(([cat, color]) => (
          <span
            key={cat}
            className="text-xs px-2 py-1 rounded-full text-white font-child"
            style={{ background: color + "cc" }}
          >
            {cat}
          </span>
        ))}
      </div>
    </div>
  );
}
