import os
import uuid
import shutil
import json
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session, joinedload
from typing import List

from app.db import get_db
from app.models.drill import Drill
from app.models.tag import Tag
from app.schemas.drill import DrillRead

router = APIRouter(prefix="/drills", tags=["drills"])

UPLOAD_DIR = "uploaded_videos"
os.makedirs(UPLOAD_DIR, exist_ok=True)


# Helper to ensure media_files is a list before sending to Pydantic
def format_drill_for_response(drill: Drill):
    if isinstance(drill.media_files, str):
        try:
            drill.media_files = json.loads(drill.media_files)
        except:
            drill.media_files = []
    # Ensure it's not None
    if drill.media_files is None:
        drill.media_files = []
    return drill


# -------------------------------
# Create Drill
# -------------------------------
@router.post("/", response_model=DrillRead)
def create_drill(
        title: str = Form(...),
        description: str = Form(None),
        category: str = Form(None),  # Added Category support
        tag_names: str = Form(""),  # comma-separated tags
        video_file: UploadFile = File(None),
        video_link: str = Form(None),
        db: Session = Depends(get_db),
):
    db_drill = Drill(
        title=title,
        description=description,
        category=category
    )

    # Handle tags
    tags = []
    for tag_name in [t.strip() for t in tag_names.split(",") if t.strip()]:
        tag = db.query(Tag).filter(Tag.name == tag_name).first()
        if not tag:
            tag = Tag(name=tag_name)
            db.add(tag)
            db.commit()
            db.refresh(tag)
        tags.append(tag)
    db_drill.tags = tags

    # Handle media/video
    media_list = []
    if video_file:
        filename = f"{uuid.uuid4()}_{video_file.filename}"
        filepath = os.path.join(UPLOAD_DIR, filename)
        with open(filepath, "wb") as buffer:
            shutil.copyfileobj(video_file.file, buffer)
        # Store in both for compatibility
        db_drill.video_url = filepath
        media_list.append(filepath)

    if video_link:
        # If no file was uploaded, set video_url to the link
        if not db_drill.video_url:
            db_drill.video_url = video_link
        media_list.append(video_link)

    db_drill.media_files = json.dumps(media_list)

    # Save drill
    db.add(db_drill)
    db.commit()
    db.refresh(db_drill)

    return format_drill_for_response(db_drill)


# -------------------------------
# List Drills
# -------------------------------
@router.get("/", response_model=List[DrillRead])
def list_drills(db: Session = Depends(get_db)):
    drills = db.query(Drill).options(joinedload(Drill.tags)).all()
    return [format_drill_for_response(d) for d in drills]


# -------------------------------
# Get Single Drill
# -------------------------------
@router.get("/{drill_id}", response_model=DrillRead)
def get_drill(drill_id: str, db: Session = Depends(get_db)):
    drill = db.query(Drill).options(joinedload(Drill.tags)).filter(Drill.id == drill_id).first()
    if not drill:
        raise HTTPException(status_code=404, detail="Drill not found")
    return format_drill_for_response(drill)


# -------------------------------
# Update Drill Tags
# -------------------------------
@router.patch("/{drill_id}/tags", response_model=DrillRead)
def update_drill_tags(drill_id: str, tag_names: List[str], db: Session = Depends(get_db)):
    drill = db.query(Drill).filter(Drill.id == drill_id).first()
    if not drill:
        raise HTTPException(status_code=404, detail="Drill not found")

    tags = []
    for tag_name in tag_names:
        tag = db.query(Tag).filter(Tag.name == tag_name).first()
        if not tag:
            tag = Tag(name=tag_name)
            db.add(tag)
            db.commit()
            db.refresh(tag)
        tags.append(tag)

    drill.tags = tags
    db.commit()
    db.refresh(drill)
    return format_drill_for_response(drill)