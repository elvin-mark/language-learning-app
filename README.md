# Linguis - AI Language Learning App

## Prerequisites
- Python 3.10+
- Node.js 18+
- Groq API Key (get one at [console.groq.com](https://console.groq.com))

## Backend Setup
1. Navigate to `backend/`
2. Create a virtual environment: `python -m venv venv`
3. Activate: `source venv/bin/activate`
4. Install deps: `pip install -r requirements.txt` (or manually install the ones listed in the prompt)
5. Create `.env` and add: `GROQ_API_KEY=your_key_here`
6. Run: `uvicorn main:app --reload`

## Frontend Setup
1. Navigate to `frontend/`
2. Install deps: `npm install`
3. Run: `npm run dev`

## Features
- **AI Chat**: Natural Korean conversation.
- **Real-time Feedback**: Detailed analysis of your Korean sentences.
- **Automatic Tracking**: Words and grammar used in conversation are saved for review.
- **Dashboard**: Track your progress over time.
