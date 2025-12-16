from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.db import Base, engine
from app.routers import concepts, players, drills, player_drills, player_history

# Import models so SQLAlchemy knows about them
import app.models.tag
import app.models.drill
import app.models.concept
import app.models.concept_relation
import app.models.concept_version
import app.models.concept_link
import app.models.concept_tag

# Create FastAPI app
app = FastAPI(title="Player Development API")

# Mount static files for uploads
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# CORS
origins = ["http://localhost:5173", "http://127.0.0.1:5173"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(players.router)
app.include_router(drills.router)
app.include_router(player_drills.router)
app.include_router(player_history.router)
app.include_router(concepts.router)

# Create tables
Base.metadata.create_all(bind=engine)

@app.get("/")
def root():
    return {"message": "Hello, FastAPI!"}
