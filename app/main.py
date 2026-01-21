import os
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from app.services.gemini_service import analyze_meeting
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="MeetMind")

# Serve static files (Frontend)
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/")
async def read_root():
    return JSONResponse(content={"message": "Welcome to MeetMind API. Visit /static/index.html for the UI."})

@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    """
    Uploads a meeting recording, processes it with Gemini, and returns the analysis.
    """
    try:
        # validate file type (basic check)
        if not file.content_type.startswith("audio/") and not file.content_type.startswith("video/"):
             # For robustness, we might accept application/octet-stream if user forces it, but warn.
             pass

        # Save specific file to temp for processing if needed, 
        # or pass stream if the service supports it. 
        # Gemini File API usually needs a file path or bytes. 
        # For large files, saving to disk first is safer.
        
        temp_filename = f"temp_{file.filename}"
        with open(temp_filename, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
            
        try:
            # Call Gemini Service
            analysis_result = await analyze_meeting(temp_filename, file.content_type)
            return JSONResponse(content=analysis_result)
        finally:
            # Cleanup
            if os.path.exists(temp_filename):
                os.remove(temp_filename)

    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
