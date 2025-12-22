from typing import List, Optional
from pydantic import BaseModel
from app.schemas.tag import TagRead

# ---------------------------------------------------------
# Drill Schemas
# ---------------------------------------------------------

class DrillBase(BaseModel):
    """
    Shared attributes for Drills across Create and Read operations.
    """
    title: str
    description: Optional[str] = None
    video_url: Optional[str] = None  # Supports both uploaded paths and external links

class DrillCreate(DrillBase):
    """
    Schema for creating a new drill.
    Accepts a list of tag names which the router will resolve to Tag models.
    """
    tag_names: Optional[List[str]] = []

class DrillRead(DrillBase):
    """
    Schema for returning Drill data to the frontend.
    Includes the ID and the list of associated Tags.
    """
    id: str
    # This nested list allows the frontend to search and filter by tag name
    tags: List[TagRead] = []

    class Config:
        # Allows Pydantic to read data from SQLAlchemy models automatically
        from_attributes = True