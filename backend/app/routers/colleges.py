from fastapi import APIRouter, Depends, Query
from typing import List, Optional

from app.models.schemas import CollegeEntry, DropdownOptions
from app.core.database import cutoffs_col
from app.core.security import get_current_user
from app.utils.data import BRANCH_MAPPING  # ✅ import mapping

router = APIRouter(prefix="/api/colleges", tags=["colleges"])

@router.get("/options", response_model=DropdownOptions)
def get_dropdown_options(current_user: dict = Depends(get_current_user)):
    """Return dropdown values (generalized branches + DB distinct values)."""
    col = cutoffs_col()

    cities = sorted([c for c in col.distinct("district") if c])
    seat_types = sorted([s for s in col.distinct("category") if s])
    statuses = sorted([s for s in col.distinct("status") if s])  # ✅ fixed case

    # ✅ Use generalized branch list from mapping keys
    branches = sorted(list(BRANCH_MAPPING.keys()))

    return DropdownOptions(
    cities=cities,
    branches=branches,
    seat_types=seat_types,
    statuses=statuses,
    )

@router.get("/search", response_model=List[CollegeEntry])
def search_colleges(
    percentile: float = Query(...),
    seat_types: str = Query(...),
    preferred_cities: Optional[str] = None,
    preferred_branches: Optional[str] = None,
    current_user: dict = Depends(get_current_user),
    ):
    col = cutoffs_col()

    # ─── PARSE INPUT ─────────────────────
    category_list = [s.strip() for s in seat_types.split(",") if s.strip()]

    city_list = (
    [c.strip() for c in preferred_cities.split(",") if c.strip()]
    if preferred_cities else []
    )

    selected_general_branches = (
    [b.strip() for b in preferred_branches.split(",") if b.strip()]
    if preferred_branches else []
    )

    # ─── EXPAND GENERALIZED BRANCHES ─────────────────────
    expanded_branches = []

    for gb in selected_general_branches:
        if gb in BRANCH_MAPPING:
            expanded_branches.extend(BRANCH_MAPPING[gb])
        else:
            expanded_branches.append(gb)  # fallback

    expanded_branches = list(set(expanded_branches))  # remove duplicates

    # ─── BUILD QUERY ─────────────────────
    lower_bound = percentile - 5
    upper_bound = percentile + 5

    query = {
    "category": {"$in": category_list},
    "percentile": {
        "$gte": lower_bound,
        "$lte": upper_bound
    }
    }

    if city_list:
        query["district"] = {"$in": city_list}

    if expanded_branches:
        query["branch_name"] = {"$in": expanded_branches}

    # ─── FETCH DATA ─────────────────────
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
            status=d.get("status", ""),  # ✅ consistent
            city=d.get("district"),
            seat_type=d.get("category", ""),
            cutoff_rank=int(d.get("rank", 0)),
            cutoff_percentile=float(d.get("percentile", 0)),
            )
        )

    return results
