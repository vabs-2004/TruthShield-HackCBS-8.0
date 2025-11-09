<div align="center"><strong><h1>TruthShield</h1></strong></div>

Demo Link : https://youtu.be/Gh611Y7DJ-8

## Table of Contents
- [Introduction](#introduction)
- [Current Features](#current-features)
- [Dependencies](#dependencies)
- [Installation](#installation)
- [Usage](#usage)
- [Team Members](#team-members)
- [Future Plans](#future-plans)
- [Project Specific Conventions](#project-specific-conventions)


## Introduction
Welcome to the **TruthShield** repository!  
TruthShield is a multi-component project aimed at **detecting fake news and deepfake videos** just by inputting text article or image article for checking the fake news and uploading the video or video link for checking the deepfake video. 
The primary technologies used include **Gemini**, **MongoDB**, **JavaScript**, **CSS**, **HTML**, **React** , **PyTorch**.

## Current Features
- 🚀 **Chrome Extension**: Provides a user interface for detecting fake news.
- 📺 **Responsive Authentication**: MongoDB Based Secured Authentication
- 🧑‍💻 **User-Friendly Interface**: Clean and intuitive UI.
- 📱 **Responsive Design**: Fully responsive across all screen sizes.
- 📺 **Detection Backend Models**: Backend Models specifically tailored to detect fake news and videos.

## Dependencies
```bash
MongoDB: ^0.41.0
Gemini: 0.5.0
@tailwindcss/vite: ^4.0.17  
axios: ^1.8.4  
class-variance-authority: ^0.7.1  
clsx: ^2.1.1  
lucide-react: ^0.484.0  
react: ^19.0.0  
react-dom: ^19.0.0  
react-icons: ^5.5.0  
react-markdown: ^10.1.0  
react-router-dom: ^7.4.1  
react-youtube: ^10.1.0  
tailwind-merge: ^3.0.2  
tailwindcss: ^4.0.17  
tw-animate-css: ^1.2.5  
uuid: ^11.1.0  
fastapi==0.104.1
uvicorn[standard]==0.24.0
requests==2.31.0
groq: 0.4.0
python-dotenv==1.0.0
Pillow==10.1.0
numpy==1.24.3
easyocr==1.7.0
python-multipart==0.0.6
torch==2.0.1
torchvision==0.15.2
opencv-python-headless==4.8.1.78
```

## Installation

To get started with installing TruthShield, follow these steps:

1. Clone the repository:
    ```bash
    git clone https://github.com/vabs-2004/TruthShield-HackCBS-8.0
    ```
2. Navigate to the project directory:
    ```bash
    cd TruthShield-HackCBS-8.0
    ```
3. Install the dependencies:
    ```bash
    cd Website/Frontend
    npm install
    ```
    ```
    cd Website/Backend
    npm install
    ```
    ```
    cd Models_Backend/Deepfake_Video
    pip install -r requirements.txt
    ```
    ```
    cd ../Textfakedetection
    pip install -r requirements.txt
    ```
4. Create a `.env` file in the root directory and add the following environment variables:
    ```plaintext
    GEMINI_API_KEY = <YOUR_GEMINI_API>
    GROK_API_KEY = <YOUR_GROK_API>
    ```

## Usage

After installing the dependencies, you can start the development server using the following commands:

```
cd Website/Frontend
npm run dev
```
```
cd Website/Backend
node index.js
```
```bash
cd Models_Backend/Textfakedetection
uvicorn FakenewsApi:app --reload
```
```
cd Models_Backend/Deepfake_Video
uvicorn deepfake:app --host 127.0.0.1 --port 8002 --reload
```

You can also use the Chrome Extension using Chrome Extension

1. Open Chrome → chrome://extensions/

2. Enable Developer Mode

3. Click Load Unpacked and select the Extension/ folder.

4. Use the popup to test fake news or deepfake video URLs.

## Team Members

    👨‍💻 Vaibhav Singh
    👨‍💻 Mayank Jain
    👨‍💻 Prashant Sain
    👨‍💻 Vansh Bindal


### Future Plans

    🔒 Secure Edge Device Manager for remote model deployment and monitoring.

    📱 Mobile App Integration for real-time deepfake alerts.

    🌍 Multi-lingual Platform: Make the platform accessible to non-English speakers.

    🧠 Continuous Model Fine-Tuning via feedback loop.

## Project-Specific Conventions

1. **API Endpoints**:
   - Deepfake Video Detection:
     - `/predict`: Accepts video files for analysis.
     - `/predict_url`: Accepts video URLs for analysis.
   - Text Fake News Detection:
     - `/verify_newstext`: Accepts text for verification.
     - `/verify_Imagearticle`: Accepts text or image files for verification.

2. **Frontend Styling**:
   - CSS files are colocated with their respective components.
   - Use `cursor: pointer;` for interactive elements.

3. **Model Loading**:
   - Deepfake model is loaded from `best_vit_model.pth`.
   - Ensure the model file is present in `Models_Backend/Deepfake_Video/`.

4. **Environment Variables**:
   - Store sensitive keys (e.g., `GROQ_API_KEY`) in a `.env` file.

## Integration Points

- **Frontend to Backend**:
  - The Chrome extension and React frontend communicate with the FastAPI backend via HTTP requests.
- **Backend Models**:
  - The backend APIs use pre-trained models for predictions.
  - Ensure dependencies like `torch`, `timm`, and `easyocr` are installed.

## External Dependencies

- **Python**:
  - `torch`, `timm`, `fastapi`, `uvicorn`, `easyocr`
- **Node.js**:
  - `vite`, `react`, `express`





