import json
import uuid
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from database import get_db
from models import Idea, IdeaSpec, InterviewTurn, InterestVote, Claim
from schemas import (
    IdeaStartRequest, IdeaStartResponse,
    IdeaRespondRequest, IdeaRespondResponse,
    IdeaStatusResponse, DreamGenomeStage,
    IdeaListResponse, IdeaCardResponse,
    InterestRequest, InterestResponse,
    IdeaSpecResponse, CoreRequirement,
)
from services.idea_alchemy import (
    generate_mascot_reply, check_interview_complete, get_initial_mascot_message
)
from routers.wonderwall import publish_event

router = APIRouter(prefix="/api/v1/ideas", tags=["ideas"])

STATUS_TO_STAGES = {
    "interviewing": 1,
    "specced": 2,
    "claimed": 3,
    "building": 4,
    "deployed": 5,
}

STAGES = [
    ("told_us",      "あなたが話してくれた",    "You Told Us"),
    ("sprout_heard", "Sproutが聞いた",          "Sprout Listened"),
    ("blueprinting", "設計図を作成中",           "Making the Blueprint"),
    ("engineer_found","技術者が見つけた",        "An Engineer Found It"),
    ("being_built",  "作られている",             "Being Built"),
    ("real_world",   "世界に存在する",           "Real in the World"),
]


def build_genome_stages(status: str) -> list[DreamGenomeStage]:
    completed_up_to = STATUS_TO_STAGES.get(status, 0)
    if status == "deployed":
        completed_up_to = 6
    stages = []
    for i, (key, ja, en) in enumerate(STAGES, start=1):
        stages.append(DreamGenomeStage(
            key=key,
            label_ja=ja,
            label_en=en,
            completed=i <= completed_up_to,
            active=i == completed_up_to + 1 if i > completed_up_to else False,
        ))
    return stages


@router.post("/start", response_model=IdeaStartResponse)
def start_idea(req: IdeaStartRequest, db: Session = Depends(get_db)):
    idea = Idea(
        id=str(uuid.uuid4()),
        constellation_token=req.constellation_token,
        submitted_lang=req.submitted_lang,
        category="other",
        status="interviewing",
    )
    db.add(idea)

    first_message = get_initial_mascot_message(req.submitted_lang)
    turn = InterviewTurn(
        idea_id=idea.id,
        role="mascot",
        content=first_message,
        turn_index=0,
    )
    db.add(turn)
    db.commit()

    return IdeaStartResponse(idea_id=idea.id, first_mascot_message=first_message)


@router.post("/{idea_id}/respond", response_model=IdeaRespondResponse)
def respond_to_interview(
    idea_id: str, req: IdeaRespondRequest, db: Session = Depends(get_db)
):
    idea = db.query(Idea).filter(Idea.id == idea_id).first()
    if not idea:
        raise HTTPException(status_code=404, detail="Idea not found")
    if idea.constellation_token != req.constellation_token:
        raise HTTPException(status_code=403, detail="Token mismatch")

    turns = (
        db.query(InterviewTurn)
        .filter(InterviewTurn.idea_id == idea_id)
        .order_by(InterviewTurn.turn_index)
        .all()
    )
    turn_dicts = [{"role": t.role, "content": t.content} for t in turns]

    child_idx = len(turns)
    child_turn = InterviewTurn(
        idea_id=idea_id,
        role="child",
        content=req.message,
        turn_index=child_idx,
    )
    db.add(child_turn)

    # Store raw text (wiped after spec generation)
    if not idea.raw_text:
        idea.raw_text = req.message
    else:
        idea.raw_text = idea.raw_text + "\n" + req.message

    turn_dicts.append({"role": "child", "content": req.message})

    complete, _ = check_interview_complete(turn_dicts)

    if complete:
        mascot_reply = _get_closing_message(idea.submitted_lang)
        mascot_turn = InterviewTurn(
            idea_id=idea_id, role="mascot", content=mascot_reply, turn_index=child_idx + 1
        )
        db.add(mascot_turn)
        idea.status = "specced"
        db.commit()

        # Trigger async spec generation (fire-and-forget via background task)
        _trigger_spec_generation(idea_id)

        return IdeaRespondResponse(
            mascot_reply=mascot_reply,
            is_interview_complete=True,
            turn_index=child_idx + 1,
        )

    mascot_reply = generate_mascot_reply(turn_dicts, req.message)
    mascot_turn = InterviewTurn(
        idea_id=idea_id, role="mascot", content=mascot_reply, turn_index=child_idx + 1
    )
    db.add(mascot_turn)
    db.commit()

    return IdeaRespondResponse(
        mascot_reply=mascot_reply,
        is_interview_complete=False,
        turn_index=child_idx + 1,
    )


