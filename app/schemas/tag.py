from pydantic import BaseModel

class TagBase(BaseModel):
    name: str

class TagCreate(TagBase):
    """Used for creating a new tag"""
    pass

class TagRead(TagBase):
    id: str  # UUID string

    class Config:
        from_attributes = True
