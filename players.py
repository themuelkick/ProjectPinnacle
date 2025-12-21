from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db import get_db
from app.models.player import Player
from app.models.player_history import PlayerHistory
from app.models.drill import Drill
from app.models.player_drill import PlayerDrill
from app.schemas.player import PlayerCreate, PlayerRead

router = APIRouter(prefix="/players", tags=["players"])


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

    # Create history entries if provided
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

    return db_player


# -------------------------------
# List Players
# -------------------------------
@router.get("/", response_model=list[PlayerRead])
def list_players(db: Session = Depends(get_db)):
    return db.query(Player).all()


# -------------------------------
# Get Single Player (WITH DRILLS)
# -------------------------------
@router.get("/{player_id}", response_model=PlayerRead)
def get_player(player_id: str, db: Session = Depends(get_db)):
    player = db.query(Player).get(player_id)
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")

    # Fetch player drills with assigned date
    player_drills = (
        db.query(PlayerDrill)
        .filter(PlayerDrill.player_id == player.id)
        .all()
    )

    drills_with_info = []
    for pd in player_drills:
        drill = db.query(Drill).get(pd.drill_id)
        if drill:
            drills_with_info.append(
                {
                    "id": drill.id,
                    "title": drill.title,
                    "assigned_date": pd.date_performed,
                }
            )

    # Attach drills dynamically (used by frontend)
    setattr(player, "drills", drills_with_info)

    return player
