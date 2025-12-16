# app/models/concept_tags.py
from sqlalchemy import Table, Column, String, ForeignKey
from app.db import Base

concept_tags = Table(
    "concept_tags",
    Base.metadata,
    Column("concept_id", String, ForeignKey("concepts.id"), primary_key=True),
    Column("tag_id", String, ForeignKey("tags.id"), primary_key=True)
)
