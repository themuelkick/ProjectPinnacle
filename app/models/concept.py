import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, Boolean, DateTime
from sqlalchemy.orm import relationship
from app.db import Base
import json

class Concept(Base):
    __tablename__ = "concepts"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    title = Column(String, nullable=False)
    summary = Column(Text)
    body = Column(Text)
    category = Column(String)  # Hitting, Pitching, Mental, S&C
    level = Column(String)     # Youth / HS / Pro
    created_by = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    archived = Column(Boolean, default=False)

    # Optional list of media files stored as JSON
    media_files = Column(Text, default="[]")
    history = Column(Text, default="[]")

    # Relationships
    tags = relationship("Tag", secondary="concept_tags", back_populates="concepts")
    versions = relationship("ConceptVersion", back_populates="concept")
    links = relationship("ConceptLink", back_populates="concept")
    relations_from = relationship(
        "ConceptRelation",
        foreign_keys="ConceptRelation.from_concept_id",
        back_populates="from_concept",
    )
    relations_to = relationship(
        "ConceptRelation",
        foreign_keys="ConceptRelation.to_concept_id",
        back_populates="to_concept",
    )

    # Helper property to work with Python lists
    @property
    def media_files_list(self):
        return json.loads(self.media_files)

    @media_files_list.setter
    def media_files_list(self, value):
        self.media_files = json.dumps(value)