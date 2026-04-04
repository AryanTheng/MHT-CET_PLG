import cloudinary
import cloudinary.uploader
from app.core.config import get_settings


def _configure():
    s = get_settings()
    cloudinary.config(
        cloud_name=s.cloudinary_cloud_name,
        api_key=s.cloudinary_api_key,
        api_secret=s.cloudinary_api_secret,
        secure=True,
    )


def upload_pdf(file_path: str, public_id: str) -> dict:
    """Upload a PDF to Cloudinary and return {url, public_id}."""
    _configure()
    result = cloudinary.uploader.upload(
        file_path,
        public_id=public_id,
        resource_type="raw",
        folder="mhtcet_preference_lists",
        overwrite=True,
    )
    return {
        "url": result["secure_url"],
        "public_id": result["public_id"],
    }


def delete_pdf(public_id: str):
    """Delete a previously uploaded PDF."""
    _configure()
    cloudinary.uploader.destroy(public_id, resource_type="raw")
