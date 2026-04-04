#!/usr/bin/env python3
"""
Create a user manually in MongoDB Atlas.

Usage:
    python scripts/create_user.py --username admin --password secret123 --full_name "Admin User"

Requires: MONGODB_URL set in backend/.env
"""
import argparse
import sys
import os

# Allow running from project root or scripts/ directory
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), "../.env"))

from app.core.database import users_col
from app.core.security import hash_password
from datetime import datetime


def create_user(username: str, password: str, full_name: str = ""):
    col = users_col()

    if col.find_one({"username": username}):
        print(f"❌  User '{username}' already exists.")
        return

    col.insert_one({
        "username": username,
        "password": hash_password(password),
        "full_name": full_name,
        "created_at": datetime.utcnow(),
    })
    print(f"✅  User '{username}' created successfully.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Create an MHTCET PLG user")
    parser.add_argument("--username",  required=True)
    parser.add_argument("--password",  required=True)
    parser.add_argument("--full_name", default="")
    args = parser.parse_args()
    create_user(args.username, args.password, args.full_name)
