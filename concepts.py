import uuid
import os
import shutil
import json
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel, ConfigDict

from app.db import get_db
from app.models.concept import Concept
from app.models.drill import Drill  # Added Drill model
from app.models.tag import Tag

router = APIRouter(prefix="/concepts", tags=["Encyclopedia"])

# -----------------------------
# Upload config
# -----------------------------
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)
BACKEND_URL = "http://localhost:8000"


@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    file_ext = os.path.splitext(file.filename)[1]
    filename = f"{uuid.uuid4()}{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return {"filename": filename, "url": f"{BACKEND_URL}/{UPLOAD_DIR}/{filename}"}


# -----------------------------
# Pydantic schemas
# -----------------------------
class ConceptCreate(BaseModel):
    title: str
    summary: str = ""
    body: str = ""
    category: str = ""
    tags: List[str] = []
    media_files: List[str] = []


class ConceptUpdate(BaseModel):
    title: Optional[str] = None
    summary: Optional[str] = None
    body: Optional[str] = None
    category: Optional[str] = None
    tags: Optional[List[str]] = None
    media_files: Optional[List[str]] = None


class ConceptOut(BaseModel):
    id: str
    title: str
    summary: str
    body: str
    category: str
    tags: List[str]
    media_files: List[str] = []
    type: str = "concept"  # Tells frontend if it's a 'concept' or 'drill'

    model_config = ConfigDict(from_attributes=True)


# -----------------------------
# Helper to generate full URLs
# -----------------------------
def to_media_urls(file_list: List[str]) -> List[str]:
    return [f if (f.startswith("http") or f.startswith("https"))
            else f"{BACKEND_URL}/{UPLOAD_DIR}/{os.path.basename(f)}"
            for f in file_list]


# -----------------------------
# Routes
# -----------------------------

@router.get("/", response_model=List[ConceptOut])
def list_encyclopedia(db: Session = Depends(get_db)):
    """Fetches both Concepts and Drills as Encyclopedia entries."""
    results = []

    # 1. Fetch Concepts
    concepts = db.query(Concept).all()
    for c in concepts:
        media_list = json.loads(c.media_files) if c.media_files else []
        results.append(ConceptOut(
            id=c.id,
            title=c.title,
            summary=c.summary or "",
            body=c.body or "",
            category=c.category or "General",
            tags=[t.name for t in c.tags],
            media_files=to_media_urls(media_list),
            type="concept"
        ))

    # 2. Fetch Drills
    drills = db.query(Drill).all()
    for d in drills:
        results.append(ConceptOut(
            id=d.id,
            title=d.title,
            summary="Drill Exercise",
            body=d.description or "",
            category=d.category or "Drills",
            tags=[t.name for t in d.tags],
            media_files=to_media_urls(d.all_media),
            type="drill"
        ))

    return results


@router.get("/categories")
def list_unified_categories(db: Session = Depends(get_db)):
    """Combines categories from both Concepts and Drills."""
    concept_cats = db.query(Concept.category).distinct().all()
    drill_cats = db.query(Drill.category).distinct().all()

    combined = set([c[0] for c in concept_cats if c[0]])
    combined.update([d[0] for d in drill_cats if d[0]])
    return sorted(list(combined))


@router.get("/{concept_id}", response_model=ConceptOut)
def get_entry(concept_id: str, db: Session = Depends(get_db)):
    """Get a single entry from either table by ID."""
    # Check Concepts
    concept = db.query(Concept).filter(Concept.id == concept_id).first()
    if concept:
        media_list = json.loads(concept.media_files) if concept.media_files else []
        return ConceptOut(
            id=concept.id,
            title=concept.title,
            summary=concept.summary or "",
            body=concept.body or "",
            category=concept.category or "General",
            tags=[t.name for t in concept.tags],
            media_files=to_media_urls(media_list),
            type="concept"
        )

    # Check Drills
    drill = db.query(Drill).filter(Drill.id == concept_id).first()
    if drill:
        return ConceptOut(
            id=drill.id,
            title=drill.title,
            summary="Drill",
            body=drill.description or "",
            category=drill.category or "Drills",
            tags=[t.name for t in drill.tags],
            media_files=to_media_urls(drill.all_media),
            type="drill"
        )

    raise HTTPException(status_code=404, detail="Entry not found")


@router.post("/", response_model=ConceptOut)
def create_concept(concept_in: ConceptCreate, db: Session = Depends(get_db)):
    # ... logic remains for creating strictly Concepts ...
    try:
        media_json = json.dumps(concept_in.media_files) if concept_in.media_files else None
        new_concept = Concept(
            id=str(uuid.uuid4()),
            title=concept_in.title,
            summary=concept_in.summary,
            body=concept_in.body,
            category=concept_in.category,
            media_files=media_json,
        )
        for tag_name in concept_in.tags:
            tag = db.query(Tag).filter(Tag.name == tag_name).first()
            if not tag:
                tag = Tag(name=tag_name)
                db.add(tag)
                db.commit()
                db.refresh(tag)
            new_concept.tags.append(tag)
        db.add(new_concept)
        db.commit()
        db.refresh(new_concept)
        return ConceptOut(
            id=new_concept.id,
            title=new_concept.title,
            summary=new_concept.summary,
            body=new_concept.body,
            category=new_concept.category,
            tags=[t.name for t in new_concept.tags],
            media_files=to_media_urls(concept_in.media_files or []),
            type="concept"
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/search", response_model=List[ConceptOut])
def search_encyclopedia(
        query: Optional[str] = Query(None, description="Search term"),
        category: Optional[str] = Query(None, description="Category filter"),
        db: Session = Depends(get_db),
):
    results = []
    search_term = f"%{query}%" if query else "%"

    # Search Concepts
    q_c = db.query(Concept).filter(
        (Concept.title.ilike(search_term)) | (Concept.body.ilike(search_term))
    )
    if category: q_c = q_c.filter(Concept.category == category)

    for c in q_c.all():
        media_list = json.loads(c.media_files) if c.media_files else []
        results.append(ConceptOut(
            id=c.id, title=c.title, summary=c.summary or "", body=c.body or "",
            category=c.category or "General", tags=[t.name for t in c.tags],
            media_files=to_media_urls(media_list), type="concept"
        ))

    # Search Drills
    q_d = db.query(Drill).filter(
        (Drill.title.ilike(search_term)) | (Drill.description.ilike(search_term))
    )
    if category: q_d = q_d.filter(Drill.category == category)

    for d in q_d.all():
        results.append(ConceptOut(
            id=d.id, title=d.title, summary="Drill", body=d.description or "",
            category=d.category or "Drills", tags=[t.name for t in d.tags],
            media_files=to_media_urls(d.all_media), type="drill"
        ))

    return results

# Keep your update_concept as is...