from typing import List, Optional
from pydantic import BaseModel
from app.schemas.tag import TagRead

class DrillBase(BaseModel):
    title: str
    description: Optional[str] = None
    video_url: Optional[str] = None  # <-- new

class DrillCreate(DrillBase):
    tag_names: Optional[List[str]] = []

class DrillRead(DrillBase):
    id: str
    tags: List[TagRead] = []

    class Config:
        from_attributes = True
