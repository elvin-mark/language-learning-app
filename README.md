# Linguis - AI Powered Language Learning 🇰🇷

Experience a modern way to master Korean with real-time AI feedback, grammar tracking, and flexible LLM support (Cloud or Local).

![Linguis Dashboard](https://raw.githubusercontent.com/elvin-mark/language-learning-app/main/frontend/public/dashboard-preview.png) *(Placeholder for your preview image)*

## ✨ Features

- **Hybrid LLM Support**: Switch between **Groq (Cloud)** for speed or **Local LLMs (Ollama/LM Studio)** for privacy and offline use.
- **Real-time Feedback**: Get instant analysis of your Korean sentences, including grammar corrections and natural alternatives.
- **Smart Library**: Automatically tracks words and grammar patterns encountered during conversations, with built-in **search and pagination**.
- **Token Analytics**: Monitor your AI consumption with beautiful, interactive charts directly on your dashboard.
- **Premium UI**: Dark-mode glassmorphic design built with Next.js, Framer Motion, and Lucide icons.

---

## 🚀 Quick Start (Docker)

The fastest way to run Linguis as a unified service (Frontend + Backend):

1. **Clone the repo**:
   ```bash
   git clone https://github.com/elvin-mark/language-learning-app.git
   cd language-learning-app
   ```
2. **Build the image**:
   ```bash
   docker build -t linguis .
   ```
3. **Run the container**:
   ```bash
   docker run -p 8000:8000 -e GROQ_API_KEY=your_key_here linguis
   ```
4. **Access the app**: Visit `http://localhost:8000`

---

## 🛠️ Development Setup

If you want to run the components separately for development:

### Prerequisites
- Python 3.10+
- Node.js 18+
- Groq API Key (get one at [console.groq.com](https://console.groq.com))

### Backend Setup
1. Navigate to `/` (Root)
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r backend/requirements.txt
   ```
4. Set environment variables:
   ```bash
   export GROQ_API_KEY=your_key_here  # Or create a .env file in the root
   ```
5. Run the server:
   ```bash
   uvicorn backend.main:app --reload --port 8000
   ```

### Frontend Setup
1. Navigate to `frontend/`
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Visit `http://localhost:3000` (It will proxy API calls to port 8000 automatically).

---

## 🏗️ Architecture

- **Frontend**: Next.js 16 (App Router), TypeScript, Framer Motion, Axios.
- **Backend**: FastAPI, SQLModel (SQLAlchemy + Pydantic), LangChain.
- **Database**: SQLite (default), manageable via `language_app.db`.
- **AI**: Optimized for Groq (Llama 3) and Local OpenAI-compatible APIs.
