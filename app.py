from fastapi import FastAPI, Request, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from pydantic import BaseModel
from typing import Optional
import uuid
import logging
from agent_logic import ResearchAgent

app = FastAPI()

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    print(f"Validation Error: {exc.errors()}")
    print(f"Body: {await request.body()}")
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors(), "body": str(exc.body)},
    )

# Mount static files

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# Templates
templates = Jinja2Templates(directory="templates")

# Store active sessions
sessions = {}

class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None

@app.get("/")
async def read_root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    session_id = request.session_id
    
    if not session_id or session_id not in sessions:
        session_id = str(uuid.uuid4())
        sessions[session_id] = ResearchAgent()
        print(f"Created new session: {session_id}")
    
    agent = sessions[session_id]
    
    try:
        result = agent.process_message(request.message)
        
        # Handle both old string format and new dict format
        if isinstance(result, dict):
            return {
                "response": result.get('text', ''),
                "data": result.get('data'),
                "session_id": session_id
            }
        else:
            # Backward compatibility
            return {
                "response": result,
                "data": None,
                "session_id": session_id
            }
    except Exception as e:
        print(f"Error processing message: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/reset")
async def reset_session(request: ChatRequest):
    if request.session_id in sessions:
        del sessions[request.session_id]
    return {"status": "reset"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

