from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import datetime

from app.db import get_db
from app.models.player import Player
from app.models.drill import Drill
from app.models.player_drill import PlayerDrill

router = APIRouter(prefix="/player-drills", tags=["player-drills"])


# -------------------------------
# Link a drill to a player
# -------------------------------
@router.post("/players/{player_id}/drills/{drill_id}")
def add_drill_to_player(
    player_id: str,
    drill_id: str,
    session_date: str = Query(
        None, description="Optional ISO date if assigning via session"
    ),
    db: Session = Depends(get_db),
):
    player = db.query(Player).get(player_id)
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")

    drill = db.query(Drill).get(drill_id)
    if not drill:
        raise HTTPException(status_code=404, detail="Drill not found")

    # Prevent duplicate assignments
    existing = (
        db.query(PlayerDrill)
        .filter_by(player_id=player_id, drill_id=drill_id)
        .first()
    )
    if existing:
        return {"message": "Drill already assigned"}

    # Parse session date safely
    assigned_date = (
        datetime.fromisoformat(session_date)
        if session_date
        else datetime.utcnow()
    )

    new_pd = PlayerDrill(
        player_id=player_id,
        drill_id=drill_id,
        date_performed=assigned_date,
    )

    db.add(new_pd)
    db.commit()
    db.refresh(new_pd)

    return {
        "message": "Drill added to player successfully",
        "drill_id": drill_id,
        "assigned_date": new_pd.date_performed,
    }


# -------------------------------
# Remove a drill from a player
# -------------------------------
@router.delete("/players/{player_id}/drills/{drill_id}")
def remove_drill_from_player(
    player_id: str,
    drill_id: str,
    db: Session = Depends(get_db),
):
    pd = (
        db.query(PlayerDrill)
        .filter_by(player_id=player_id, drill_id=drill_id)
        .first()
    )

    if not pd:
        raise HTTPException(status_code=404, detail="Drill assignment not found")

    db.delete(pd)
    db.commit()

    return {"message": "Drill removed successfully"}


# -------------------------------
# Get all drills for a specific player
# -------------------------------
@router.get("/players/{player_id}/drills")
def get_player_drills(player_id: str, db: Session = Depends(get_db)):
    player = db.query(Player).get(player_id)
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")

    return [
        {
            "id": pd.drill.id,
            "title": pd.drill.title,
            "assigned_date": pd.date_performed,
        }
        for pd in player.player_drills
    ]


# -------------------------------
# Get all players for a specific drill
# -------------------------------
@router.get("/drills/{drill_id}/players")
def get_drill_players(drill_id: str, db: Session = Depends(get_db)):
    drill = db.query(Drill).get(drill_id)
    if not drill:
        raise HTTPException(status_code=404, detail="Drill not found")

    return [
        {
            "id": pd.player.id,
            "first_name": pd.player.first_name,
            "last_name": pd.player.last_name,
        }
        for pd in drill.player_drills
    ]
