"""Engineer badge award service."""
import json
from datetime import datetime, timedelta
from typing import List


BADGE_DEFINITIONS = [
    {
        "id": "nebula_builder",
        "name": "Nebula Builder",
        "description": "Completed first build",
    },
    {
        "id": "binary_star",
        "name": "Binary Star",
        "description": "Built solutions for two different categories",
    },
    {
        "id": "pulsar",
        "name": "Pulsar",
        "description": "Completed 3 builds within 90 days",
    },
    {
        "id": "galaxy_architect",
        "name": "Galaxy Architect",
        "description": "5 completed builds",
    },
    {
        "id": "deep_field",
        "name": "Deep Field",
        "description": "Built for an idea with 50+ community interest votes",
    },
    {
        "id": "first_light",
        "name": "First Light",
        "description": "First engineer to claim a newly specced idea",
    },
    {
        "id": "cosmic_web",
        "name": "Cosmic Web",
        "description": "10+ builds across 4+ categories",
    },
]


def evaluate_badges(engineer, completed_claims: list) -> List[str]:
    current_ids = json.loads(engineer.badge_ids or "[]")
    new_badges = []

    categories = list({c.idea.category for c in completed_claims if c.idea})
    now = datetime.utcnow()
    recent = [
        c for c in completed_claims
        if c.completed_at and (now - c.completed_at) < timedelta(days=90)
    ]

    checks = {
        "nebula_builder": engineer.total_builds >= 1,
        "binary_star": len(categories) >= 2,
        "pulsar": len(recent) >= 3,
        "galaxy_architect": engineer.total_builds >= 5,
        "cosmic_web": engineer.total_builds >= 10 and len(categories) >= 4,
    }

    for badge_id, earned in checks.items():
        if earned and badge_id not in current_ids:
            new_badges.append(badge_id)

    return new_badges
