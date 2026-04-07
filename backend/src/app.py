from fastapi import FastAPI, UploadFile, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from workers import WorkerEntrypoint
import json
import httpx

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://articuleet.com",
        "https://www.articuleet.com",
        "http://localhost:5173",
        "https://leetcode.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# lazy-load supabase_client + db at request time (snapshot workaround)
def _db(request):
    from supabase_client import get_supabase
    return get_supabase(request)

def _fn(name):
    import db
    return getattr(db, name)

async def get_current_user(request: Request) -> dict:
    token = request.headers.get("Authorization", "").removeprefix("Bearer ").strip()
    if not token:
        raise HTTPException(status_code=401, detail="Missing token")
    return await _db(request).auth_get_user(token)

def get_api_key(request: Request) -> str:
    env = request.scope["env"]
    api_key = getattr(env, "OPENAI_API_KEY", None)
    if not api_key:
        raise HTTPException(status_code=500, detail="OPENAI_API_KEY missing (check wrangler secret + env)")
    return api_key

@app.get("/")
def root():
    return {"message": "ArticuLeet API"}

@app.post("/transcribe")
async def transcribe(audio: UploadFile, request: Request):
    api_key = get_api_key(request)

    data = await audio.read()
    files = {
        "file": (audio.filename or "audio.wav", data, audio.content_type or "application/octet-stream"),
    }
    form = {"model": "whisper-1"}
    headers = {"Authorization": f"Bearer {api_key}"}

    async with httpx.AsyncClient(timeout=120.0) as client:
        response = await client.post(
            "https://api.openai.com/v1/audio/transcriptions",
            headers=headers,
            data=form,
            files=files,
        )

    if response.status_code >= 400:
        raise HTTPException(status_code=response.status_code, detail=response.text)

    payload = response.json()
    return {"text": payload.get("text", "")}

class AnalyzeRequest(BaseModel):
    transcript: str
    problem: str
    code: str = ""

@app.post("/analyze")
async def analyze(data: AnalyzeRequest, request: Request):
    api_key = get_api_key(request)
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": "gpt-4o",
        "response_format": {"type": "json_object"},
        "messages": [ ... ],
    }

    async with httpx.AsyncClient(timeout=120.0) as client:
        response = await client.post(
            "https://api.openai.com/v1/chat/completions",
            headers=headers,
            json=payload,
        )

    if response.status_code >= 400:
        raise HTTPException(status_code=response.status_code, detail=response.text)

    response_payload = response.json()
    content = response_payload["choices"][0]["message"]["content"]
    return json.loads(content)


class StartSessionRequest(BaseModel):
    problem_name: str
    problem_url: str

class FinishSessionRequest(BaseModel):
    session_id: str
    total_time: int

class SaveDetailsRequest(BaseModel):
    session_id: str
    transcript: str
    code: str
    problem_statement: str

class SaveScoreRequest(BaseModel):
    session_id: str
    score_overall: float
    feedback_overall: str
    score_comm: float
    feedback_comm: str
    score_ps: float
    feedback_ps: str
    pass_: bool = Field(alias="pass")
    overall_takeaway: str

@app.post("/sessions/start")
async def start_session(data: StartSessionRequest, request: Request):
    user = await get_current_user(request)
    db = _db(request)
    return await _fn("create_session")(db, user["id"], data.problem_name, data.problem_url)

@app.post("/sessions/finish")
async def finish_session_route(data: FinishSessionRequest, request: Request):
    await get_current_user(request)
    db = _db(request)
    return await _fn("finish_session")(db, data.session_id, data.total_time)

@app.post("/sessions/details")
async def save_details(data: SaveDetailsRequest, request: Request):
    await get_current_user(request)
    db = _db(request)
    return await _fn("save_problem_details")(db, data.session_id, data.transcript, data.code, data.problem_statement)

@app.post("/sessions/score")
async def save_score_route(data: SaveScoreRequest, request: Request):
    await get_current_user(request)
    db = _db(request)
    score_data = {
        "score_overall": data.score_overall,
        "feedback_overall": data.feedback_overall,
        "score_comm": data.score_comm,
        "feedback_comm": data.feedback_comm,
        "score_ps": data.score_ps,
        "feedback_ps": data.feedback_ps,
        "pass": data.pass_,
        "overall_takeaway": data.overall_takeaway,
    }
    return await _fn("save_score")(db, data.session_id, score_data)

@app.get("/sessions")
async def list_sessions(request: Request):
    user = await get_current_user(request)
    db = _db(request)
    return await _fn("get_user_sessions")(db, user["id"])

@app.get("/sessions/{session_id}")
async def session_result(session_id: str, request: Request):
    user = await get_current_user(request)
    db = _db(request)
    return await _fn("get_session_result")(db, session_id, user["id"])

@app.get("/me")
async def me(request: Request):
    user = await get_current_user(request)
    db = _db(request)
    await _fn("insert_user")(db, user["id"], user["email"])
    return {"id": user["id"], "email": user["email"]}

@app.get("/healthz")
async def healthz():
    return {"ok": True}

# cloudflare worker entrypoint
class Default(WorkerEntrypoint):
    async def fetch(self, request):
        import asgi
        return await asgi.fetch(app, request, self.env)