def _get_closing_message(lang: str) -> str:
    messages = {
        "ja": "すごい！きみのアイデア、ちゃんと全部聞いたよ🌟 今から世界中の技術者さんたちに伝えるね。きみのアイデアが現実になるのを一緒に見守ろう！",
        "en": "Amazing! I heard every bit of your idea 🌟 I'm going to share it with builders around the world. Let's watch your dream come to life together!",
        "es": "¡Increíble! Escuché toda tu idea 🌟 Voy a compartirla con constructores de todo el mundo. ¡Veamos juntos cómo tu sueño se hace realidad!",
    }
    return messages.get(lang, messages["en"])


def _trigger_spec_generation(idea_id: str):
    """Fire-and-forget: generate spec in background thread."""
    import threading
    threading.Thread(target=_run_spec_generation, args=(idea_id,), daemon=True).start()


def _run_spec_generation(idea_id: str):
    from database import SessionLocal
    from services.spec_generator import generate_spec
    import json

    db = SessionLocal()
    try:
        idea = db.query(Idea).filter(Idea.id == idea_id).first()
        if not idea:
            return
        turns = (
            db.query(InterviewTurn)
            .filter(InterviewTurn.idea_id == idea_id)
            .order_by(InterviewTurn.turn_index)
            .all()
        )
        turn_dicts = [{"role": t.role, "content": t.content} for t in turns]
        spec_data = generate_spec(turn_dicts, idea.submitted_lang)

        spec = IdeaSpec(
            idea_id=idea_id,
            language="en",
            is_source=True,
            problem_statement=spec_data.get("problem_statement", ""),
            core_requirements=json.dumps(spec_data.get("core_requirements", []), ensure_ascii=False),
            suggested_tech=json.dumps(spec_data.get("suggested_tech", []), ensure_ascii=False),
            complexity_level=spec_data.get("complexity_level", "intermediate"),
            estimated_hours=spec_data.get("estimated_hours"),
            open_questions=json.dumps(spec_data.get("open_questions", []), ensure_ascii=False),
            emotion_driver=spec_data.get("emotion_driver", ""),
            imagined_user=spec_data.get("imagined_user", ""),
            magic_moment=spec_data.get("magic_moment", ""),
            childs_exact_words=spec_data.get("childs_exact_words"),
        )
        db.add(spec)

        idea.category = spec_data.get("category", "other")
        idea.child_summary = spec_data.get("child_summary", "")
        idea.specced_at = datetime.utcnow()
        idea.raw_text = None
        idea.raw_deleted_at = datetime.utcnow()

        db.commit()

        publish_event("seed_updated", {
            "idea_id": idea_id,
            "category": idea.category,
            "status": "specced",
            "interest_count": idea.interest_count,
        })
    except Exception as e:
        print(f"Spec generation error for {idea_id}: {e}")
    finally:
        db.close()


@router.get("/{idea_id}/status", response_model=IdeaStatusResponse)
def get_idea_status(idea_id: str, db: Session = Depends(get_db)):
    idea = db.query(Idea).filter(Idea.id == idea_id).first()
    if not idea:
        raise HTTPException(status_code=404, detail="Idea not found")
    return IdeaStatusResponse(
        idea_id=idea.id,
        status=idea.status,
        child_summary=idea.child_summary,
        dream_genome_stages=build_genome_stages(idea.status),
    )


