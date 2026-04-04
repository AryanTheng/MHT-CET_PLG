from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


# ── Auth ──────────────────────────────────────────────────────────────────────

class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    username: str
    full_name: Optional[str] = None


# ── Student ───────────────────────────────────────────────────────────────────

class StudentCreate(BaseModel):
    name: str
    percentile: float
    rank: int
    home_city: str
    preferred_cities: List[str]
    preferred_branches: List[str]
    seat_types: List[str]          # e.g. ["GOPENS", "GSCS"]
    gender: str                    # Male / Female
    counselling_id: Optional[str] = None
    category_label: Optional[str] = None   # human label e.g. "OPEN"
    notes: Optional[str] = None
    mobile: Optional[str] = None


class StudentUpdate(StudentCreate):
    pass


class StudentResponse(BaseModel):
    id: str
    name: str
    percentile: float
    rank: int
    home_city: str
    preferred_cities: List[str]
    preferred_branches: List[str]
    seat_types: List[str]
    gender: str
    counselling_id: Optional[str] = None
    category_label: Optional[str] = None
    notes: Optional[str] = None
    created_by: str
    created_at: datetime
    updated_at: datetime
    pdf_url: Optional[str] = None
    cloudinary_public_id: Optional[str] = None
    mobile: Optional[str] = None


# ── College List ──────────────────────────────────────────────────────────────

class CollegeEntry(BaseModel):
    college_code: str
    college_name: str
    branch_code: str
    branch_name: str
    status: str
    city: Optional[str] = None
    seat_type: str
    cutoff_rank: int
    cutoff_percentile: float


class PreferenceListItem(BaseModel):
    """One item in the final ordered preference list"""
    sr_no: int
    college_code: str
    college_name: str
    branch_code: str
    branch_name: str
    city: Optional[str] = None
    category: str
    cutoff_percentile: float
    cutoff_rank: int


class ExportRequest(BaseModel):
    student_id: str
    ordered_list: List[PreferenceListItem]


class ExportResponse(BaseModel):
    pdf_url: str
    cloudinary_public_id: str
    student_id: str


# ── Dropdown Options ──────────────────────────────────────────────────────────

class DropdownOptions(BaseModel):
    cities: List[str]
    branches: List[str]
    seat_types: List[str]
    statuses: List[str]
