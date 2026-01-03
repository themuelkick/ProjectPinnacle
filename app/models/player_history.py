from sqlalchemy import Column, String, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.db import Base
import uuid

class PlayerHistory(Base):
    __tablename__ = "player_history"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    player_id = Column(String, ForeignKey("players.id"), nullable=False)

    date = Column(String, nullable=False)
    change_type = Column(String, nullable=False)
    notes = Column(Text, nullable=True)   # ✅ FIXED

    player = relationship("Player", back_populates="history")
