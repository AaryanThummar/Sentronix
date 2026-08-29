from sqlalchemy import Column, Integer, String, Text, DateTime
from datetime import datetime
from app.core.database import Base

class StegAnalysisResult(Base):
    __tablename__ = "steg_analysis_results"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, index=True)
    tool_used = Column(String)
    status = Column(String, default="completed")
    findings = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
