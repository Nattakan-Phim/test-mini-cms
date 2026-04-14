# Mini CMS

Full-stack CMS built with **Next.js** (frontend) + **FastAPI / Python** (backend) + **PostgreSQL** (database) + **Docker**.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS, NextAuth |
| Backend | Python, FastAPI, SQLAlchemy, Alembic |
| Database | PostgreSQL 16 (Docker) |
| Auth | NextAuth (frontend) + JWT / bcrypt (backend) |

---

## Project Structure

```
test-mini-cms/
├── README.md
├── backend/
│   ├── docker-compose.yml        # PostgreSQL container
│   ├── requirements.txt
│   ├── alembic.ini
│   ├── schema.sql                # Raw SQL schema reference
│   ├── seed.py                   # Seed admin user + sample articles
│   ├── app/
│   │   ├── main.py               # FastAPI app entry point + CORS
│   │   ├── core/
│   │   │   ├── config.py         # Settings from .env
│   │   │   ├── auth.py           # JWT helpers + bcrypt
│   │   │   └── guards.py         # Dependency guards (require_auth, etc.)
│   │   ├── database/
│   │   │   ├── connection.py     # SQLAlchemy engine & session
│   │   │   └── models.py         # ORM models (User, Article)
│   │   ├── endpoints/
│   │   │   ├── auth.py           # POST /api/auth/login + rate limiting
│   │   │   └── articles.py       # Public & admin article endpoints
│   │   └── schemas/
│   │       ├── auth.py           # LoginRequest, Token
│   │       └── articles.py       # Article request/response schemas
│   └── migrations/
│       └── versions/             # Alembic migration files
└── frontend/
    └── src/
        ├── pages/
        │   ├── index.tsx                  # / — public homepage
        │   ├── login.tsx                  # /login
        │   ├── admin/articles.tsx         # /admin/articles (protected)
        │   ├── articles/[id].tsx          # /articles/[id]
        │   └── api/auth/[...nextauth].ts  # NextAuth handler
        ├── components/
        │   ├── layouts/
        │   │   ├── PublicLayout.tsx
        │   │   └── AdminLayout.tsx
        │   └── ui/
        │       ├── Button.tsx
        │       └── Badge.tsx
        ├── lib/
        │   └── api.ts            # All backend API calls
        └── styles/
            └── globals.css
```

---

## Prerequisites

- Python 3.11+
- Node.js 18+
- Docker Desktop

---

## Getting Started

### 1. Start the Database

```bash
cd backend
docker compose up -d
```

PostgreSQL will be available at `localhost:5432`
- User: `postgres` | Password: `postgres` | Database: `mini_cms`

---

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS / Linux

# Install dependencies
pip install -r requirements.txt

# Run database migrations
alembic upgrade head

# Seed admin user + sample articles
python seed.py

# Start API server
uvicorn app.main:app --reload --port 8000
```

API: `http://localhost:8000`
Swagger docs: `http://localhost:8000/docs`

---

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
bun install

# Start dev server
bun dev
```

Frontend: `http://localhost:3000`

---

## Test Account

| Field    | Value        |
|----------|--------------|
| Username | `admin`      |
| Password | `admin1234`  |

---

## Pages

| URL | Description | Auth Required |
|---|---|---|
| `/` | Public homepage — published articles | No |
| `/articles/[id]` | Article detail — increments view, like button | No |
| `/login` | Admin sign in | No |
| `/admin/articles` | Admin back office — full CRUD | Yes |

---

## API Endpoints

### Auth
| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/login` | Login, returns JWT token. Rate limited: 5 failed attempts / 60s per IP |

### Public Articles
| Method | Path | Description |
|---|---|---|
| GET | `/api/articles` | List published articles |
| GET | `/api/articles/{id}` | Get article detail + increment view_count |
| POST | `/api/articles/{id}/like` | Increment like_count |

### Admin Articles (JWT required)
| Method | Path | Description |
|---|---|---|
| GET | `/api/admin/articles` | List all articles (any status) |
| POST | `/api/admin/articles` | Create article |
| GET | `/api/admin/articles/{id}` | Get single article |
| PUT | `/api/admin/articles/{id}` | Update article |
| DELETE | `/api/admin/articles/{id}` | Delete article |

---

## Environment Variables

### Backend — `backend/.env`
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/mini_cms
SECRET_KEY=your-secret-key-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

### Frontend — `frontend/.env.local`
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-change-this-in-production
```

---

## Daily Development Commands

```bash
# Start DB
cd backend && docker compose up -d

# Start backend (new terminal)
cd backend && venv\Scripts\activate && uvicorn app.main:app --reload --port 8000

# Start frontend (new terminal)
cd frontend && bun dev

# Stop DB
cd backend && docker compose down

# Generate new migration after model changes
cd backend && alembic revision --autogenerate -m "describe_change"
cd backend && alembic upgrade head
```
