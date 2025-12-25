import uuid
from sqlalchemy import Column, String
from sqlalchemy.orm import relationship
from app.db import Base
from app.models.drill_tags import drill_tags
from app.models.concept_tag import concept_tags  # 👈 ADD THIS IMPORT


class Tag(Base):
    __tablename__ = "tags"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, unique=True, nullable=False)

    drills = relationship(
        "Drill",
        secondary=drill_tags,
        back_populates="tags"
    )

    concepts = relationship(
        "Concept",
        secondary=concept_tags,
        back_populates="tags"
    )
