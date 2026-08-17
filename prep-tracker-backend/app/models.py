from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from app.database import Base


class Entry(Base):
    __tablename__ = "entries"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(String, index=True)              # e.g. "2026-08-11"
    category = Column(String, index=True)           # DSA / Aptitude / Mock Test / Study
    topic = Column(String)                           # e.g. "Binary Trees"
    problems_solved = Column(Integer, default=0)
    notes = Column(String, nullable=True)
    problem_name = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)