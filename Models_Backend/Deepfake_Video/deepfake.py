from fastapi import FastAPI, UploadFile, File , Form , HTTPException
from fastapi.middleware.cors import CORSMiddleware
import torch
import torch.nn as nn
import yt_dlp
from torchvision import transforms
from PIL import Image
import cv2
import timm
import numpy as np
import tempfile
import shutil
import os
import uvicorn
import asyncio
import subprocess
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
# Initialize FastAPI app
app = FastAPI()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow frontend to access backend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Device configuration
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(torch.cuda.is_available())
print(torch.cuda.get_device_name(0) if torch.cuda.is_available() else "No GPU")
# Define image transformations (same as used during training)
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

# Load the trained model
model = timm.create_model('vit_base_patch16_224', pretrained=False, num_classes=2)
model.load_state_dict(torch.load(r"C:\projects\TruthShield\Models_Backend\Deepfake_Video\best_vit_model.pth", map_location=device))
model.to(device).eval().half()  # Use mixed precision

# Function to detect significant scene changes (to skip redundant frames)
def is_significant_change(prev_frame, current_frame, threshold=30):
    diff = cv2.absdiff(prev_frame, current_frame)
    gray_diff = cv2.cvtColor(diff, cv2.COLOR_BGR2GRAY)
    score = cv2.mean(gray_diff)[0]
    return score > threshold

# Function to process the video and classify frames
def predict_deepfake(video_path, model, transform, device, frame_skip=1, batch_size=8):
    cap = cv2.VideoCapture(video_path, cv2.CAP_FFMPEG)  # Use faster video decoding
    cap.set(cv2.CAP_PROP_BUFFERSIZE, 3)  # Reduce buffering delay
    frame_count = 0
    real_count = 0
    manipulated_count = 0
    prev_frame = None
    batch = []
    predictions = []

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
        
        frame_count += 1
        
        # Process key frames only (scene changes or every nth frame)
        if prev_frame is None or frame_count % frame_skip == 0 or is_significant_change(prev_frame, frame):
            image = Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
            image = transform(image).unsqueeze(0).to(device).half()  
            batch.append(image)

            # Process batch when it reaches batch_size
            if len(batch) == batch_size:
                batch_tensor = torch.cat(batch, dim=0)
                with torch.no_grad():
                    outputs = model(batch_tensor)
                    predicted = torch.argmax(outputs, dim=1).tolist()
                predictions.extend(predicted)
                batch = []
        
        prev_frame = frame  # Store previous frame for scene change detection

    # Process remaining frames in batch
    if batch:
        batch_tensor = torch.cat(batch, dim=0)
        with torch.no_grad():
            outputs = model(batch_tensor)
            predicted = torch.argmax(outputs, dim=1).tolist()
        predictions.extend(predicted)

    cap.release()
    os.remove(video_path)  # Remove temp file

    # Count real vs manipulated frames
    real_count = predictions.count(0)
    manipulated_count = predictions.count(1)

    # Final decision based on majority vote
    result = "Real" if real_count > manipulated_count else "Manipulated"
    return {"result": result, "real_frames": real_count, "manipulated_frames": manipulated_count}

# Asynchronous file deletion to avoid blocking response time
async def delete_temp_file(path):
    await asyncio.sleep(1)  # Ensure file is not in use before deletion
    os.remove(path)

# FastAPI endpoint for video upload and processing
@app.post("/predict")
async def predict_deepfake_api(file: UploadFile = File(...)):
    with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as temp_video:
        shutil.copyfileobj(file.file, temp_video)
        temp_video_path = temp_video.name
    
    # Run video processing in a background thread
    result = await asyncio.to_thread(predict_deepfake, temp_video_path, model, transform, device)

    # Delete temp file asynchronously
    asyncio.create_task(delete_temp_file(temp_video_path))

    return result

@app.post("/predict_url")
async def predict_deepfake_from_url(url: str = Form(...), max_duration_sec: int = Form(30)):

    if shutil.which("ffmpeg") is None:
        raise HTTPException(status_code=500, detail="ffmpeg not found on PATH. Install ffmpeg.")

    # Create temporary directory
    tmpdir = tempfile.mkdtemp(prefix="yt_")
    output_path = os.path.join(tmpdir, "video.mp4")
    trimmed_path = os.path.join(tmpdir, "trimmed.mp4")
    
    ydl_opts = {
        "format": "best[ext=mp4]/best",
        "outtmpl": output_path,
        "quiet": True,
        "no_warnings": True,
        "noplaylist": True,
        "merge_output_format": "mp4",
    }

    try:
        # Download the video
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=True)
            
            # Check duration
            duration = info.get('duration', 0)

        # Verify the file was downloaded
        if not os.path.exists(output_path) or os.path.getsize(output_path) < 50 * 1024:
            raise HTTPException(status_code=400, detail="Downloaded file is missing or too small")
        
        cmd = [
            "ffmpeg", "-y",
            "-i", output_path,
            "-t", str(min(duration, max_duration_sec)),
            "-c", "copy",
            trimmed_path
        ]
        subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
        # Run prediction
        result = await asyncio.to_thread(predict_deepfake, trimmed_path, model, transform, device)
        return result

    except yt_dlp.DownloadError as e:
        logger.error(f"YouTube download failed: {e}")
        raise HTTPException(status_code=400, detail=f"YouTube download failed: {str(e)}")
    except Exception as e:
        logger.error(f"URL prediction failed: {e}")
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")
    finally:
        # Clean up temporary directory
        async def cleanup_temp():
            await asyncio.sleep(1)
            try:
                shutil.rmtree(tmpdir, ignore_errors=True)
            except Exception as e:
                logger.warning(f"Failed to clean up temp directory: {e}")
        
        asyncio.create_task(cleanup_temp())

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8002)

# C:\Users\vaibh\anaconda3\python.exe -m uvicorn deepfake:app --host 127.0.0.1 --port 8002 --reload
