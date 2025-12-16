# app/models/concept_version.py
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db import Base

class ConceptVersion(Base):
    __tablename__ = "concept_versions"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    concept_id = Column(String, ForeignKey("concepts.id"), nullable=False)
    body = Column(Text, nullable=False)
    updated_by = Column(String)  # FK to user if you want
    updated_at = Column(DateTime, default=datetime.utcnow)
    change_summary = Column(Text)

    concept = relationship("Concept", back_populates="versions")
