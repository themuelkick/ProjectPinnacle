from typing import List, Optional
from pydantic import BaseModel, ConfigDict
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

    # Legacy support: keep this so existing player/session logic doesn't break
    video_url: Optional[str] = None

    # New Encyclopedia Integration Fields
    category: Optional[str] = None  # Hitting, Pitching, etc.
    media_files: List[str] = []  # Stores multiple YouTube links or upload paths


class DrillCreate(DrillBase):
    """
    Schema for creating a new drill.
    Accepts a list of tag names which the router will resolve to Tag models.
    """
    tag_names: Optional[List[str]] = []


class DrillUpdate(BaseModel):
    """
    Schema for updating an existing drill.
    All fields are optional to allow partial updates.
    """
    title: Optional[str] = None
    description: Optional[str] = None
    video_url: Optional[str] = None
    category: Optional[str] = None
    media_files: Optional[List[str]] = None
    tag_names: Optional[List[str]] = None


class DrillRead(DrillBase):
    """
    Schema for returning Drill data to the frontend.
    Includes the ID and the list of associated Tags.
    """
    id: str
    # This nested list allows the frontend to search and filter by tag name
    tags: List[TagRead] = []

    model_config = ConfigDict(from_attributes=True)