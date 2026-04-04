from fastapi import APIRouter, Depends, Query
from typing import List, Optional

from app.models.schemas import CollegeEntry, DropdownOptions
from app.core.database import cutoffs_col
from app.core.security import get_current_user

router = APIRouter(prefix="/api/colleges", tags=["colleges"])


@router.get("/options", response_model=DropdownOptions)
def get_dropdown_options(current_user: dict = Depends(get_current_user)):
    """Return all unique dropdown values from the cutoffs collection."""
    col = cutoffs_col()

    cities    = sorted([c for c in col.distinct("district") if c])
    branches  = sorted([b for b in col.distinct("branch_name") if b])
    seat_types = sorted([s for s in col.distinct("category") if s])
    statuses  = sorted([s for s in col.distinct("Status") if s])

    return DropdownOptions(
        cities=cities,
        branches=branches,
        seat_types=seat_types,
        statuses=statuses,
    )


@router.get("/search", response_model=List[CollegeEntry])
def search_colleges(
    percentile: float = Query(...),
    seat_types: str = Query(...),  # actually categories like GOPENS
    preferred_cities: Optional[str] = None,
    preferred_branches: Optional[str] = None,
    current_user: dict = Depends(get_current_user),
):
    # ─── PARSE INPUT ─────────────────────
    category_list = [s.strip() for s in seat_types.split(",") if s.strip()]
    city_list     = [c.strip() for c in preferred_cities.split(",") if c.strip()] if preferred_cities else []
    branch_list   = [b.strip() for b in preferred_branches.split(",") if b.strip()] if preferred_branches else []

    # ─── BUILD QUERY ─────────────────────
    query = {
        "category": {"$in": category_list},   # ✅ FIXED
        "percentile": {"$lte": percentile}    # ✅ student >= cutoff
    }

    if city_list:
        query["district"] = {"$in": city_list}

    if branch_list:
        query["branch_name"] = {"$in": branch_list}

    col = cutoffs_col()

    docs = col.find(query).sort("percentile", -1).limit(200)

    # ─── FORMAT RESPONSE ─────────────────────
    results = []

    for d in docs:
        results.append(
            CollegeEntry(
                college_code=str(d.get("college_code", "")),
                college_name=d.get("college_name", ""),
                branch_code=str(d.get("branch_code", "")),
                branch_name=d.get("branch_name", ""),
                status=d.get("status", ""),
                city=d.get("district"),  # using district
                seat_type=d.get("category", ""),  # returning category as seat_type
                cutoff_rank=int(d.get("rank", 0)),
                cutoff_percentile=float(d.get("percentile", 0)),
            )
        )

    return results
