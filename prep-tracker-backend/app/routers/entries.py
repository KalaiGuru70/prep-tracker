from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from datetime import date as date_type

from app.database import get_db
from app import models, schemas
from app.utils.streak import calculate_streaks

router = APIRouter(prefix="/entries", tags=["entries"])


# POST /entries -> add a new log entry
@router.post("/", response_model=schemas.EntryOut)
def create_entry(entry: schemas.EntryCreate, db: Session = Depends(get_db)):
    new_entry = models.Entry(**entry.dict())
    db.add(new_entry)
    db.commit()
    db.refresh(new_entry)
    return new_entry


# GET /entries -> list all entries, most recent first
@router.get("/", response_model=list[schemas.EntryOut])
def list_entries(db: Session = Depends(get_db)):
    return db.query(models.Entry).order_by(desc(models.Entry.date)).all()


# GET /entries/today -> check if today already has an entry
@router.get("/today")
def check_today(db: Session = Depends(get_db)):
    today_str = str(date_type.today())
    entry = db.query(models.Entry).filter(models.Entry.date == today_str).first()
    return {"logged_today": entry is not None, "entry": entry}


# DELETE /entries/{id} -> remove a wrong entry
@router.delete("/{entry_id}")
def delete_entry(entry_id: int, db: Session = Depends(get_db)):
    entry = db.query(models.Entry).filter(models.Entry.id == entry_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    db.delete(entry)
    db.commit()
    return {"message": "Entry deleted"}


# GET /stats -> aggregated stats: total problems, streaks, weekly count
@router.get("/stats/summary")
def get_stats(db: Session = Depends(get_db)):
    all_entries = db.query(models.Entry).all()

    total_problems = sum(e.problems_solved for e in all_entries)
    entry_dates = [e.date for e in all_entries]

    current_streak, longest_streak = calculate_streaks(entry_dates)

    from datetime import date, timedelta
    week_ago = str(date.today() - timedelta(days=7))
    weekly_problems = sum(
        e.problems_solved for e in all_entries if e.date >= week_ago
    )

    return {
        "total_problems": total_problems,
        "current_streak": current_streak,
        "longest_streak": longest_streak,
        "weekly_problems": weekly_problems,
        "total_entries": len(all_entries),
    }