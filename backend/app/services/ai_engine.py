import google.generativeai as genai
from app.core.config import settings
from app.models.vulnerability import UnifiedFinding
from sqlalchemy.orm import Session

if settings.GEMINI_API_KEY:
    genai.configure(api_key=settings.GEMINI_API_KEY)

class AI_Correlation_Engine:
    def __init__(self):
        self.model = genai.GenerativeModel('gemini-1.5-pro')

    def correlate_findings(self, db: Session, scan_id: str):
        # Fetch findings for a scan
        findings = db.query(UnifiedFinding).filter(UnifiedFinding.scan_id == scan_id).all()
        if not findings:
            return None
        
        # Prepare context for the LLM
        prompt = "Analyze the following security findings and map runtime DAST exploits to source code (SAST) where possible, then propose a remediation patch:\n"
        for f in findings:
            prompt += f"- [{f.tool_used}] {f.severity}: {f.vulnerability_title} at {f.location}\n"
        
        prompt += "\nPlease provide a unified explanation and a unified diff patch."

        try:
            if not settings.GEMINI_API_KEY:
                return "Gemini API key not configured."
                
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            return f"Error contacting Gemini AI: {str(e)}"

ai_engine = AI_Correlation_Engine()
