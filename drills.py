from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session, joinedload # Added joinedload
from app.db import get_db
from app.models.drill import Drill
from app.models.tag import Tag
from app.schemas.drill import DrillRead
import os
import uuid
import shutil

router = APIRouter(prefix="/drills", tags=["drills"])

UPLOAD_DIR = "uploaded_videos"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# -------------------------------
# Create Drill
# -------------------------------
@router.post("/", response_model=DrillRead)
def create_drill(
    title: str = Form(...),
    description: str = Form(None),
    tag_names: str = Form(""),  # comma-separated tags
    video_file: UploadFile = File(None),
    video_link: str = Form(None),
    db: Session = Depends(get_db),
):
    db_drill = Drill(title=title, description=description)

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

    # Handle video
    if video_file:
        filename = f"{uuid.uuid4()}_{video_file.filename}"
        filepath = os.path.join(UPLOAD_DIR, filename)
        with open(filepath, "wb") as buffer:
            shutil.copyfileobj(video_file.file, buffer)
        db_drill.video_url = filepath
    elif video_link:
        db_drill.video_url = video_link

    # Save drill
    db.add(db_drill)
    db.commit()
    db.refresh(db_drill)
    return db_drill

# -------------------------------
# List Drills (With Tags for Search)
# -------------------------------
@router.get("/", response_model=list[DrillRead])
def list_drills(db: Session = Depends(get_db)):
    # .options(joinedload(Drill.tags)) ensures tags are included in the JSON response
    # This prevents the "N+1" problem and makes the searchable dropdown fast.
    return db.query(Drill).options(joinedload(Drill.tags)).all()

# -------------------------------
# Get Single Drill
# -------------------------------
@router.get("/{drill_id}", response_model=DrillRead)
def get_drill(drill_id: str, db: Session = Depends(get_db)):
    # Also use joinedload here for consistency
    drill = db.query(Drill).options(joinedload(Drill.tags)).filter(Drill.id == drill_id).first()
    if not drill:
        raise HTTPException(status_code=404, detail="Drill not found")
    return drill

# -------------------------------
# Update Drill Tags
# -------------------------------
@router.patch("/{drill_id}/tags", response_model=DrillRead)
def update_drill_tags(drill_id: str, tag_names: list[str], db: Session = Depends(get_db)):
    drill = db.query(Drill).get(drill_id)
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
    return drill