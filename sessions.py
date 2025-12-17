from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional, Union
from datetime import datetime
from app.models.session import Session, SessionMetric, SessionMedia
from app.db import SessionLocal

router = APIRouter(prefix="/sessions", tags=["sessions"])

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# -------------------------------
# CRUD Endpoints
# -------------------------------

def parse_date(date_str: Optional[str]) -> datetime:
    """
    Convert a string in 'YYYY-MM-DD' format to a datetime.date object.
    If None, return current UTC datetime.
    """
    if not date_str:
        return datetime.utcnow()
    try:
        return datetime.strptime(date_str, "%Y-%m-%d")
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD.")


@router.post("/")
def create_session(session_data: dict, db: Session = Depends(get_db)):
    new_session = Session(
        player_id=session_data["player_id"],
        date=parse_date(session_data.get("date")),
        session_type=session_data["session_type"],
        notes=session_data.get("notes")
    )
    db.add(new_session)
    db.commit()
    db.refresh(new_session)

    # Add metrics if provided
    for metric in session_data.get("metrics", []):
        m = SessionMetric(
            session_id=new_session.id,
            metric_name=metric["metric_name"],
            metric_value=metric["metric_value"],
            unit=metric.get("unit")
        )
        db.add(m)

    # Add media if provided
    for media in session_data.get("media", []):
        md = SessionMedia(
            session_id=new_session.id,
            file_url=media["file_url"],
            media_type=media.get("media_type")
        )
        db.add(md)

    db.commit()
    db.refresh(new_session)
    return new_session


@router.get("/player/{player_id}")
def get_sessions_for_player(player_id: str, db: Session = Depends(get_db)):
    sessions = (
        db.query(Session)
        .filter(Session.player_id == player_id)
        .order_by(Session.date.desc())
        .all()
    )
    return sessions



@router.get("/{session_id}")
def get_session(session_id: int, db: Session = Depends(get_db)):
    session = db.query(Session).filter(Session.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session


@router.put("/{session_id}")
def update_session(session_id: int, session_data: dict, db: Session = Depends(get_db)):
    session = db.query(Session).filter(Session.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    if "date" in session_data:
        session.date = parse_date(session_data["date"])
    session.session_type = session_data.get("session_type", session.session_type)
    session.notes = session_data.get("notes", session.notes)
    db.commit()
    db.refresh(session)
    return session


@router.delete("/{session_id}")
def delete_session(session_id: int, db: Session = Depends(get_db)):
    session = db.query(Session).filter(Session.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    db.delete(session)
    db.commit()
    return {"detail": "Session deleted"}
