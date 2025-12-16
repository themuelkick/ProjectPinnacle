from sqlalchemy import Table, Column, ForeignKey
from app.db import Base

drill_tags = Table(
    "drill_tags",
    Base.metadata,
    Column("drill_id", ForeignKey("drills.id"), primary_key=True),
    Column("tag_id", ForeignKey("tags.id"), primary_key=True),
)
