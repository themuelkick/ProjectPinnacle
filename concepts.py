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
from app.models.drill import Drill
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
    history: List[dict] = []  # NEW


class ConceptUpdate(BaseModel):
    title: Optional[str] = None
    summary: Optional[str] = None
    body: Optional[str] = None
    category: Optional[str] = None
    tags: Optional[List[str]] = None
    media_files: Optional[List[str]] = None
    history: Optional[List[dict]] = None  # NEW


class ConceptOut(BaseModel):
    id: str
    title: str
    summary: str
    body: str
    category: str
    tags: List[str]
    media_files: List[str] = []
    history: List[dict] = []  # NEW
    type: str = "concept"

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
@router.get("/tags")
def get_all_tags(db: Session = Depends(get_db)):
    tags = db.query(Tag).all()
    return [{"id": t.id, "name": t.name} for t in tags]

@router.get("/", response_model=List[ConceptOut])
def list_encyclopedia(db: Session = Depends(get_db)):
    results = []

    # 1. Fetch Concepts
    concepts = db.query(Concept).all()
    for c in concepts:
        media_list = json.loads(c.media_files) if c.media_files else []
        # Parse history string from SQLite back to List[dict]
        hist_list = json.loads(c.history) if (hasattr(c, 'history') and c.history) else []

        results.append(ConceptOut(
            id=c.id,
            title=c.title,
            summary=c.summary or "",
            body=c.body or "",
            category=c.category or "General",
            tags=[t.name for t in c.tags],
            media_files=to_media_urls(media_list),
            history=hist_list,
            type="concept"
        ))

    # 2. Fetch Drills
    drills = db.query(Drill).all()
    for d in drills:
        # Check if drills have history too
        d_hist = json.loads(d.history) if (hasattr(d, 'history') and d.history) else []
        results.append(ConceptOut(
            id=d.id,
            title=d.title,
            summary="Drill Exercise",
            body=d.description or "",
            category=d.category or "Drills",
            tags=[t.name for t in d.tags],
            media_files=to_media_urls(d.all_media),
            history=d_hist,
            type="drill"
        ))

    return results


@router.get("/{concept_id}", response_model=ConceptOut)
def get_entry(concept_id: str, db: Session = Depends(get_db)):
    # Check Concepts
    concept = db.query(Concept).filter(Concept.id == concept_id).first()
    if concept:
        media_list = json.loads(concept.media_files) if concept.media_files else []
        hist_list = json.loads(concept.history) if (hasattr(concept, 'history') and concept.history) else []
        return ConceptOut(
            id=concept.id,
            title=concept.title,
            summary=concept.summary or "",
            body=concept.body or "",
            category=concept.category or "General",
            tags=[t.name for t in concept.tags],
            media_files=to_media_urls(media_list),
            history=hist_list,
            type="concept"
        )

    # Check Drills
    drill = db.query(Drill).filter(Drill.id == concept_id).first()
    if drill:
        d_hist = json.loads(drill.history) if (hasattr(drill, 'history') and drill.history) else []
        return ConceptOut(
            id=drill.id,
            title=drill.title,
            summary="Drill",
            body=drill.description or "",
            category=drill.category or "Drills",
            tags=[t.name for t in drill.tags],
            media_files=to_media_urls(drill.all_media),
            history=d_hist,
            type="drill"
        )

    raise HTTPException(status_code=404, detail="Entry not found")


@router.post("/", response_model=ConceptOut)
def create_concept(concept_in: ConceptCreate, db: Session = Depends(get_db)):
    try:
        media_json = json.dumps(concept_in.media_files) if concept_in.media_files else "[]"
        history_json = json.dumps(concept_in.history) if concept_in.history else "[]"

        new_concept = Concept(
            id=str(uuid.uuid4()),
            title=concept_in.title,
            summary=concept_in.summary,
            body=concept_in.body,
            category=concept_in.category,
            media_files=media_json,
            history=history_json  # NEW
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
            history=concept_in.history or [],
            type="concept"
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{concept_id}", response_model=ConceptOut)
def update_concept(concept_id: str, concept_in: ConceptUpdate, db: Session = Depends(get_db)):
    # Look in both tables
    target = db.query(Concept).filter(Concept.id == concept_id).first()
    is_drill = False
    if not target:
        target = db.query(Drill).filter(Drill.id == concept_id).first()
        is_drill = True

    if not target:
        raise HTTPException(status_code=404, detail="Entry not found")

    update_data = concept_in.model_dump(exclude_unset=True)

    # Handle Tags
    if "tags" in update_data:
        tag_names = update_data.pop("tags")
        target.tags = []
        for name in tag_names:
            tag = db.query(Tag).filter(Tag.name == name).first() or Tag(name=name)
            target.tags.append(tag)

    # Handle JSON fields
        # Handle JSON fields
        if "media_files" in update_data:
            m_files_list = update_data.pop("media_files")
            m_files_json = json.dumps(m_files_list)

            if is_drill:
                # For Drills, save to the actual media_files column
                target.media_files = m_files_json
                # Optional: if the list has at least one item, sync it to the legacy video_url
                if m_files_list:
                    target.video_url = m_files_list[0]
            else:
                # For Concepts
                target.media_files = m_files_json

    if "history" in update_data:
        setattr(target, "history", json.dumps(update_data.pop("history")))

    # Update remaining fields
    for key, value in update_data.items():
        if is_drill and key == "body":
            setattr(target, "description", value)
        elif hasattr(target, key):
            setattr(target, key, value)

    db.commit()
    return get_entry(concept_id, db)


@router.delete("/{concept_id}")
def delete_entry(concept_id: str, db: Session = Depends(get_db)):
    # 1. Try Concepts
    concept = db.query(Concept).filter(Concept.id == concept_id).first()
    if concept:
        db.delete(concept)
        db.commit()
        return {"message": "Concept deleted successfully"}

    # 2. Try Drills
    drill = db.query(Drill).filter(Drill.id == concept_id).first()
    if drill:
        db.delete(drill)
        db.commit()
        return {"message": "Drill deleted successfully"}

    raise HTTPException(status_code=404, detail="Entry not found")


@router.get("/search", response_model=List[ConceptOut])
def search_encyclopedia(
        query: Optional[str] = Query(None, description="Search term"),
        category: Optional[str] = Query(None, description="Category filter"),
        db: Session = Depends(get_db),
):
    results = []
    search_term = f"%{query}%" if query else "%"

    q_c = db.query(Concept).filter(
        (Concept.title.ilike(search_term)) | (Concept.body.ilike(search_term))
    )
    if category: q_c = q_c.filter(Concept.category.like(f"{category}%"))

    for c in q_c.all():
        media_list = json.loads(c.media_files) if c.media_files else []
        hist_list = json.loads(c.history) if (hasattr(c, 'history') and c.history) else []
        results.append(ConceptOut(
            id=c.id, title=c.title, summary=c.summary or "", body=c.body or "",
            category=c.category or "General", tags=[t.name for t in c.tags],
            media_files=to_media_urls(media_list), history=hist_list, type="concept"
        ))

    q_d = db.query(Drill).filter(
        (Drill.title.ilike(search_term)) | (Drill.description.ilike(search_term))
    )
    if category: q_d = q_d.filter(Drill.category == category)

    for d in q_d.all():
        d_hist = json.loads(d.history) if (hasattr(d, 'history') and d.history) else []
        results.append(ConceptOut(
            id=d.id, title=d.title, summary="Drill", body=d.description or "",
            category=d.category or "Drills", tags=[t.name for t in d.tags],
            media_files=to_media_urls(d.all_media), history=d_hist, type="drill"
        ))

    return results