@router.get("/{idea_id}/spec", response_model=IdeaSpecResponse)
def get_idea_spec(idea_id: str, lang: str = "en", db: Session = Depends(get_db)):
    spec = (
        db.query(IdeaSpec)
        .filter(IdeaSpec.idea_id == idea_id, IdeaSpec.language == lang)
        .first()
    )
    if not spec:
        # Try English source and translate on-demand
        source = (
            db.query(IdeaSpec)
            .filter(IdeaSpec.idea_id == idea_id, IdeaSpec.is_source == True)
            .first()
        )
        if not source:
            raise HTTPException(status_code=404, detail="Spec not yet generated")
        if lang == "en":
            spec = source
        else:
            from services.translator import translate_spec
            source_data = _spec_to_dict(source)
            translated = translate_spec(source_data, lang)
            spec = IdeaSpec(
                idea_id=idea_id,
                language=lang,
                is_source=False,
                **{k: json.dumps(v, ensure_ascii=False) if isinstance(v, (list, dict)) else v
                   for k, v in translated.items()
                   if k not in ("idea_id", "language", "is_source", "id", "created_at")}
            )
            db.add(spec)
            db.commit()
            db.refresh(spec)

    return _spec_to_response(spec)


def _spec_to_dict(spec: IdeaSpec) -> dict:
    return {
        "problem_statement": spec.problem_statement,
        "core_requirements": json.loads(spec.core_requirements or "[]"),
        "suggested_tech": json.loads(spec.suggested_tech or "[]"),
        "complexity_level": spec.complexity_level,
        "estimated_hours": spec.estimated_hours,
        "open_questions": json.loads(spec.open_questions or "[]"),
        "emotion_driver": spec.emotion_driver,
        "imagined_user": spec.imagined_user,
        "magic_moment": spec.magic_moment,
        "childs_exact_words": spec.childs_exact_words,
    }


def _spec_to_response(spec: IdeaSpec) -> IdeaSpecResponse:
    reqs_raw = json.loads(spec.core_requirements or "[]")
    requirements = [
        CoreRequirement(**r) if isinstance(r, dict) else CoreRequirement(id="R?", priority="must", text=str(r))
        for r in reqs_raw
    ]
    return IdeaSpecResponse(
        id=spec.id,
        idea_id=spec.idea_id,
        language=spec.language,
        problem_statement=spec.problem_statement,
        core_requirements=requirements,
        suggested_tech=json.loads(spec.suggested_tech or "[]"),
        complexity_level=spec.complexity_level,
        estimated_hours=spec.estimated_hours,
        open_questions=json.loads(spec.open_questions or "[]"),
        emotion_driver=spec.emotion_driver,
        imagined_user=spec.imagined_user,
        magic_moment=spec.magic_moment,
        childs_exact_words=spec.childs_exact_words,
    )


@router.get("", response_model=IdeaListResponse)
def list_ideas(
    category: Optional[str] = None,
    lang: str = "en",
    complexity: Optional[str] = None,
    status: str = "specced",
    page: int = 1,
    db: Session = Depends(get_db),
):
    q = db.query(Idea).filter(Idea.status.in_(["specced", "claimed", "building", "deployed"]))
    if category:
        q = q.filter(Idea.category == category)
    if status != "all":
        q = q.filter(Idea.status == status)
    total = q.count()
    page_size = 20
    ideas = q.order_by(Idea.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()

    cards = []
    for idea in ideas:
        spec = (
            db.query(IdeaSpec)
            .filter(IdeaSpec.idea_id == idea.id, IdeaSpec.language == "en")
            .first()
        )
        has_claim = db.query(Claim).filter(Claim.idea_id == idea.id).first() is not None
        cards.append(IdeaCardResponse(
            idea_id=idea.id,
            category=idea.category,
            status=idea.status,
            interest_count=idea.interest_count,
            complexity_level=spec.complexity_level if spec else None,
            child_summary=idea.child_summary,
            submitted_lang=idea.submitted_lang,
            has_claim=has_claim,
            created_at=idea.created_at,
        ))

    return IdeaListResponse(ideas=cards, total=total, page=page, has_more=total > page * page_size)


@router.post("/{idea_id}/interest", response_model=InterestResponse)
def vote_interest(idea_id: str, req: InterestRequest, db: Session = Depends(get_db)):
    idea = db.query(Idea).filter(Idea.id == idea_id).first()
    if not idea:
        raise HTTPException(status_code=404, detail="Idea not found")

    existing = (
        db.query(InterestVote)
        .filter(InterestVote.idea_id == idea_id, InterestVote.session_token == req.session_token)
        .first()
    )
    if not existing:
        db.add(InterestVote(idea_id=idea_id, session_token=req.session_token))
        idea.interest_count += 1
        db.commit()
    return InterestResponse(new_count=idea.interest_count)
