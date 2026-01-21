import os
import json
import google.generativeai as genai
from fastapi import HTTPException
import time

# Configure Gemini
# Expects GOOGLE_API_KEY in environment variables
genai.configure(api_key="AIzaSyDKhfnCutcWuu4BN23mL1OuYaPCSgOMprA")

async def analyze_meeting(file_path: str, mime_type: str) -> dict:
    """
    Uploads file to Gemini, waits for processing, and generates specific analysis.
    """
    try:
        # 1. Upload file
        print(f"Uploading file: {file_path}")
        video_file = genai.upload_file(path=file_path)
        print(f"Completed upload: {video_file.uri}")

        # 2. Wait for processing (if video)
        while video_file.state.name == "PROCESSING":
            print("File is processing...")
            time.sleep(2)
            video_file = genai.get_file(video_file.name)

        if video_file.state.name == "FAILED":
            raise HTTPException(status_code=500, detail="Gemini file processing failed.")

        # 3. Generate Content
        # We want a structured JSON output.
        prompt = """
        You are an advanced AI Meeting Assistant. Analyze this meeting recording in detail.
        
        Generate a comprehensive report in pure valid JSON format with the following structure:
        {
            "summary": "Detailed executive summary of the meeting (3-4 paragraphs).",
            "agenda_covered": ["List of topics discussed"],
            "key_decisions": ["List of decisions made"],
            "action_items": [
                {"task": "Task description", "assignee": "Name or inferred role", "deadline": "if mentioned", "priority": "High/Medium/Low"}
            ],
            "timeline_events": [
                {"time": "00:00", "event": "Start of meeting"},
                {"time": "MM:SS", "event": "Description of key discussion point"}
            ],
            "analyzed_requirements": "If the meeting is about a project, list detailed requirements identified as a single string or object.",
            "sentiment_analysis": "Brief overview of the tone (Positive/Neutral/Tense)",
            "follow_up_suggestions": ["List of suggested next steps"]
        }
        
        Ensure the output is ONLY this JSON, no markdown formatting like ```json ... ```.
        """

        model = genai.GenerativeModel("gemini-2.5-flash") # Efficient for large context
        
        print("Generating analysis...")
        response = model.generate_content(
            [video_file, prompt],
            request_options={"timeout": 600}
        )
        
        # 4. Clean up file from cloud
        genai.delete_file(video_file.name)
        
        # 5. Parse JSON
        text_response = response.text
        # Strip markdown if present
        if text_response.startswith("```json"):
            text_response = text_response[7:]
        if text_response.endswith("```"):
            text_response = text_response[:-3]
            
        return json.loads(text_response.strip())

    except Exception as e:
        print(f"Error in Gemini Service: {e}")
        # Attempt to clean up even on error if the file variable exists and was uploaded
        # (This is a simplified error handling)
        raise HTTPException(status_code=500, detail=str(e))
