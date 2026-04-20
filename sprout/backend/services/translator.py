"""
Concept-aware translation service.

Not word-for-word translation — Claude extracts meaning, cultural context,
and the underlying need before translating. Critical for preserving the
emotional intent of children's descriptions across languages.
"""
import json
from services.claude_client import get_client, MODEL

TRANSLATE_SYSTEM = """You are a concept translator specializing in children's ideas and technical specifications.

Your task: Translate the provided text, preserving MEANING and emotional intent, not just words.

Critical rules:
- This is NOT word-for-word translation. Translate MEANING and CULTURAL CONTEXT.
- Technical terms should use standard terminology in the target language's developer community.
- Emotional descriptions in the "Child's Heart" section must preserve warmth and specificity.
- If a phrase has no direct cultural equivalent, find the closest emotional analog.
- Children's imaginative descriptions (e.g. "magic sleep box") should be translated conceptually.

Return ONLY valid JSON:
{
  "translated_text": "...",
  "extracted_concepts": ["concept 1", "concept 2"],
  "clarification_needed": false,
  "notes": ["any meaning-loss warnings"]
}"""


SPEC_TRANSLATE_SYSTEM = """You are translating a technical specification originally written in English.
The spec was generated from a child's idea. Translate ALL text fields into the target language.

Rules:
- Technical requirement text: use target language developer conventions.
- "Child's Heart" section: preserve emotional warmth and human specificity.
- Do not translate field keys, only field values.
- Return the complete spec JSON with all text fields translated."""


def translate_concept(text: str, source_lang: str, target_lang: str) -> dict:
    if source_lang == target_lang:
        return {
            "translated_text": text,
            "extracted_concepts": [],
            "clarification_needed": False,
            "notes": [],
        }

    client = get_client()
    prompt = f"Source language: {source_lang}\nTarget language: {target_lang}\n\nText to translate:\n{text}"

    response = client.messages.create(
        model=MODEL,
        max_tokens=1000,
        system=TRANSLATE_SYSTEM,
        messages=[{"role": "user", "content": prompt}],
    )

    text_out = response.content[0].text.strip()
    if text_out.startswith("```"):
        text_out = text_out.split("```")[1]
        if text_out.startswith("json"):
            text_out = text_out[4:]
    return json.loads(text_out.strip())


def translate_spec(spec_data: dict, target_lang: str) -> dict:
    """Translate an entire spec dict into target_lang."""
    client = get_client()

    translatable = {
        "problem_statement": spec_data.get("problem_statement", ""),
        "core_requirements": spec_data.get("core_requirements", []),
        "open_questions": spec_data.get("open_questions", []),
        "emotion_driver": spec_data.get("emotion_driver", ""),
        "imagined_user": spec_data.get("imagined_user", ""),
        "magic_moment": spec_data.get("magic_moment", ""),
        "childs_exact_words": spec_data.get("childs_exact_words", ""),
        "child_summary": spec_data.get("child_summary", ""),
    }

    prompt = (
        f"Target language: {target_lang}\n\n"
        f"Spec to translate:\n{json.dumps(translatable, ensure_ascii=False)}"
    )

    response = client.messages.create(
        model=MODEL,
        max_tokens=2000,
        system=SPEC_TRANSLATE_SYSTEM,
        messages=[{"role": "user", "content": prompt}],
    )

    text_out = response.content[0].text.strip()
    if text_out.startswith("```"):
        text_out = text_out.split("```")[1]
        if text_out.startswith("json"):
            text_out = text_out[4:]

    translated = json.loads(text_out.strip())
    result = spec_data.copy()
    result.update(translated)
    return result
