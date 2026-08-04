import csv
from pathlib import Path

from pymongo import MongoClient

from app.core.config import get_settings


def main():
    settings = get_settings()

    client = MongoClient(settings.mongodb_url)
    db = client[settings.database_name]

    collection = db["cap2_cutoffs"]

    # Optional: clear old data
    collection.delete_many({})

    csv_path = Path("scripts/input/cap2_final.csv")

    documents = []

    with open(csv_path, "r", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)

        for row in reader:
            try:
                documents.append(
                    {
                        "college_code": row["College Code"].strip(),
                        "college_name": row["College Name"].strip(),
                        "branch_code": row["Branch Code"].strip(),
                        "branch_name": row["Branch Name"].strip(),
                        "status": row["Status"].strip(),
                        "seat_type": row["Seat Type"].strip(),
                        "category": row["Category"].strip(),
                        "rank": int(float(row["Rank"])),
                        "percentile": float(row["Percentile"]),
                        "district": row["District"].strip(),
                    }
                )
            except Exception as e:
                print(f"Skipping row: {e}")

    if documents:
        collection.insert_many(documents)

    print(f"Inserted {len(documents)} documents into cap2_cutoffs.")

    # Useful indexes
    collection.create_index("category")
    collection.create_index("district")
    collection.create_index("branch_name")
    collection.create_index("percentile")
    collection.create_index(
        [
            ("category", 1),
            ("district", 1),
            ("branch_name", 1),
            ("percentile", -1),
        ]
    )

    print("Indexes created.")

    client.close()


if __name__ == "__main__":
    main()