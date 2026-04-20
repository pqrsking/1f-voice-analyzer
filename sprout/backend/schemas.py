from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel


# ── Ideas ──────────────────────────────────────────────────────────────────

class IdeaStartRequest(BaseModel):
    constellation_token: str
    submitted_lang: str
    input_type: str = "text"  # "text" | "voice"


class IdeaStartResponse(BaseModel):
    idea_id: str
    first_mascot_message: str


class IdeaRespondRequest(BaseModel):
    constellation_token: str
    message: str


class IdeaRespondResponse(BaseModel):
    mascot_reply: str
    is_interview_complete: bool
    turn_index: int


class DreamGenomeStage(BaseModel):
    key: str
    label_ja: str
    label_en: str
    completed: bool
    active: bool


class IdeaStatusResponse(BaseModel):
    idea_id: str
    status: str
    child_summary: Optional[str]
    dream_genome_stages: List[DreamGenomeStage]


class IdeaCardResponse(BaseModel):
    idea_id: str
    category: str
    status: str
    interest_count: int
    complexity_level: Optional[str]
    child_summary: Optional[str]
    submitted_lang: str
    has_claim: bool
    created_at: datetime


class IdeaListResponse(BaseModel):
    ideas: List[IdeaCardResponse]
    total: int
    page: int
    has_more: bool


class InterestRequest(BaseModel):
    session_token: str


class InterestResponse(BaseModel):
    new_count: int


# ── Specs ──────────────────────────────────────────────────────────────────

class CoreRequirement(BaseModel):
    id: str
    priority: str  # "must" | "should" | "could"
    text: str


class IdeaSpecResponse(BaseModel):
    id: str
    idea_id: str
    language: str
    problem_statement: str
    core_requirements: List[CoreRequirement]
    suggested_tech: List[str]
    complexity_level: str
    estimated_hours: Optional[int]
    open_questions: List[str]
    # Child's Heart
    emotion_driver: str
    imagined_user: str
    magic_moment: str
    childs_exact_words: Optional[str]


# ── Engineers ──────────────────────────────────────────────────────────────

class EngineerRegisterRequest(BaseModel):
    display_name: str
    email_hash: str   # SHA-256 of email, hashed client-side
    github_url: Optional[str] = None
    skills: List[str] = []
    languages: List[str] = []
    bio: Optional[str] = None


class EngineerResponse(BaseModel):
    id: str
    display_name: str
    github_url: Optional[str]
    skills: List[str]
    languages: List[str]
    bio: Optional[str]
    badge_ids: List[str]
    total_builds: int
    children_helped: int
    created_at: datetime


class ClaimRequest(BaseModel):
    engineer_id: str


class ClaimUpdateRequest(BaseModel):
    status: str
    delivery_url: Optional[str] = None
    delivery_notes: Optional[str] = None


class ClaimResponse(BaseModel):
    claim_id: str
    status: str


# ── Wonder Wall ────────────────────────────────────────────────────────────

class WallSeed(BaseModel):
    idea_id: str
    category: str
    status: str
    interest_count: int
    age_hours: float
    has_claim: bool


class WallSeedsResponse(BaseModel):
    seeds: List[WallSeed]


# ── Radar ──────────────────────────────────────────────────────────────────

class RadarCell(BaseModel):
    category: str
    theme: str
    count: int
    weight: float


class RadarResponse(BaseModel):
    grid: List[RadarCell]
    generated_at: datetime


# ── Translation ────────────────────────────────────────────────────────────

class ConceptTranslateRequest(BaseModel):
    text: str
    source_lang: str
    target_lang: str


class ConceptTranslateResponse(BaseModel):
    translated_text: str
    extracted_concepts: List[str]
    clarification_needed: bool
