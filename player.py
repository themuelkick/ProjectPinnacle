from datetime import date
from typing import List, Optional
from pydantic import BaseModel

# -----------------------
# Player History Schemas
# -----------------------
class PlayerHistoryBase(BaseModel):
    change_type: str  # e.g., "Position Change", "Mechanical Adjustment"
    notes: Optional[str] = None
    date: Optional[date] = None

class PlayerHistoryCreate(PlayerHistoryBase):
    pass

class PlayerHistoryRead(PlayerHistoryBase):
    id: str

    class Config:
        from_attributes = True

# -----------------------
# Player Schemas
# -----------------------
class PlayerBase(BaseModel):
    first_name: str
    last_name: str
    dob: Optional[date] = None
    position: Optional[str] = None
    team: Optional[str] = None

    # New fields
    height_ft: Optional[int] = None
    height_in: Optional[int] = None
    weight_lbs: Optional[int] = None
    bats: Optional[str] = None  # 'R', 'L', 'S'
    throws: Optional[str] = None  # 'R', 'L'
    notes: Optional[str] = None  # initial notes

class PlayerCreate(PlayerBase):
    history: Optional[List[PlayerHistoryCreate]] = []

class PlayerRead(BaseModel):
    id: str
    first_name: str
    last_name: str
    dob: Optional[date] = None
    position: Optional[str] = None
    team: Optional[str] = None

    # Physical attributes
    height_ft: Optional[int] = None
    height_in: Optional[int] = None
    weight_lbs: Optional[int] = None
    bats: Optional[str] = None
    throws: Optional[str] = None
    notes: Optional[str] = None

    history: List[PlayerHistoryRead] = []

    class Config:
        from_attributes = True


