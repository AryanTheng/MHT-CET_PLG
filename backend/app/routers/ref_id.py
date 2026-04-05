from fastapi import APIRouter
from pymongo import ReturnDocument
from app.core.database import ref_id

router = APIRouter(prefix="/api/utils", tags=["utils"])

@router.get("/generate-counselling-id")
def generate_counselling_id():
    counter = ref_id()

    result = counter.find_one_and_update(
        {"_id": "counselling_id"},
        {"$inc": {"seq": 1}},
        return_document=ReturnDocument.AFTER,
        upsert=True
    )

    new_id = result["seq"]

    counselling_id = f"MHCET26{new_id}"

    return {"counselling_id": counselling_id}
