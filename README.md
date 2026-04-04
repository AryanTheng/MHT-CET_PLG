# MHTCET Preference List Generator

Full-stack web app for counsellors to generate and export student college preference lists.

**Stack:** FastAPI · PyMongo · React (Vite) · Cloudinary · LibreOffice (PDF)

---

## Project Structure

```
mhtcet/
├── backend/
│   ├── app/
│   │   ├── core/          # config, database, security (JWT)
│   │   ├── models/        # Pydantic schemas
│   │   ├── routers/       # auth, students, colleges, export
│   │   ├── services/      # pdf_service, cloudinary_service
│   │   └── templates/     # preference_list_template.docx
│   ├── scripts/
│   │   └── create_user.py
│   ├── main.py
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── api/           # axios modules per resource
    │   ├── components/
    │   │   ├── pages/     # LoginPage, RecordsPage, ToolPage, StudentForm, CollegeList
    │   │   └── ui/        # shared components (NavBar, MultiSelect, etc.)
    │   ├── hooks/         # useAuth, useStudents, useDraggableList
    │   └── utils/         # theme tokens
    ├── index.html
    ├── package.json
    └── vite.config.js
```

---

## Prerequisites

- Python 3.11+
- Node.js 18+
- MongoDB Atlas account (free tier works)
- Cloudinary account (free tier works)
- LibreOffice (for PDF conversion)

### Install LibreOffice

```bash
# Ubuntu / Debian
sudo apt-get update && sudo apt-get install -y libreoffice

# macOS
brew install --cask libreoffice

# Windows
# Download from https://www.libreoffice.org/download/download/
```

---

## Backend Setup

### 1. Create virtual environment & install deps

```bash
cd mhtcet/backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Create your .env file

```bash
cp .env.example .env
```

Edit `.env` with your real values:

```env
MONGODB_URL=mongodb+srv://<user>:<password>@cluster.mongodb.net/mhtcet?retryWrites=true&w=majority
DATABASE_NAME=mhtcet

JWT_SECRET=change-this-to-a-long-random-string-minimum-32-chars
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=480

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

FRONTEND_URL=http://localhost:5173
```

### 3. Seed the cutoff data into MongoDB

Your cutoff data lives in the `Cap1Cutoff` collection in MongoDB.

**Option A — mongoimport from CSV:**
```bash
mongoimport \
  --uri "$MONGODB_URL" \
  --collection Cap1Cutoff \
  --type csv \
  --headerline \
  --file your_cutoff_data.csv
```

**Option B — Python script (if data is in CSV/Excel):**
```python
import pandas as pd
from pymongo import MongoClient

client = MongoClient("your_mongodb_url")
db = client["mhtcet"]

df = pd.read_csv("cutoff_data.csv")
# Ensure column names match: College Code, College Name, Branch Code,
# Branch Name, Status, City, Seat Type, Category, Rank, Percentile
db["Cap1Cutoff"].insert_many(df.to_dict("records"))
print(f"Inserted {len(df)} records")
```

**Expected column names in Cap1Cutoff:**
| Column | Example |
|--------|---------|
| College Code | 01002 |
| College Name | Government College of Engineering, Amravati |
| Branch Code | 0100219110 |
| Branch Name | Civil Engineering |
| Status | Government Autonomous Home University : Autonomous Institute |
| City | Amravati |
| Seat Type | GOPENS |
| Category | State Level |
| Rank | 37591 |
| Percentile | 88.9550679 |

**Create indexes for fast queries:**
```python
db["Cap1Cutoff"].create_index([("Percentile", -1)])
db["Cap1Cutoff"].create_index([("Seat Type", 1)])
db["Cap1Cutoff"].create_index([("City", 1)])
db["Cap1Cutoff"].create_index([("Branch Name", 1)])
```

### 4. Create your first user

```bash
cd mhtcet/backend
python scripts/create_user.py \
  --username admin \
  --password yourpassword \
  --full_name "Admin User"
```

> Users are intentionally created manually — no self-registration.  
> Run this script once per counsellor account.

### 5. Run the backend

```bash
cd mhtcet/backend
uvicorn main:app --reload --port 8000
```

API docs available at: http://localhost:8000/docs

---

## Frontend Setup

```bash
cd mhtcet/frontend
npm install
npm run dev
```

Open http://localhost:5173

> The Vite dev server proxies `/api` → `http://localhost:8000` automatically.  
> No CORS issues in development.

---

## Full User Flow

```
1. Login          → /api/auth/login  → JWT stored in localStorage
2. Dashboard      → /api/students/   → all students for this counsellor
3. New Student    → fill form (name, percentile, rank, city, branches, seat types)
4. Save Student   → POST /api/students/ → auto-searches colleges
5. College List   → GET /api/colleges/search?percentile=94.5&seat_types=GOPENS,...
                   → returns colleges within ±5 percentile, filtered by preferences
6. Drag & reorder the list, remove unwanted colleges
7. Export PDF     → POST /api/export/
                   → fills docx template → LibreOffice → PDF
                   → uploads to Cloudinary
                   → saves URL to student record in MongoDB
                   → browser auto-downloads the PDF
8. Future visits  → PDF download link visible in student table
```

---

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/login | Login, returns JWT |
| GET | /api/auth/me | Current user info |
| GET | /api/students/ | List all students (auth scoped) |
| POST | /api/students/ | Create student |
| GET | /api/students/:id | Get student |
| PUT | /api/students/:id | Update student |
| DELETE | /api/students/:id | Delete student |
| GET | /api/colleges/options | Dropdown values from DB |
| GET | /api/colleges/search | Search colleges by percentile/filters |
| POST | /api/export/ | Generate PDF, upload Cloudinary |

---

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| MONGODB_URL | ✅ | MongoDB Atlas connection string |
| DATABASE_NAME | ✅ | Database name (default: mhtcet) |
| JWT_SECRET | ✅ | Secret for signing JWT tokens |
| JWT_ALGORITHM | | HS256 (default) |
| ACCESS_TOKEN_EXPIRE_MINUTES | | 480 = 8 hours (default) |
| CLOUDINARY_CLOUD_NAME | ✅ | From Cloudinary dashboard |
| CLOUDINARY_API_KEY | ✅ | From Cloudinary dashboard |
| CLOUDINARY_API_SECRET | ✅ | From Cloudinary dashboard |
| FRONTEND_URL | | http://localhost:5173 (default) |

---

## Troubleshooting

**PDF generation fails:**
- Make sure LibreOffice is installed: `libreoffice --version`
- On Linux servers: `sudo apt-get install -y libreoffice`
- The backend catches the error and returns a 500 with instructions

**MongoDB connection error:**
- Check your MONGODB_URL includes the database name
- Whitelist your IP in MongoDB Atlas → Network Access

**Dropdowns empty:**
- Verify Cap1Cutoff collection has data
- Check column names exactly match (case-sensitive): `City`, `Branch Name`, `Seat Type`

**CORS error:**
- Make sure FRONTEND_URL in .env matches exactly where your frontend runs
- In dev, the Vite proxy handles this — don't hit the API directly on port 8000

**401 on every request:**
- Token expired (default 8h) — log out and log back in
- Check JWT_SECRET is the same as when the token was issued
