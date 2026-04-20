"""
Wonder Wall SSE endpoint — live, anonymous global board of ideas.
Uses in-memory asyncio queues for single-process deployments.
"""
import asyncio
import json
from datetime import datetime
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from database import get_db
from models import Idea, Claim
from schemas import WallSeed, WallSeedsResponse

router = APIRouter(prefix="/api/v1/wonderwall", tags=["wonderwall"])

# In-process pub/sub — replace with PostgreSQL LISTEN/NOTIFY for multi-process
_subscribers: list[asyncio.Queue] = []


def publish_event(event_type: str, data: dict):
    """Called from other routers when idea state changes."""
    payload = f"event: {event_type}\ndata: {json.dumps(data)}\n\n"
    for queue in list(_subscribers):
        try:
            queue.put_nowait(payload)
        except asyncio.QueueFull:
            pass


@router.get("/seeds", response_model=WallSeedsResponse)
def get_seeds(db: Session = Depends(get_db)):
    ideas = (
        db.query(Idea)
        .filter(Idea.status.notin_(["interviewing"]))
        .order_by(Idea.created_at.desc())
        .limit(200)
        .all()
    )
    now = datetime.utcnow()
    seeds = []
    for idea in ideas:
        age_hours = (now - idea.created_at).total_seconds() / 3600
        has_claim = db.query(Claim).filter(Claim.idea_id == idea.id).first() is not None
        seeds.append(WallSeed(
            idea_id=idea.id,
            category=idea.category,
            status=idea.status,
            interest_count=idea.interest_count,
            age_hours=round(age_hours, 1),
            has_claim=has_claim,
        ))
    return WallSeedsResponse(seeds=seeds)


@router.get("/stream")
async def stream_wall():
    queue: asyncio.Queue = asyncio.Queue(maxsize=50)
    _subscribers.append(queue)

    async def event_generator():
        try:
            # Send a heartbeat immediately so connection is confirmed
            yield ": heartbeat\n\n"
            while True:
                try:
                    payload = await asyncio.wait_for(queue.get(), timeout=30)
                    yield payload
                except asyncio.TimeoutError:
                    yield ": heartbeat\n\n"
        finally:
            _subscribers.remove(queue)

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )
