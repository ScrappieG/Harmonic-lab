from fastapi import FastAPI, UploadFile, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI
from workers import WorkerEntrypoint
import asgi
import json

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

@app.get("/")
def root():
    return {"message": "ArticuLeet API"}

@app.post("/transcribe")
async def transcribe(audio: UploadFile, request: Request):
    env = request.scope["env"]
    client = OpenAI(api_key=env.OPENAI_API_KEY)

    transcript = client.audio.transcriptions.create(
        model="whisper-1",
        file=(audio.filename, audio.file, audio.content_type),
    )

    return {"text": transcript.text}

class AnalyzeRequest(BaseModel):
    transcript: str
    problem: str
    code: str = ""

#analyze audio transcript (this will be expanded on later)
@app.post("/analyze")
async def analyze(data: AnalyzeRequest, request: Request):
    env = request.scope["env"]
    client = OpenAI(api_key=env.OPENAI_API_KEY)

    response = client.chat.completions.create(
        model="gpt-4o",
        response_format={"type": "json_object"},
        messages=[ ... ]
    )

    return json.loads(response.choices[0].message.content)

# cloudflare worker entrypoint
class Default(WorkerEntrypoint):
    async def fetch(self, request):
        return await asgi.fetch(app, request, self.env)