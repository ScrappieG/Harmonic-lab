from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

client = OpenAI()

@app.get("/")
def root():
    return {"message": "ArticuLeet API"}

#testing using an actual audio file for transcribing
@app.post("/transcribe")
async def transcribe(audio: UploadFile):
    transcript = client.audio.transcriptions.create(
        model="whisper-1",
        file=(audio.filename, audio.file, audio.content_type),
    )
    return {"text": transcript.text}