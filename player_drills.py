from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db import get_db
from app.models.player import Player
from app.models.drill import Drill

router = APIRouter(prefix="/player-drills", tags=["player‑drills"])

# Link a drill to a player
@router.post("/players/{player_id}/drills/{drill_id}")
def add_drill_to_player(
    player_id: str,
    drill_id: str,
    db: Session = Depends(get_db),
):
    player = db.query(Player).get(player_id)
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")

    drill = db.query(Drill).get(drill_id)
    if not drill:
        raise HTTPException(status_code=404, detail="Drill not found")

    # Associate the drill with the player
    player.drills.append(drill)
    db.commit()
    db.refresh(player)

    return {"message": "Drill added to player successfully."}


# Get all drills for a specific player
@router.get("/players/{player_id}/drills")
def get_player_drills(player_id: str, db: Session = Depends(get_db)):
    player = db.query(Player).get(player_id)
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    return player.drills


# Get all players for a specific drill
@router.get("/drills/{drill_id}/players")
def get_drill_players(drill_id: str, db: Session = Depends(get_db)):
    drill = db.query(Drill).get(drill_id)
    if not drill:
        raise HTTPException(status_code=404, detail="Drill not found")
    return drill.players
