from datetime import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models import NeedCluster, Idea
from schemas import RadarResponse, RadarCell

router = APIRouter(prefix="/api/v1/radar", tags=["radar"])


@router.get("/heatmap", response_model=RadarResponse)
def get_heatmap(db: Session = Depends(get_db)):
    clusters = db.query(NeedCluster).order_by(NeedCluster.idea_count.desc()).all()
    if not clusters:
        # Return empty structure
        return RadarResponse(grid=[], generated_at=datetime.utcnow())

    max_count = max(c.idea_count for c in clusters) or 1
    grid = [
        RadarCell(
            category=c.category,
            theme=c.theme_label,
            count=c.idea_count,
            weight=round(c.idea_count / max_count, 3),
        )
        for c in clusters
    ]
    last = max(c.last_updated for c in clusters)
    return RadarResponse(grid=grid, generated_at=last)


@router.post("/refresh")
def refresh_clusters(db: Session = Depends(get_db)):
    """Trigger radar re-clustering (call from a cron job every 6h)."""
    from services.radar_aggregator import run_clustering
    import json

    ideas = db.query(Idea).filter(Idea.child_summary.isnot(None)).all()
    clusters = run_clustering(ideas)

    db.query(NeedCluster).delete()
    for c in clusters:
        db.add(NeedCluster(
            category=c.get("category", "other"),
            theme_label=c.get("theme_label", "Unknown"),
            idea_count=len(c.get("idea_ids", [])),
        ))
    db.commit()
    return {"refreshed": len(clusters)}
