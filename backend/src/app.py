from fastapi import FastAPI, UploadFile, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from workers import WorkerEntrypoint
import asgi
import json
import httpx

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://articuleet.com",
        "https://www.articuleet.com",
        "http://localhost:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_api_key(request: Request) -> str:
    env = request.scope["env"]
    api_key = getattr(env, "OPENAI_API_KEY", None)
    if not api_key:
        raise HTTPException(status_code=500, detail="OPENAI_API_KEY missing (check wrangler secret + env)")
    return api_key

#TEMP
@app.get("/check-secret")
async def check_secret(request: Request):
    env = request.scope["env"]
    return {"has_openai_key": hasattr(env, "OPENAI_API_KEY")}

@app.get("/")
def root():
    return {"message": "ArticuLeet API"}

@app.post("/transcribe")
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

#analyze audio transcript (this will be expanded on later)
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

@app.get("/healthz")
async def healthz():
    return {"ok": True}

# cloudflare worker entrypoint
class Default(WorkerEntrypoint):
    async def fetch(self, request):
        return await asgi.fetch(app, request, self.env)
