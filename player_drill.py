from sqlalchemy import Column, ForeignKey, String, DateTime, Integer  # Added Integer
from sqlalchemy.orm import relationship
from app.db import Base


class PlayerDrill(Base):
    __tablename__ = "player_drills"

    player_id = Column(ForeignKey("players.id"), primary_key=True)
    drill_id = Column(ForeignKey("drills.id"), primary_key=True)

    notes = Column(String, nullable=True)
    date_performed = Column(DateTime, nullable=True)

    # --- ADD THIS COLUMN ---
    session_id = Column(Integer, ForeignKey("sessions.id"), nullable=True)

    player = relationship("Player", back_populates="player_drills")
    drill = relationship("Drill", back_populates="player_drills")

    # --- ADD THIS RELATIONSHIP ---
    session = relationship("app.models.session.Session")