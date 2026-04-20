import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, Boolean, ForeignKey, Text
from sqlalchemy.orm import relationship
from database import Base


def new_id() -> str:
    return str(uuid.uuid4())


class Idea(Base):
    __tablename__ = "ideas"

    id = Column(String, primary_key=True, default=new_id)
    # One-way SHA-256 hash of the client constellation ID — never the raw string
    constellation_token = Column(String, nullable=False, index=True)
    raw_text = Column(Text, nullable=True)          # Nulled after spec generation
    submitted_lang = Column(String, nullable=False) # BCP-47 e.g. "ja", "en"
    category = Column(String, nullable=False)
    status = Column(String, nullable=False, default="interviewing")
    interest_count = Column(Integer, nullable=False, default=0)
    child_summary = Column(Text, nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    specced_at = Column(DateTime, nullable=True)
    raw_deleted_at = Column(DateTime, nullable=True)

    specs = relationship("IdeaSpec", back_populates="idea", cascade="all, delete-orphan")
    turns = relationship("InterviewTurn", back_populates="idea", cascade="all, delete-orphan")
    claims = relationship("Claim", back_populates="idea", cascade="all, delete-orphan")
    votes = relationship("InterestVote", back_populates="idea", cascade="all, delete-orphan")


class IdeaSpec(Base):
    __tablename__ = "idea_specs"

    id = Column(String, primary_key=True, default=new_id)
    idea_id = Column(String, ForeignKey("ideas.id", ondelete="CASCADE"), nullable=False)
    language = Column(String, nullable=False)
    is_source = Column(Boolean, nullable=False, default=False)
    problem_statement = Column(Text, nullable=False)
    core_requirements = Column(Text, nullable=False)  # JSON array
    suggested_tech = Column(Text, nullable=False)     # JSON array
    complexity_level = Column(String, nullable=False)
    estimated_hours = Column(Integer, nullable=True)
    open_questions = Column(Text, nullable=True)      # JSON array
    # Child's Heart section
    emotion_driver = Column(Text, nullable=False)
    imagined_user = Column(Text, nullable=False)
    magic_moment = Column(Text, nullable=False)
    childs_exact_words = Column(Text, nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    idea = relationship("Idea", back_populates="specs")


class InterviewTurn(Base):
    __tablename__ = "interview_turns"

    id = Column(String, primary_key=True, default=new_id)
    idea_id = Column(String, ForeignKey("ideas.id", ondelete="CASCADE"), nullable=False)
    role = Column(String, nullable=False)   # "mascot" | "child"
    content = Column(Text, nullable=False)
    turn_index = Column(Integer, nullable=False)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    idea = relationship("Idea", back_populates="turns")


class Engineer(Base):
    __tablename__ = "engineers"

    id = Column(String, primary_key=True, default=new_id)
    display_name = Column(String, nullable=False)
    email_hash = Column(String, nullable=False, unique=True)  # SHA-256 only, raw email never stored
    github_url = Column(String, nullable=True)
    skills = Column(Text, nullable=False, default="[]")    # JSON array
    languages = Column(Text, nullable=False, default="[]") # JSON array of BCP-47
    bio = Column(Text, nullable=True)
    badge_ids = Column(Text, nullable=False, default="[]") # JSON array
    total_builds = Column(Integer, nullable=False, default=0)
    children_helped = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    claims = relationship("Claim", back_populates="engineer", cascade="all, delete-orphan")


class Claim(Base):
    __tablename__ = "claims"

    id = Column(String, primary_key=True, default=new_id)
    idea_id = Column(String, ForeignKey("ideas.id", ondelete="CASCADE"), nullable=False)
    engineer_id = Column(String, ForeignKey("engineers.id", ondelete="CASCADE"), nullable=False)
    claimed_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    status = Column(String, nullable=False, default="building")
    delivery_url = Column(String, nullable=True)
    delivery_notes = Column(Text, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    is_first_claim = Column(Boolean, nullable=False, default=False)

    idea = relationship("Idea", back_populates="claims")
    engineer = relationship("Engineer", back_populates="claims")


class NeedCluster(Base):
    __tablename__ = "need_clusters"

    id = Column(String, primary_key=True, default=new_id)
    category = Column(String, nullable=False)
    theme_label = Column(String, nullable=False)
    idea_count = Column(Integer, nullable=False, default=0)
    region_weights = Column(Text, nullable=False, default="{}")  # JSON
    last_updated = Column(DateTime, nullable=False, default=datetime.utcnow)


class InterestVote(Base):
    __tablename__ = "interest_votes"

    id = Column(String, primary_key=True, default=new_id)
    idea_id = Column(String, ForeignKey("ideas.id", ondelete="CASCADE"), nullable=False)
    session_token = Column(String, nullable=False)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    idea = relationship("Idea", back_populates="votes")
