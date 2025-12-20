from app.db import Base
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship

class Session(Base):
    __tablename__ = "sessions"

    id = Column(Integer, primary_key=True, index=True)
    player_id = Column(String, ForeignKey("players.id"), nullable=False)
    date = Column(DateTime, nullable=False)
    session_type = Column(String, nullable=False)
    notes = Column(String, nullable=True)

    metrics = relationship(
        "SessionMetric",
        back_populates="session",
        cascade="all, delete-orphan"
    )
    media = relationship(
        "SessionMedia",
        back_populates="session",
        cascade="all, delete-orphan"
    )


class SessionMetric(Base):
    __tablename__ = "session_metrics"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("sessions.id"), nullable=False)

    source = Column(String, nullable=False)        # rapsodo, trackman, etc
    pitch_type = Column(String, nullable=True)     # Fastball, Cutter, etc

    metric_name = Column(String, nullable=False)
    metric_value = Column(String, nullable=False)
    unit = Column(String, nullable=True)

    session = relationship("Session", back_populates="metrics")





class SessionMedia(Base):
    __tablename__ = "session_media"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("sessions.id"), nullable=False)
    file_url = Column(String, nullable=False)
    media_type = Column(String, nullable=True)  # video, photo, screenshot, etc.

    session = relationship("Session", back_populates="media")
