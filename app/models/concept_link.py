# app/models/concept_link.py
from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.orm import relationship
from app.db import Base

class ConceptLink(Base):
    __tablename__ = "concept_links"

    concept_id = Column(String, ForeignKey("concepts.id"), primary_key=True)
    object_type = Column(String, primary_key=True)  # 'player_note', 'drill', 'assessment'
    object_id = Column(String, primary_key=True)

    concept = relationship("Concept", back_populates="links")
