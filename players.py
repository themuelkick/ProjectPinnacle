from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import get_db
from app.models.player import Player
from app.models.player_history import PlayerHistory
from app.schemas.player import PlayerCreate, PlayerRead

router = APIRouter(prefix="/players", tags=["players"])

@router.post("/", response_model=PlayerRead)
def create_player(player: PlayerCreate, db: Session = Depends(get_db)):
    # Create Player object
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
        notes=player.notes
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
            date=h.date
        )
        db.add(db_history)
    db.commit()

    db.refresh(db_player)
    return db_player

@router.get("/", response_model=list[PlayerRead])
def list_players(db: Session = Depends(get_db)):
    return db.query(Player).all()

@router.get("/{player_id}", response_model=PlayerRead)
def get_player(player_id: str, db: Session = Depends(get_db)):
    player = db.query(Player).get(player_id)
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    return player
