# app/models/concept_relation.py
from sqlalchemy import Column, String, Enum, ForeignKey
from sqlalchemy.orm import relationship
from app.db import Base

class ConceptRelation(Base):
    __tablename__ = "concept_relations"

    from_concept_id = Column(String, ForeignKey("concepts.id"), primary_key=True)
    to_concept_id = Column(String, ForeignKey("concepts.id"), primary_key=True)
    relation_type = Column(
        Enum("related", "prerequisite", "counterpoint", "builds_on", name="relation_types"),
        nullable=False
    )

    from_concept = relationship("Concept", foreign_keys=[from_concept_id], back_populates="relations_from")
    to_concept = relationship("Concept", foreign_keys=[to_concept_id], back_populates="relations_to")
