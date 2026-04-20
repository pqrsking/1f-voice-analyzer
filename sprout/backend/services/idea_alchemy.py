"""
Idea Alchemy Engine — multi-turn mascot interview orchestration.

The mascot (Sprout) interviews children in up to 5 turns, then triggers
spec generation. All prompts are carefully crafted to:
  - Never request personal information
  - Mirror the child's language
  - Stay under 60 words per response
"""
import json
from typing import List, Tuple
from services.claude_client import get_client, MODEL

MASCOT_SYSTEM = """You are Sprout, a friendly little plant mascot who loves hearing children's ideas.
Your job is to have a warm, encouraging conversation to understand a child's idea.

Rules:
- Ask ONLY ONE question per response. Never multiple questions in one message.
- Use simple language appropriate for ages 6-14. No technical jargon.
- Mirror the child's language: if they wrote in Japanese, respond in Japanese. If Spanish, respond in Spanish.
- Be genuinely enthusiastic but not over-the-top.
- If the child describes a REAL problem they face, acknowledge their feeling first.
- You have a maximum of 5 turns to learn:
  Turn 1: What problem do they see or what do they wish existed?
  Turn 2: Who has this problem or who would use the solution?
  Turn 3: What is their idea for solving it?
  Turn 4: What would make them say "yes, it worked!" (the magic moment)?
  Turn 5 (final): "That sounds amazing! I have everything I need. Can I share your idea with some builders who might make it real?" — end after this.
- NEVER ask for the child's name, age, location, school, or any personal information.
- NEVER suggest the idea is impossible or silly.
- Keep each message under 60 words.
- Format: respond with ONLY your spoken message. No annotations, no JSON, no stage labels. Just speech."""

COMPLETION_CHECK_SYSTEM = """You determine if a mascot-child interview is complete.
Return ONLY valid JSON: {"complete": true/false, "reason": "brief reason"}
An interview is complete when:
- The child has answered 5 or more turns, OR
- The child clearly said they are done sharing, OR
- The mascot's last message asked for permission to share and the child responded."""


def build_conversation_messages(turns: List[dict]) -> List[dict]:
    messages = []
    for turn in turns:
        role = "assistant" if turn["role"] == "mascot" else "user"
        messages.append({"role": role, "content": turn["content"]})
    return messages


def generate_mascot_reply(turns: List[dict], child_message: str) -> str:
    client = get_client()
    messages = build_conversation_messages(turns)
    messages.append({"role": "user", "content": child_message})

    response = client.messages.create(
        model=MODEL,
        max_tokens=200,
        system=MASCOT_SYSTEM,
        messages=messages,
    )
    return response.content[0].text.strip()


def check_interview_complete(turns: List[dict]) -> Tuple[bool, str]:
    if len(turns) < 10:  # Less than 5 full exchanges (10 turns: 5 mascot + 5 child)
        child_turns = [t for t in turns if t["role"] == "child"]
        if len(child_turns) < 5:
            return False, "interview not yet complete"

    client = get_client()
    conversation_json = json.dumps(
        [{"role": t["role"], "message": t["content"]} for t in turns],
        ensure_ascii=False
    )
    response = client.messages.create(
        model=MODEL,
        max_tokens=100,
        system=COMPLETION_CHECK_SYSTEM,
        messages=[{"role": "user", "content": f"Conversation: {conversation_json}"}],
    )
    try:
        result = json.loads(response.content[0].text.strip())
        return result.get("complete", False), result.get("reason", "")
    except json.JSONDecodeError:
        return False, "parse error"


def get_initial_mascot_message(lang: str) -> str:
    """Returns the opening message in the appropriate language."""
    openings = {
        "ja": "やあ！ぼくはSprout！きみのアイデアを聞かせてほしいな🌱 どんなことで「こんなのあったらいいな」って思ったことある？",
        "en": "Hi there! I'm Sprout! 🌱 I love hearing ideas from kids like you! What's something you wish existed in the world?",
        "es": "¡Hola! Soy Sprout! 🌱 ¡Me encanta escuchar las ideas de niños como tú! ¿Qué es algo que desearías que existiera en el mundo?",
        "zh": "你好！我是Sprout！🌱 我很喜欢听小朋友的想法！你有没有想过「要是有这个就好了」的念头？",
        "ko": "안녕! 나는 Sprout야! 🌱 아이들의 아이디어 듣는 걸 정말 좋아해! 세상에 이런 게 있으면 좋겠다고 생각한 적 있어?",
        "fr": "Salut ! Je m'appelle Sprout ! 🌱 J'adore entendre les idées des enfants ! Qu'est-ce que tu aimerais voir exister dans le monde ?",
        "de": "Hallo! Ich bin Sprout! 🌱 Ich höre so gerne die Ideen von Kindern! Was wünschst du dir, dass es auf der Welt geben würde?",
        "pt": "Olá! Eu sou o Sprout! 🌱 Adoro ouvir as ideias das crianças! O que você gostaria que existisse no mundo?",
    }
    return openings.get(lang, openings["en"])
