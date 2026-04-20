const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export type WallEvent =
  | { type: "seed_added"; data: object }
  | { type: "seed_updated"; data: object }
  | { type: "seed_bloomed"; data: object }
  | { type: "seed_sprouted"; data: object };

export function connectWonderWall(onEvent: (e: WallEvent) => void): () => void {
  const es = new EventSource(`${BASE}/api/v1/wonderwall/stream`);

  const types = ["seed_added", "seed_updated", "seed_bloomed", "seed_sprouted"] as const;
  types.forEach((type) => {
    es.addEventListener(type, (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        onEvent({ type, data } as WallEvent);
      } catch {
        // ignore malformed events
      }
    });
  });

  return () => es.close();
}
