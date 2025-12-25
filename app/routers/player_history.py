from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import date

from app.db import get_db
from app.models.player_history import PlayerHistory
from app.schemas.player_history import PlayerHistoryCreate, PlayerHistoryRead


router = APIRouter(
    prefix="/players/{player_id}/history",
    tags=["player_history"]
)



