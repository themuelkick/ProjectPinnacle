from pydantic import BaseModel
from typing import Optional, List

class ConceptBase(BaseModel):
    title: str
    summary: Optional[str] = None
    body: Optional[str] = None
    category: Optional[str] = None
    level: Optional[str] = None
    created_by: Optional[str] = None
    tags: List[str] = []  # <--- ADD THIS LINE
    media_files: List[str] = []  # Recommended to add this too based on your JSX
    history: List[dict] = []

class ConceptCreate(ConceptBase):
    pass

class ConceptRead(ConceptBase):
    id: str
    archived: bool

    class Config:
        orm_mode = True
