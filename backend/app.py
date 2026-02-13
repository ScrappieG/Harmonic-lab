from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI
import json

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

class AnalyzeRequest(BaseModel):
    transcript: str
    problem: str
    code: str = ""

#testing using gpt-4o | will swap eventually
@app.post("/analyze")
async def analyze(request: AnalyzeRequest):
    response = client.chat.completions.create(
        model="gpt-4o",
        response_format={"type": "json_object"},
        messages=[
            {
                "role": "system",
                "content": """You are an expert technical interview coach. Analyze the following interview transcript and return a JSON object with this exact structure:
                {
                    "filler_words": {
                        "count": <number>,
                        "examples": ["um", "uh", "like", "so", "actually"]
                    },
                    "clarifying_questions": {
                        "score": "poor" | "fair" | "good",
                        "feedback": "<specific feedback>"
                    },
                    "thought_process": {
                        "score": "poor" | "fair" | "good",
                        "feedback": "<specific feedback>"
                    },
                    "complexity_analysis": {
                        "score": "none" | "partial" | "complete",
                        "feedback": "<specific feedback>"
                    },
                    "overall": "<2-3 sentence summary with advice>"
                }

                Evaluate based on:
                - Filler words: count occurrences of um, uh, like, you know, so, basically, actually
                - Clarifying questions: did they ask about constraints, edge cases, input format before solving?
                - Thought process: did they explain their approach clearly, walk through examples, consider alternatives?
                - Complexity analysis: did they discuss time and space complexity?
                Be constructive and specific in your feedback."""
            },
            {
                "role": "user",
                "content": f"Problem: {request.problem}\n\nCandidate's code:\n{request.code}\n\nInterview transcript:\n{request.transcript}"
            }
        ]
    )
    return json.loads(response.choices[0].message.content)