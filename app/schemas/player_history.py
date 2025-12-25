from pydantic import BaseModel
from typing import Optional
from datetime import date


class PlayerHistoryBase(BaseModel):
    change_type: str
    notes: Optional[str] = None
    date: Optional[date] = None


class PlayerHistoryCreate(PlayerHistoryBase):
    pass


class PlayerHistoryRead(PlayerHistoryBase):
    id: str

    class Config:
        orm_mode = True

