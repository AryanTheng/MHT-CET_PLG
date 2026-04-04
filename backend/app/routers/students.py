from fastapi import APIRouter, HTTPException, Depends, status
from bson import ObjectId
from datetime import datetime
from typing import List

from app.models.schemas import StudentCreate, StudentUpdate, StudentResponse
from app.core.database import students_col
from app.core.security import get_current_user

router = APIRouter(prefix="/api/students", tags=["students"])


def _serialize(doc: dict) -> dict:
    doc["id"] = str(doc.pop("_id"))
    return doc


@router.get("/", response_model=List[StudentResponse])
def list_students(current_user: dict = Depends(get_current_user)):
    """Return all students created by the logged-in user."""
    docs = students_col().find({"created_by": current_user["username"]}).sort("created_at", -1)
    return [_serialize(d) for d in docs]


@router.post("/", response_model=StudentResponse, status_code=status.HTTP_201_CREATED)
def create_student(body: StudentCreate, current_user: dict = Depends(get_current_user)):
    now = datetime.utcnow()
    doc = {
        **body.model_dump(),
        "created_by": current_user["username"],
        "created_at": now,
        "updated_at": now,
        "pdf_url": None,
        "cloudinary_public_id": None,
    }
    result = students_col().insert_one(doc)
    doc["_id"] = result.inserted_id
    return _serialize(doc)


@router.get("/{student_id}", response_model=StudentResponse)
def get_student(student_id: str, current_user: dict = Depends(get_current_user)):
    doc = students_col().find_one(
        {"_id": ObjectId(student_id), "created_by": current_user["username"]}
    )
    if not doc:
        raise HTTPException(status_code=404, detail="Student not found")
    return _serialize(doc)


@router.put("/{student_id}", response_model=StudentResponse)
def update_student(
    student_id: str,
    body: StudentUpdate,
    current_user: dict = Depends(get_current_user),
):
    result = students_col().find_one_and_update(
        {"_id": ObjectId(student_id), "created_by": current_user["username"]},
        {"$set": {**body.model_dump(), "updated_at": datetime.utcnow()}},
        return_document=True,
    )
    if not result:
        raise HTTPException(status_code=404, detail="Student not found")
    return _serialize(result)


@router.delete("/{student_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_student(student_id: str, current_user: dict = Depends(get_current_user)):
    result = students_col().delete_one(
        {"_id": ObjectId(student_id), "created_by": current_user["username"]}
    )
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Student not found")
