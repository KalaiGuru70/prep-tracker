from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine, Base
from app.routers import entries

# Create all database tables (if they don't already exist)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Prep Tracker API")

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Connect the entries router — this adds all /entries endpoints
app.include_router(entries.router)


@app.get("/")
def read_root():
    return {"status": "ok", "message": "Prep Tracker API is running"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}