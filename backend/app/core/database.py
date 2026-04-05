from pymongo import MongoClient
from pymongo.database import Database
from app.core.config import get_settings

_client: MongoClient | None = None


def get_client() -> MongoClient:
    global _client
    if _client is None:
        settings = get_settings()
        _client = MongoClient(settings.mongodb_url)
    return _client


def get_db() -> Database:
    settings = get_settings()
    return get_client()[settings.database_name]


def close_db():
    global _client
    if _client:
        _client.close()
        _client = None


# ── Collection accessors ──────────────────────────────────────────────────────

def users_col():
    return get_db()["users"]


def students_col():
    return get_db()["students"]


def cutoffs_col():
    return get_db()["college_cutoffs"]

def ref_id():
    return get_db()["counters"]
