from pydantic import BaseModel
from datetime import datetime
from typing import Optional


# Shape of data the client sends when creating a new entry
class EntryCreate(BaseModel):
    date: str
    category: str
    topic: str
    problems_solved: int = 0
    notes: Optional[str] = None
    problem_name: Optional[str] = None


# Shape of data we send back to the client (includes id, created_at)
class EntryOut(BaseModel):
    id: int
    date: str
    category: str
    topic: str
    problems_solved: int
    notes: Optional[str] = None
    problem_name: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True   # allows converting SQLAlchemy model -> this schema