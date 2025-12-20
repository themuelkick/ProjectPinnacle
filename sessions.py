from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from collections import defaultdict

from app.models.session import Session, SessionMetric, SessionMedia
from app.db import SessionLocal

router = APIRouter(prefix="/sessions", tags=["sessions"])


# -------------------------------
# Dependency
# -------------------------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# -------------------------------
# Helpers
# -------------------------------
def parse_date(date_str):
    if not date_str:
        return datetime.utcnow()
    try:
        return datetime.strptime(date_str, "%Y-%m-%d")
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail="Invalid date format. Use YYYY-MM-DD."
        )


def flatten_metrics(metrics_payload, session_id, db: Session):
    """
    Takes grouped metrics from the frontend and stores them FLAT.
    Expected shape:
    [
      {
        source: "rapsodo",
        pitch_type: "Fastball",
        metrics: [{ metric_name, metric_value, unit }]
      }
    ]
    """
    for group in metrics_payload:
        source = group.get("source")
        pitch_type = group.get("pitch_type")

        for metric in group.get("metrics", []):
            db.add(SessionMetric(
                session_id=session_id,
                source=source,
                pitch_type=pitch_type,
                metric_name=metric["metric_name"],
                metric_value=str(metric["metric_value"]),
                unit=metric.get("unit")
            ))


def serialize_session(session: Session):
    """
    Return session with GROUPED metrics by (source + pitch_type)
    """
    grouped = defaultdict(list)

    for m in session.metrics:
        key = (m.source, m.pitch_type)
        grouped[key].append({
            "metric_name": m.metric_name,
            "metric_value": m.metric_value,
            "unit": m.unit
        })

    return {
        "id": session.id,
        "player_id": session.player_id,
        "date": session.date,
        "session_type": session.session_type,
        "notes": session.notes,
        "metrics": [
            {
                "source": source,
                "pitch_type": pitch_type,
                "metrics": metrics
            }
            for (source, pitch_type), metrics in grouped.items()
        ],
        "media": session.media
    }


# -------------------------------
# Create Session
# -------------------------------
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

    # Metrics
    flatten_metrics(session_data.get("metrics", []), new_session.id, db)

    # Media
    for media in session_data.get("media", []):
        db.add(SessionMedia(
            session_id=new_session.id,
            file_url=media["file_url"],
            media_type=media.get("media_type")
        ))

    db.commit()
    db.refresh(new_session)

    return serialize_session(new_session)


# -------------------------------
# Get Sessions for Player
# -------------------------------
@router.get("/player/{player_id}")
def get_sessions_for_player(player_id: str, db: Session = Depends(get_db)):
    sessions = (
        db.query(Session)
        .filter(Session.player_id == player_id)
        .order_by(Session.date.desc())
        .all()
    )

    return [serialize_session(s) for s in sessions]


# -------------------------------
# Get Single Session
# -------------------------------
@router.get("/{session_id}")
def get_session(session_id: int, db: Session = Depends(get_db)):
    session = db.query(Session).filter(Session.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    return serialize_session(session)


# -------------------------------
# Update Session
# -------------------------------
@router.put("/{session_id}")
def update_session(session_id: int, session_data: dict, db: Session = Depends(get_db)):
    session = db.query(Session).filter(Session.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    if "date" in session_data:
        session.date = parse_date(session_data["date"])

    session.session_type = session_data.get(
        "session_type", session.session_type
    )
    session.notes = session_data.get(
        "notes", session.notes
    )

    # ❌ remove old metrics
    db.query(SessionMetric).filter(
        SessionMetric.session_id == session_id
    ).delete()

    # ✅ insert new metrics
    flatten_metrics(session_data.get("metrics", []), session_id, db)

    db.commit()
    db.refresh(session)

    return serialize_session(session)


# -------------------------------
# Delete Session
# -------------------------------
@router.delete("/{session_id}")
def delete_session(session_id: int, db: Session = Depends(get_db)):
    session = db.query(Session).filter(Session.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    db.delete(session)
    db.commit()
    return {"detail": "Session deleted"}
