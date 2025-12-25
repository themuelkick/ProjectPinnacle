# app/models/player.py
from sqlalchemy import Column, String, Integer, Enum, Text, DateTime  # added DateTime
from sqlalchemy.orm import relationship
from app.db import Base
import uuid


class Player(Base):
    __tablename__ = "players"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    dob = Column(String, nullable=True)
    position = Column(String, nullable=True)
    team = Column(String, nullable=True)

    height_ft = Column(Integer, nullable=True)
    height_in = Column(Integer, nullable=True)
    weight_lbs = Column(Integer, nullable=True)
    bats = Column(Enum("R", "L", "S", name="bats_enum"), nullable=True)
    throws = Column(Enum("R", "L", name="throws_enum"), nullable=True)
    notes = Column(Text, nullable=True)

    # NEW FIELD: Tracks when the scouting notes were last changed
    notes_updated_at = Column(DateTime, nullable=True)

    player_drills = relationship("PlayerDrill", back_populates="player")
    history = relationship(
        "PlayerHistory",
        back_populates="player",
        cascade="all, delete-orphan",
        order_by="PlayerHistory.date"
    )