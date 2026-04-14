"""
Run once to create the admin user and seed sample articles.
Usage: python seed.py
"""
from app.database.connection import SessionLocal, engine
from app.database.models import Base, User, Article
from app.core.auth import hash_password

Base.metadata.create_all(bind=engine)

db = SessionLocal()

# ── Admin user ────────────────────────────────────────────────────────────────
existing = db.query(User).filter(User.username == "admin").first()
if not existing:
    admin = User(username="admin", hashed_password=hash_password("admin1234"))
    db.add(admin)
    db.commit()
    print("Created admin user  ->  username: admin  |  password: admin1234")
else:
    print("Admin user already exists, skipping.")

# ── Sample articles ───────────────────────────────────────────────────────────
if db.query(Article).count() == 0:
    articles = [
        Article(
            title="How AI is Changing Small Businesses",
            summary="An overview of how AI tools help small businesses improve productivity.",
            content=(
                "Artificial intelligence is increasingly being adopted by small businesses "
                "to automate repetitive tasks, improve customer support, and analyze business performance."
            ),
            status="published",
            view_count=12,
            like_count=4,
        ),
        Article(
            title="Getting Started with Next.js",
            summary="A beginner-friendly introduction to building web apps with Next.js.",
            content=(
                "Next.js is a React framework that helps developers build modern web applications "
                "with routing, rendering, and API integration."
            ),
            status="published",
            view_count=30,
            like_count=10,
        ),
        Article(
            title="Python for Backend Development",
            summary="Why Python remains a popular choice for backend systems.",
            content=(
                "Python is widely used for backend development because of its readability, "
                "large ecosystem, and fast development speed."
            ),
            status="published",
            view_count=18,
            like_count=6,
        ),
        Article(
            title="Draft: New Product Launch Plan",
            summary="Internal draft article for an upcoming product release.",
            content=(
                "This draft contains early planning details and is not ready for public display yet."
            ),
            status="draft",
            view_count=0,
            like_count=0,
        ),
        Article(
            title="Draft: Team Meeting Summary",
            summary="A draft summary of internal team discussions.",
            content=(
                "This article contains internal notes and pending action items "
                "that still need review before publication."
            ),
            status="draft",
            view_count=0,
            like_count=0,
        ),
    ]
    db.add_all(articles)
    db.commit()
    print(f"Seeded {len(articles)} sample articles.")
else:
    print("Articles already exist, skipping seed.")

db.close()
print("Done.")
