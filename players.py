from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List

from app.db import get_db
from app.models.player import Player
from app.models.player_history import PlayerHistory
from app.models.drill import Drill
from app.models.player_drill import PlayerDrill
# Import Session model to look up metadata
from app.models.session import Session as BaseballSession
from app.schemas.player import PlayerCreate, PlayerRead, PlayerUpdate

router = APIRouter(prefix="/players", tags=["players"])

# -------------------------------
# Helper: Attach Drills to Player
# -------------------------------
def _attach_drills(player: Player, db: Session):
    """
    Helper function to fetch drill associations and session context,
    attaching them to the player object for the Pydantic response.
    """
    player_drills = (
        db.query(PlayerDrill)
        .filter(PlayerDrill.player_id == player.id)
        .all()
    )

    drills_with_info = []
    for pd in player_drills:
        drill = db.query(Drill).get(pd.drill_id)
        if drill:
            session_origin = None
            if hasattr(pd, "session_id") and pd.session_id:
                sess = db.query(BaseballSession).get(pd.session_id)
                if sess:
                    session_origin = {
                        "type": sess.session_type,
                        "date": sess.date.isoformat() if sess.date else None
                    }

            drills_with_info.append(
                {
                    "id": drill.id,
                    "title": drill.title,
                    "assigned_date": pd.date_performed,
                    "session_origin": session_origin
                }
            )

    setattr(player, "drills", drills_with_info)
    return player


# -------------------------------
# Create Player
# -------------------------------
@router.post("/", response_model=PlayerRead)
def create_player(player: PlayerCreate, db: Session = Depends(get_db)):
    db_player = Player(
        first_name=player.first_name,
        last_name=player.last_name,
        dob=player.dob,
        position=player.position,
        team=player.team,
        height_ft=player.height_ft,
        height_in=player.height_in,
        weight_lbs=player.weight_lbs,
        bats=player.bats,
        throws=player.throws,
        notes=player.notes,
    )

    db.add(db_player)
    db.commit()
    db.refresh(db_player)

    for h in player.history or []:
        db_history = PlayerHistory(
            player_id=db_player.id,
            change_type=h.change_type,
            notes=h.notes,
            date=h.date,
        )
        db.add(db_history)

    db.commit()
    db.refresh(db_player)
    return _attach_drills(db_player, db)


# -------------------------------
# List Players
# -------------------------------
@router.get("/", response_model=List[PlayerRead])
def list_players(db: Session = Depends(get_db)):
    players = db.query(Player).all()
    for p in players:
        _attach_drills(p, db)
    return players


# -------------------------------
# Get Single Player
# -------------------------------
@router.get("/{player_id}", response_model=PlayerRead)
def get_player(player_id: str, db: Session = Depends(get_db)):
    player = db.query(Player).get(player_id)
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")

    return _attach_drills(player, db)


# -------------------------------
# Update Player (Edit Profile & Notes)
# -------------------------------
@router.put("/{player_id}", response_model=PlayerRead)
def update_player(player_id: str, player_data: PlayerUpdate, db: Session = Depends(get_db)):
    db_player = db.query(Player).filter(Player.id == player_id).first()
    if not db_player:
        raise HTTPException(status_code=404, detail="Player not found")

    # Convert Pydantic model to dict, excluding fields not sent by frontend
    update_data = player_data.dict(exclude_unset=True)

    for key, value in update_data.items():
        setattr(db_player, key, value)

    db.commit()
    db.refresh(db_player)

    # Return the updated player with drills attached for the UI
    return _attach_drills(db_player, db)