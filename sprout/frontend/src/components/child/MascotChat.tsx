"use client";
import { useState, useRef, useEffect } from "react";
import { api } from "@/lib/api-client";
import { getConstellationToken } from "@/lib/constellation-identity";

interface Turn {
  role: "mascot" | "child";
  content: string;
}

interface Props {
  lang: string;
  onComplete: (ideaId: string) => void;
}

const MASCOT_STATES = {
  idle: "🌱",
  thinking: "🤔",
  excited: "🌟",
  listening: "👂",
};

export default function MascotChat({ lang, onComplete }: Props) {
  const [ideaId, setIdeaId] = useState<string | null>(null);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState("");
  const [mascotState, setMascotState] = useState<keyof typeof MASCOT_STATES>("idle");
  const [isLoading, setIsLoading] = useState(false);
  const [leafCount, setLeafCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initInterview();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [turns]);

  async function initInterview() {
    setMascotState("excited");
    setIsLoading(true);
    try {
      const token = await getConstellationToken();
      const res = await api.startIdea({ constellation_token: token, submitted_lang: lang });
      setIdeaId(res.idea_id);
      setTurns([{ role: "mascot", content: res.first_mascot_message }]);
    } finally {
      setIsLoading(false);
      setMascotState("listening");
    }
  }

  async function sendMessage() {
    if (!input.trim() || !ideaId || isLoading) return;
    const message = input.trim();
    setInput("");
    setTurns((prev) => [...prev, { role: "child", content: message }]);
    setMascotState("thinking");
    setIsLoading(true);

    try {
      const token = await getConstellationToken();
      const res = await api.respondToInterview(ideaId, { constellation_token: token, message });
      setTurns((prev) => [...prev, { role: "mascot", content: res.mascot_reply }]);
      setLeafCount((prev) => Math.min(prev + 1, 5));

      if (res.is_interview_complete) {
        setIsComplete(true);
        setMascotState("excited");
        setTimeout(() => onComplete(ideaId), 2500);
      } else {
        setMascotState("listening");
      }
    } catch {
      setMascotState("idle");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-full max-w-lg mx-auto">
      {/* Progress leaves */}
      <div className="flex justify-center gap-2 py-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i} className={`text-2xl transition-all ${i < leafCount ? "opacity-100 scale-110" : "opacity-20"}`}>
            🍃
          </span>
        ))}
      </div>

      {/* Mascot */}
      <div className="flex flex-col items-center py-4">
        <div
          className={`text-7xl transition-all duration-500 ${
            mascotState === "thinking" ? "animate-bounce" :
            mascotState === "excited" ? "animate-ping scale-75" :
            "animate-float"
          }`}
        >
          {MASCOT_STATES[mascotState]}
        </div>
        <p className="text-sm text-gray-400 mt-1 font-child">Sprout</p>
      </div>

      {/* Chat bubbles */}
      <div className="flex-1 overflow-y-auto px-4 space-y-4 child-scroll pb-4">
        {turns.map((turn, i) => (
          <div
            key={i}
            className={`flex ${turn.role === "mascot" ? "justify-start" : "justify-end"}`}
          >
            <div
              className={`max-w-[80%] rounded-3xl px-5 py-3 text-lg leading-relaxed font-child ${
                turn.role === "mascot"
                  ? "bg-sprout-yellow text-gray-700 rounded-tl-sm"
                  : "bg-sprout-mint text-gray-700 rounded-tr-sm"
              }`}
            >
              {turn.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-sprout-yellow rounded-3xl rounded-tl-sm px-5 py-3">
              <span className="inline-flex gap-1">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </span>
            </div>
          </div>
        )}

        {isComplete && (
          <div className="text-center py-4">
            <p className="text-2xl">🌟✨🌟</p>
            <p className="text-sprout-green font-bold text-lg font-child">
              アイデアが旅立ったよ！
            </p>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      {!isComplete && (
        <div className="p-4 border-t border-gray-100">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="ここに書いてね..."
              disabled={isLoading}
              className="flex-1 rounded-full border-2 border-sprout-green px-5 py-3 text-lg font-child outline-none focus:border-sprout-amber disabled:opacity-50"
            />
            <button
              onClick={sendMessage}
              disabled={isLoading || !input.trim()}
              className="bg-sprout-green text-white rounded-full px-6 py-3 text-2xl disabled:opacity-40 hover:scale-105 transition-transform"
              aria-label="送信"
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
