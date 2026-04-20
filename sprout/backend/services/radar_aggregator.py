"""
Need Radar aggregation — clusters children's ideas into meaningful
human-need themes using Claude. Run every 6 hours as a background task.
"""
import json
from datetime import datetime
from services.claude_client import get_client, MODEL

CLUSTER_SYSTEM = """You are analyzing a list of children's idea summaries from around the world.
Group them into meaningful "need clusters" — human problems that multiple children are trying to solve.

Input: JSON array of {idea_id, child_summary, category}.
Output: JSON array of {
  "theme_label": "Brief human-readable theme (max 6 words)",
  "category": "primary category",
  "idea_ids": ["id1", "id2"],
  "pattern_insight": "1 sentence: what pain are these children expressing?"
}

Rules:
- A cluster needs at least 2 ideas to be named.
- Look beyond surface similarity: "robot friend" and "app that checks on me" may both be about loneliness.
- Cluster by the underlying human need, not the proposed solution.
- Maximum 20 clusters total.
- Output ONLY valid JSON array."""


def run_clustering(ideas: list) -> list:
    if not ideas:
        return []

    client = get_client()
    input_data = [
        {"idea_id": i.id, "child_summary": i.child_summary or "", "category": i.category}
        for i in ideas
        if i.child_summary
    ]

    if not input_data:
        return []

    response = client.messages.create(
        model=MODEL,
        max_tokens=2000,
        system=CLUSTER_SYSTEM,
        messages=[{"role": "user", "content": json.dumps(input_data, ensure_ascii=False)}],
    )

    text = response.content[0].text.strip()
    if text.startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]

    return json.loads(text.strip())
