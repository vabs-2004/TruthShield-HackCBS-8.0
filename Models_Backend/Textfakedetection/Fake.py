import google.genai as genai
import os
from dotenv import load_dotenv
import os
from typing import Any, Dict, Optional
import uvicorn
import requests
from fastapi import FastAPI, File, UploadFile, Form, HTTPException, Body
from pydantic import BaseModel
from dotenv import load_dotenv
from PIL import Image
import io
import re
import numpy as np
import easyocr
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

os.environ["GEMINI_API_KEY"] = "YOUR_API_KEY"

client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])

model = "gemini-2.0-flash"

def check_news_with_gemini(news_text: str) -> dict:
    """
    Calls Gemini model to fact-check news.
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
app = FastAPI(title="Gemini Fact-check API", version="1.0")

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

    result = check_news_with_gemini(text_to_check)
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
    result = check_news_with_gemini(extracted_text)

    return {
        "extracted_text": extracted_text,
        "verification": result
    }


if __name__ == "__main__":
    uvicorn.run("FakenewsApi:app", host="127.0.0.1", port=8000, reload=True)