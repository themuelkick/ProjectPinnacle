import os
from sqlalchemy import text
from app.db import engine


def apply_migration():
    print("Checking database connection...")
    try:
        with engine.connect() as conn:
            print("Adding 'notes_updated_at' column to players table...")

            # Using text() for raw SQL execution
            conn.execute(text("ALTER TABLE players ADD COLUMN notes_updated_at DATETIME"))

            # SQLite requires an explicit commit for DDL in some SQLAlchemy versions
            conn.commit()
            print("✅ Success! Column added.")

    except Exception as e:
        error_msg = str(e).lower()
        if "duplicate column name" in error_msg:
            print("ℹ️ The column already exists. No changes needed.")
        elif "no such table" in error_msg:
            print("❌ Error: Could not find the 'players' table. Ensure your models have been created first.")
        else:
            print(f"❌ Error occurred: {e}")


if __name__ == "__main__":
    apply_migration()