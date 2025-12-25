# migrate_drills.py
from sqlalchemy import text
from app.db import engine


def run_migration():
    print("Connecting to database...")
    try:
        with engine.connect() as conn:
            print("Adding 'category' column to drills table...")
            try:
                conn.execute(text("ALTER TABLE drills ADD COLUMN category TEXT"))
                print("✅ Category column added.")
            except Exception as e:
                if "duplicate column name" in str(e).lower():
                    print("ℹ️ Category column already exists.")
                else:
                    raise e

            print("Adding 'media_files' column to drills table...")
            try:
                conn.execute(text("ALTER TABLE drills ADD COLUMN media_files TEXT DEFAULT '[]'"))
                print("✅ Media_files column added.")
            except Exception as e:
                if "duplicate column name" in str(e).lower():
                    print("ℹ️ Media_files column already exists.")
                else:
                    raise e

            conn.commit()
            print("\n🎉 Migration complete! Your Drills now support Encyclopedia features.")

    except Exception as e:
        print(f"❌ Error: {e}")


if __name__ == "__main__":
    run_migration()