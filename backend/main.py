import uuid
from typing import Any, Dict, List

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from flow import process_chat, process_upload
from sessions import all_sessions, create_session, get_session, update_session

app = FastAPI(title="Agentic AI Backend")


class ChatRequest(BaseModel):
    session_id: str
    message: str


class UploadRequest(BaseModel):
    session_id: str
    file_name: str


class DashboardResponse(BaseModel):
    total_sessions: int
    sessions: List[Dict[str, Any]]


@app.post("/start")
def start_session() -> Dict[str, Any]:
    session_id = str(uuid.uuid4())
    create_session(session_id)
    return {"session_id": session_id}


@app.post("/chat")
def chat(request: ChatRequest) -> Dict[str, Any]:
    session = get_session(request.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    if not request.message.strip():
        raise HTTPException(status_code=400, detail="Message must not be empty")

    reply, step, logs, data = process_chat(session, request.message)
    update_session(request.session_id, step, data)
    return {
        "reply": reply,
        "step": step,
        "logs": logs,
    }


@app.post("/upload")
def upload_documents(request: UploadRequest) -> Dict[str, Any]:
    session = get_session(request.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    if not request.file_name.strip():
        raise HTTPException(status_code=400, detail="file_name must not be empty")

    reply, step, logs, data = process_upload(session, request.file_name)
    update_session(request.session_id, step, data)
    return {
        "reply": reply,
        "step": step,
        "logs": logs,
    }


@app.get("/dashboard")
def dashboard() -> DashboardResponse:
    sessions = all_sessions()
    session_list = [
        {"session_id": session_id, "step": session["step"], "data": session["data"]}
        for session_id, session in sessions.items()
    ]
    return {"total_sessions": len(session_list), "sessions": session_list}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
