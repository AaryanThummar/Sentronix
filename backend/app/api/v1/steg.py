from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.steg import StegAnalysisResult
from app.services.steg_service import analyze_image
import shutil
import os
from tempfile import NamedTemporaryFile

router = APIRouter()

@router.post("/analyze")
async def analyze_steg(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.filename.lower().endswith(('.png', '.jpg', '.jpeg', '.gif')):
        raise HTTPException(status_code=400, detail="Only PNG, JPG, and GIF files are supported")

    # Save to temp file
    temp_file = NamedTemporaryFile(delete=False, suffix=f"_{file.filename}")
    try:
        with temp_file as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Analyze
        findings = analyze_image(temp_file.name)
        
        # Save to DB
        result_record = StegAnalysisResult(
            filename=file.filename,
            tool_used="stegextract",
            status="completed",
            findings=findings
        )
        db.add(result_record)
        db.commit()
        db.refresh(result_record)
        
        return {
            "id": result_record.id,
            "filename": result_record.filename,
            "status": result_record.status,
            "tool": result_record.tool_used,
            "findings": result_record.findings
        }
    finally:
        os.unlink(temp_file.name)

@router.get("/results")
def get_results(db: Session = Depends(get_db)):
    results = db.query(StegAnalysisResult).order_by(StegAnalysisResult.created_at.desc()).limit(20).all()
    return results
