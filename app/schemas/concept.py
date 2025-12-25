from pydantic import BaseModel
from typing import Optional

class ConceptBase(BaseModel):
    title: str
    summary: Optional[str] = None
    body: Optional[str] = None
    category: Optional[str] = None
    level: Optional[str] = None
    created_by: Optional[str] = None

class ConceptCreate(ConceptBase):
    pass

class ConceptRead(ConceptBase):
    id: str
    archived: bool

    class Config:
        orm_mode = True
