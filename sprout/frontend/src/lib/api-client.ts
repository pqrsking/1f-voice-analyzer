const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`API ${res.status}: ${detail}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  startIdea: (body: object) =>
    request<{ idea_id: string; first_mascot_message: string }>("/api/v1/ideas/start", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  respondToInterview: (ideaId: string, body: object) =>
    request<{ mascot_reply: string; is_interview_complete: boolean; turn_index: number }>(
      `/api/v1/ideas/${ideaId}/respond`,
      { method: "POST", body: JSON.stringify(body) }
    ),

  getIdeaStatus: (ideaId: string) =>
    request<{ idea_id: string; status: string; child_summary: string | null; dream_genome_stages: object[] }>(
      `/api/v1/ideas/${ideaId}/status`
    ),

  getIdeaSpec: (ideaId: string, lang = "en") =>
    request<object>(`/api/v1/ideas/${ideaId}/spec?lang=${lang}`),

  listIdeas: (params: Record<string, string>) => {
    const qs = new URLSearchParams(params).toString();
    return request<object>(`/api/v1/ideas?${qs}`);
  },

  voteInterest: (ideaId: string, sessionToken: string) =>
    request<{ new_count: number }>(`/api/v1/ideas/${ideaId}/interest`, {
      method: "POST",
      body: JSON.stringify({ session_token: sessionToken }),
    }),

  registerEngineer: (body: object) =>
    request<object>("/api/v1/engineers/register", { method: "POST", body: JSON.stringify(body) }),

  getEngineer: (id: string) => request<object>(`/api/v1/engineers/${id}`),

  claimIdea: (engineerId: string, ideaId: string) =>
    request<{ claim_id: string; status: string }>(
      `/api/v1/engineers/${engineerId}/claim/${ideaId}`,
      { method: "POST", body: JSON.stringify({ engineer_id: engineerId }) }
    ),

  updateClaim: (engineerId: string, claimId: string, body: object) =>
    request<object>(`/api/v1/engineers/${engineerId}/claim/${claimId}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  getWallSeeds: () => request<{ seeds: object[] }>("/api/v1/wonderwall/seeds"),

  getRadarHeatmap: () => request<object>("/api/v1/radar/heatmap"),

  translateConcept: (body: object) =>
    request<object>("/api/v1/translate/concept", { method: "POST", body: JSON.stringify(body) }),
};
