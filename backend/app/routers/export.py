import os
from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import FileResponse
from bson import ObjectId
from datetime import datetime

from app.models.schemas import ExportRequest, ExportResponse
from app.core.database import students_col
from app.core.security import get_current_user
from app.services import pdf_service, cloudinary_service

router = APIRouter(prefix="/api/export", tags=["export"])


@router.post("/", response_model=ExportResponse)
def export_preference_list(
    body: ExportRequest,
    current_user: dict = Depends(get_current_user),
):
    """
    1. Fetch student from DB (ownership check)
    2. Fill docx template → convert to PDF
    3. Upload PDF to Cloudinary
    4. Update student record with pdf_url
    5. Return pdf_url so frontend can trigger download
    """
    # 1. Fetch student
    student = students_col().find_one(
        {"_id": ObjectId(body.student_id), "created_by": current_user["username"]}
    )
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    # 2. Generate PDF
    try:
        pdf_path = pdf_service.fill_template(
            student_name=student["name"],
            counselling_id=student.get("counselling_id") or "—",
            percentile=student["percentile"],
            rank=student["rank"],          
            mobile=student["mobile"],
            category=student.get("category_label") or (
                student["seat_types"][0] if student.get("seat_types") else "OPEN"
            ),
            preferred_cities=student.get("preferred_cities", []),
            preferred_branches=student.get("preferred_branches", []),
            preference_list=body.ordered_list,
        )
        print(body.ordered_list)
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))

    # 3. Upload to Cloudinary
    safe_name = student["name"].replace(" ", "_")
    public_id = f"{current_user['username']}/{safe_name}_{body.student_id}"

    try:
        result = cloudinary_service.upload_pdf(pdf_path, public_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Cloudinary upload failed: {e}")
    finally:
        # Clean up temp files
        try:
            os.remove(pdf_path)
            docx_path = pdf_path.replace(".pdf", ".docx")
            if os.path.exists(docx_path):
                os.remove(docx_path)
        except OSError:
            pass

    # 4. Update student record
    students_col().update_one(
        {"_id": ObjectId(body.student_id)},
        {
            "$set": {
                "pdf_url": result["url"],
                "cloudinary_public_id": result["public_id"],
                "updated_at": datetime.utcnow(),
            }
        },
    )

    return ExportResponse(
        pdf_url=result["url"],
        cloudinary_public_id=result["public_id"],
        student_id=body.student_id,
    )
