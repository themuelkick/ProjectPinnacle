from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import datetime

from app.db import get_db
from app.models.player import Player
from app.models.drill import Drill
from app.models.player_drill import PlayerDrill

router = APIRouter(prefix="/player-drills", tags=["player‑drills"])


# -------------------------------
# Link a drill to a player
# -------------------------------
@router.post("/players/{player_id}/drills/{drill_id}")
def add_drill_to_player(
    player_id: str,
    drill_id: str,
    session_date: str = Query(None, description="Optional ISO date if assigning via session"),
    db: Session = Depends(get_db),
):
    player = db.query(Player).get(player_id)
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")

    drill = db.query(Drill).get(drill_id)
    if not drill:
        raise HTTPException(status_code=404, detail="Drill not found")

    # Check if already assigned
    existing = (
        db.query(PlayerDrill)
        .filter_by(player_id=player_id, drill_id=drill_id)
        .first()
    )
    if existing:
        return {"message": "Drill already assigned"}

    # Assign drill with optional date_performed
    new_pd = PlayerDrill(
        player_id=player_id,
        drill_id=drill_id,
        date_performed=datetime.fromisoformat(session_date)
        if session_date
        else datetime.utcnow(),
    )
    db.add(new_pd)
    db.commit()
    db.refresh(new_pd)

    return {"message": "Drill added to player successfully."}


# -------------------------------
# Get all drills for a specific player
# -------------------------------
@router.get("/players/{player_id}/drills")
def get_player_drills(player_id: str, db: Session = Depends(get_db)):
    player = db.query(Player).get(player_id)
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    return player.player_drills  # now returns PlayerDrill objects with date_performed


# -------------------------------
# Get all players for a specific drill
# -------------------------------
@router.get("/drills/{drill_id}/players")
def get_drill_players(drill_id: str, db: Session = Depends(get_db)):
    drill = db.query(Drill).get(drill_id)
    if not drill:
        raise HTTPException(status_code=404, detail="Drill not found")
    return [pd.player for pd in drill.player_drills]
