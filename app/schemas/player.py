
from datetime import date, datetime # Added datetime for precise assignment timestamps
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
# -----------------------
# Drill Schemas
# -----------------------
class DrillRead(BaseModel):
    id: str
    title: str
    # ✅ Add these fields to match the router's dictionary
    assigned_date: Optional[datetime] = None
    session_origin: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True

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

    # Physical attributes
    height_ft: Optional[int] = None
    height_in: Optional[int] = None
    weight_lbs: Optional[int] = None
    bats: Optional[str] = None  # 'R', 'L', 'S'
    throws: Optional[str] = None  # 'R', 'L'
    notes: Optional[str] = None


class PlayerCreate(PlayerBase):
    history: Optional[List[PlayerHistoryCreate]] = []

class PlayerUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    position: Optional[str] = None
    team: Optional[str] = None
    height_ft: Optional[int] = None
    height_in: Optional[int] = None
    weight_lbs: Optional[int] = None
    bats: Optional[str] = None
    throws: Optional[str] = None
    notes: Optional[str] = None
    notes_updated_at: Optional[datetime] = None

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
    notes_updated_at: Optional[datetime] = None
    history: List[PlayerHistoryRead] = []
    drills: List[DrillRead] = []

    class Config:
        from_attributes = True
