import json
import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import Engineer, Claim, Idea
from schemas import (
    EngineerRegisterRequest, EngineerResponse,
    ClaimRequest, ClaimUpdateRequest, ClaimResponse,
)
from services.badge_service import evaluate_badges
from routers.wonderwall import publish_event

router = APIRouter(prefix="/api/v1/engineers", tags=["engineers"])


def _engineer_to_response(eng: Engineer) -> EngineerResponse:
    return EngineerResponse(
        id=eng.id,
        display_name=eng.display_name,
        github_url=eng.github_url,
        skills=json.loads(eng.skills or "[]"),
        languages=json.loads(eng.languages or "[]"),
        bio=eng.bio,
        badge_ids=json.loads(eng.badge_ids or "[]"),
        total_builds=eng.total_builds,
        children_helped=eng.children_helped,
        created_at=eng.created_at,
    )


@router.post("/register", response_model=EngineerResponse)
def register(req: EngineerRegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(Engineer).filter(Engineer.email_hash == req.email_hash).first()
    if existing:
        return _engineer_to_response(existing)

    eng = Engineer(
        id=str(uuid.uuid4()),
        display_name=req.display_name,
        email_hash=req.email_hash,
        github_url=req.github_url,
        skills=json.dumps(req.skills, ensure_ascii=False),
        languages=json.dumps(req.languages, ensure_ascii=False),
        bio=req.bio,
    )
    db.add(eng)
    db.commit()
    db.refresh(eng)
    return _engineer_to_response(eng)


@router.get("/{engineer_id}", response_model=EngineerResponse)
def get_engineer(engineer_id: str, db: Session = Depends(get_db)):
    eng = db.query(Engineer).filter(Engineer.id == engineer_id).first()
    if not eng:
        raise HTTPException(status_code=404, detail="Engineer not found")
    return _engineer_to_response(eng)


@router.post("/{engineer_id}/claim/{idea_id}", response_model=ClaimResponse)
def claim_idea(engineer_id: str, idea_id: str, db: Session = Depends(get_db)):
    eng = db.query(Engineer).filter(Engineer.id == engineer_id).first()
    if not eng:
        raise HTTPException(status_code=404, detail="Engineer not found")
    idea = db.query(Idea).filter(Idea.id == idea_id).first()
    if not idea:
        raise HTTPException(status_code=404, detail="Idea not found")

    existing_claim = db.query(Claim).filter(Claim.idea_id == idea_id, Claim.engineer_id == engineer_id).first()
    if existing_claim:
        return ClaimResponse(claim_id=existing_claim.id, status=existing_claim.status)

    is_first = db.query(Claim).filter(Claim.idea_id == idea_id).count() == 0
    claim = Claim(
        id=str(uuid.uuid4()),
        idea_id=idea_id,
        engineer_id=engineer_id,
        is_first_claim=is_first,
    )
    db.add(claim)

    if is_first:
        idea.status = "claimed"
        # Award First Light badge
        badge_ids = json.loads(eng.badge_ids or "[]")
        if "first_light" not in badge_ids:
            badge_ids.append("first_light")
            eng.badge_ids = json.dumps(badge_ids)

    db.commit()
    publish_event("seed_bloomed", {"idea_id": idea_id, "status": "claimed"})
    return ClaimResponse(claim_id=claim.id, status=claim.status)


@router.patch("/{engineer_id}/claim/{claim_id}", response_model=ClaimResponse)
def update_claim(engineer_id: str, claim_id: str, req: ClaimUpdateRequest, db: Session = Depends(get_db)):
    claim = db.query(Claim).filter(Claim.id == claim_id, Claim.engineer_id == engineer_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")

    claim.status = req.status
    if req.delivery_url:
        claim.delivery_url = req.delivery_url
    if req.delivery_notes:
        claim.delivery_notes = req.delivery_notes

    if req.status in ("submitted", "verified"):
        claim.completed_at = datetime.utcnow()
        eng = db.query(Engineer).filter(Engineer.id == engineer_id).first()
        idea = db.query(Idea).filter(Idea.id == claim.idea_id).first()
        if idea:
            idea.status = "deployed"
            publish_event("seed_sprouted", {"idea_id": idea.id, "status": "deployed"})
        if eng:
            eng.total_builds += 1
            eng.children_helped += 1
            completed_claims = [
                c for c in eng.claims
                if c.completed_at and c.idea
            ]
            new_badges = evaluate_badges(eng, completed_claims)
            if new_badges:
                existing = json.loads(eng.badge_ids or "[]")
                eng.badge_ids = json.dumps(list(set(existing + new_badges)))

    db.commit()
    return ClaimResponse(claim_id=claim.id, status=claim.status)
