import os
from typing import Any, Dict, Optional
import uvicorn
import requests
from fastapi import FastAPI, File, UploadFile, Form, HTTPException, Body
from pydantic import BaseModel
from groq import Groq
from dotenv import load_dotenv
from PIL import Image
import io
import re
import numpy as np
import easyocr
from fastapi.middleware.cors import CORSMiddleware

# --- Load variables from .env ---
load_dotenv()

# --- Get API key from environment safely ---
groq_api_key = os.getenv("GROQ_API_KEY")
if not groq_api_key:
    raise ValueError("❌ GROQ_API_KEY not found in .env file")


client = Groq(api_key=groq_api_key)

# --- Model name ---
MODEL_NAME = "groq/compound"

# Initialize EasyOCR reader once
reader = easyocr.Reader(['en'])


def list_models() -> Dict[str, Any]:
    """
    Same logic as your original list_models function.
    """
    url = "https://api.groq.com/openai/v1/models"
    headers = {
        "Authorization": f"Bearer {groq_api_key}",
        "Content-Type": "application/json",
    }
    resp = requests.get(url, headers=headers)
    resp.raise_for_status()
    return resp.json()


def check_news_with_groq(news_text: str) -> dict:
    """
    Calls Groq model to fact-check news.
    Returns structured JSON: { "result": ..., "sources": [...], "reasoning": ... }
    """
    prompt = f"""
You are a fact-checking assistant. 
Return your answer ONLY in this structured format:

Result: (REAL or FAKE)
Sources: (list credible sources with links, comma separated)
Reasoning: (brief reasoning why the news is REAL or FAKE)

Task:
- Analyze the following news text.
- Use up-to-date information.
- Decide if it is REAL or FAKE.
- Provide reasoning and sources.

News:
\"\"\"{news_text}\"\"\"
"""

    resp = client.chat.completions.create(
        model=MODEL_NAME,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.1,
        max_tokens=512,
    )

    try:
        content = resp.choices[0].message.content.strip()
    except Exception:
        return {"result": "ERROR", "sources": [], "reasoning": "Unexpected response format"}

    # --- Parse response ---
    result_match = re.search(r"Result:\s*(.*)", content)
    sources_match = re.search(r"Sources:\s*(.*)", content)
    reasoning_match = re.search(r"Reasoning:\s*(.*)", content, re.DOTALL)

    result = result_match.group(1).strip() if result_match else "UNKNOWN"
    sources = []
    if sources_match:
        sources_raw = sources_match.group(1).strip()
        sources = [s.strip() for s in sources_raw.split(",")]

    reasoning = reasoning_match.group(1).strip() if reasoning_match else ""

    return {
        "result": result,
        "sources": sources,
        "reasoning": reasoning
    }


# ------------ OCR Function (Updated to EasyOCR) ------------
def extract_text_from_image(image_bytes: bytes) -> str:
    try:
        image = Image.open(io.BytesIO(image_bytes))
        image = np.array(image)
        results = reader.readtext(image)

        text = " ".join([text for (_, text, _) in results])
        return text.strip()
    except Exception as e:
        return f"Error extracting text: {str(e)}"


# --- FastAPI app ---
app = FastAPI(title="Groq Fact-check API", version="1.0")

# --- Enable CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],   
    allow_headers=["*"],  
)

# ------------ FastAPI Models ------------
class VerifyRequest(BaseModel):
    text: Optional[str] = None


class NewsRequest(BaseModel):
    news_text: str


@app.on_event("startup")
def startup_event():
    """
    On startup, call list_models() and print available models.
    """
    try:
        models = list_models()
        print("✅ Available models:")
        for m in models.get("data", []):
            print("  ", m["id"])
    except Exception as e:
        print("Failed to list models on startup:", e)


@app.get("/models")
def get_models():
    try:
        return list_models()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Endpoint only for text 
@app.post("/verify_newstext")
async def post_check_news(
    news_text: Optional[str] = Form(None),
    body: Optional[NewsRequest] = Body(None)
):
    """
    Accepts either JSON: { "news_text": "..." } 
    OR form-data with field 'news_text'
    """
    if news_text:
        text_to_check = news_text
    elif body and body.news_text:
        text_to_check = body.news_text
    else:
        return {"error": "Please provide 'news_text' either in JSON body or form-data"}

    result = check_news_with_groq(text_to_check)
    return result

# ------------ Endpoint (Single for both text & image) ------------
@app.post("/verify_Imagearticle")
async def verify(
    text: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None)
):
    extracted_text = None

    if text:
        extracted_text = text
    elif file:
        file_bytes = await file.read()
        extracted_text = extract_text_from_image(file_bytes)
    else:
        return {"error": "Please provide either text or an image."}

    # Run verification logic
    result = check_news_with_groq(extracted_text)

    return {
        "extracted_text": extracted_text,
        "verification": result
    }


if __name__ == "__main__":
    uvicorn.run("FakenewsApi:app", host="127.0.0.1", port=8000, reload=True)

#venv\Scripts\Activate.ps1
#uvicorn FakenewsApi:app --reload
#docker build -t fact-check-api .