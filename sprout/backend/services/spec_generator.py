"""
Spec Generator — converts a completed child interview into a structured
technical specification with an empathy-enriched "Child's Heart" section.
"""
import json
from typing import List
from services.claude_client import get_client, MODEL

SPEC_SYSTEM = """You are an expert technical writer and empathetic product designer.
You receive a conversation between a child and a mascot (Sprout), where the child described an idea or problem.

Generate a complete structured JSON specification with both a technical spec and an empathy section.

Output ONLY valid JSON matching this schema exactly:
{
  "child_summary": "1-2 sentence warm plain-language summary written for the child",
  "category": "environment|health|accessibility|play|safety|other",
  "problem_statement": "2-3 paragraphs describing the core problem and why it matters",
  "core_requirements": [
    {"id": "R1", "priority": "must|should|could", "text": "requirement description"}
  ],
  "suggested_tech": ["technology or framework name"],
  "complexity_level": "beginner|intermediate|advanced|research",
  "estimated_hours": 40,
  "open_questions": ["question the engineer must resolve during design"],
  "emotion_driver": "The feeling or frustration that drove this idea — extract from the child's words",
  "imagined_user": "Who the child sees benefiting — be specific and human",
  "magic_moment": "The exact vivid scenario the child imagines when it works perfectly",
  "childs_exact_words": "One memorable verbatim phrase the child said"
}

Extraction principles:
- "magic box that makes sad people happy" → extract: emotional support device. Ask: companion robot? mood lighting? social app? List as open_questions.
- "robot friend for grandma" → extract: elder companionship / social isolation solution.
- Preserve the child's emotional intent in the empathy section.
- Use measurable acceptance criteria in requirements where possible.
- If the child's idea is vague, lean toward more open_questions rather than assumptions.
- Do NOT invent personal information about the child; base everything on what they said."""


def generate_spec(turns: List[dict], source_lang: str) -> dict:
    client = get_client()
    conversation = json.dumps(
        [{"role": t["role"], "message": t["content"]} for t in turns],
        ensure_ascii=False
    )
    prompt = f"Child's interview (submitted in language: {source_lang}):\n\n{conversation}"

    response = client.messages.create(
        model=MODEL,
        max_tokens=2000,
        system=SPEC_SYSTEM,
        messages=[{"role": "user", "content": prompt}],
    )

    text = response.content[0].text.strip()
    # Strip markdown code fences if present
    if text.startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
    return json.loads(text.strip())
