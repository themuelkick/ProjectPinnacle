import uuid
import json
from sqlalchemy import Column, String, Text
from sqlalchemy.orm import relationship
from app.db import Base

# Imports for relationships
from app.models.player_drill import PlayerDrill
from app.models.tag import Tag

class Drill(Base):
    __tablename__ = "drills"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)

    # --- New Encyclopedia Integration Fields ---
    category = Column(String, nullable=True)  # e.g., Hitting, Pitching, S&C
    media_files = Column(Text, default="[]")  # Stores list of URLs/Paths as JSON string
    history = Column(Text, default="[]")      # Stores the evolution timeline as JSON string

    # Keep video_url for backward compatibility with your existing session logic
    video_url = Column(String, nullable=True)

    # Relationships
    player_drills = relationship(
        "PlayerDrill",
        back_populates="drill",
        cascade="all, delete-orphan"
    )

    tags = relationship(
        "Tag",
        secondary="drill_tags",
        back_populates="drills"
    )

    # --- Helper Properties for JSON Fields ---

    @property
    def media_files_list(self):
        """Returns the media_files as a Python list."""
        try:
            return json.loads(self.media_files) if self.media_files else []
        except (json.JSONDecodeError, TypeError):
            return []

    @media_files_list.setter
    def media_files_list(self, value):
        """Allows direct assignment: drill.media_files_list = ['url1', 'url2']"""
        self.media_files = json.dumps(value if value is not None else [])

    @property
    def history_list(self):
        """Returns the evolution history as a Python list of dicts."""
        try:
            return json.loads(self.history) if self.history else []
        except (json.JSONDecodeError, TypeError):
            return []

    @history_list.setter
    def history_list(self, value):
        """Allows direct assignment: drill.history_list = [{'date': '...', 'addition': '...'}]"""
        self.history = json.dumps(value if value is not None else [])

    @property
    def all_media(self):
        """
        Combines the legacy video_url and the new media_files list.
        Read-only helper for the Encyclopedia router.
        """
        files = self.media_files_list
        # If there's a legacy URL not present in the new list, include it
        if self.video_url and self.video_url not in files:
            files.append(self.video_url)
        return files