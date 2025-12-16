import uuid
import os
import shutil
import json
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.db import get_db
from app.models.concept import Concept
from app.models.concept_tag import concept_tags
from app.models.tag import Tag
from pydantic import BaseModel

router = APIRouter(prefix="/concepts", tags=["Concepts"])

# -----------------------------
# Upload config
# -----------------------------
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

BACKEND_URL = "http://localhost:8000"  # adjust if your backend runs on a different port

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
    media_files: List[str] = []  # URLs or file paths

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

    class Config:
        orm_mode = True

# -----------------------------
# Helper to generate full URLs
# -----------------------------
def to_media_urls(file_list: List[str]) -> List[str]:
    return [f"{BACKEND_URL}/{UPLOAD_DIR}/{os.path.basename(f)}" for f in file_list]

# -----------------------------
# Routes
# -----------------------------
@router.get("/", response_model=List[ConceptOut])
def list_concepts(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    concepts = db.query(Concept).offset(skip).limit(limit).all()
    result = []
    for c in concepts:
        media_list = json.loads(c.media_files) if c.media_files else []
        result.append(
            ConceptOut(
                id=c.id,
                title=c.title,
                summary=c.summary,
                body=c.body,
                category=c.category,
                tags=[t.name for t in c.tags],
                media_files=to_media_urls(media_list),
            )
        )
    return result

@router.get("/{concept_id}", response_model=ConceptOut)
def get_concept(concept_id: str, db: Session = Depends(get_db)):
    concept = db.query(Concept).filter(Concept.id == concept_id).first()
    if not concept:
        raise HTTPException(status_code=404, detail="Concept not found")
    media_list = json.loads(concept.media_files) if concept.media_files else []
    return ConceptOut(
        id=concept.id,
        title=concept.title,
        summary=concept.summary,
        body=concept.body,
        category=concept.category,
        tags=[t.name for t in concept.tags],
        media_files=to_media_urls(media_list),
    )

@router.post("/", response_model=ConceptOut)
def create_concept(concept_in: ConceptCreate, db: Session = Depends(get_db)):
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

        # Attach tags
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
        )

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{concept_id}", response_model=ConceptOut)
def update_concept(concept_id: str, concept_in: ConceptUpdate, db: Session = Depends(get_db)):
    concept = db.query(Concept).filter(Concept.id == concept_id).first()
    if not concept:
        raise HTTPException(status_code=404, detail="Concept not found")

    for field, value in concept_in.dict(exclude_unset=True).items():
        if field == "tags" and value is not None:
            concept.tags.clear()
            for tag_name in value:
                tag = db.query(Tag).filter(Tag.name == tag_name).first()
                if not tag:
                    tag = Tag(name=tag_name)
                    db.add(tag)
                    db.commit()
                    db.refresh(tag)
                concept.tags.append(tag)
        elif field == "media_files" and value is not None:
            concept.media_files = json.dumps(value)
        elif value is not None:
            setattr(concept, field, value)

    db.commit()
    db.refresh(concept)
    media_list = json.loads(concept.media_files) if concept.media_files else []
    return ConceptOut(
        id=concept.id,
        title=concept.title,
        summary=concept.summary,
        body=concept.body,
        category=concept.category,
        tags=[t.name for t in concept.tags],
        media_files=to_media_urls(media_list),
    )

@router.get("/categories")
def list_categories(db: Session = Depends(get_db)):
    categories = db.query(Concept.category).distinct().all()
    return [c[0] for c in categories if c[0]]

# -----------------------------
# Search route
# -----------------------------
@router.get("/search", response_model=List[ConceptOut])
def search_concepts(
    query: Optional[str] = Query(None, description="Search term"),
    category: Optional[str] = Query(None, description="Category filter"),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 50,
):
    """
    Search concepts by title, summary, or body, and optionally filter by category.
    Returns empty list if no query is provided.
    """
    q = db.query(Concept)

    if query:
        search_term = f"%{query}%"
        q = q.filter(
            (Concept.title.ilike(search_term)) |
            (Concept.summary.ilike(search_term)) |
            (Concept.body.ilike(search_term))
        )

    if category:
        q = q.filter(Concept.category == category)

    q = q.offset(skip).limit(limit)
    concepts = q.all()

    results = []
    for c in concepts:
        media_list = json.loads(c.media_files) if c.media_files else []
        results.append(
            ConceptOut(
                id=c.id,
                title=c.title,
                summary=c.summary,
                body=c.body,
                category=c.category,
                tags=[t.name for t in c.tags],
                media_files=to_media_urls(media_list),
            )
        )
    return results
