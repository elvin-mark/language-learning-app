# Linguis - AI Powered Language Learning 🌍✨

Linguis is a high-performance, immersive language learning platform that leverages state-of-the-art AI (Groq, Gemini, or Local LLMs) to provide real-time feedback, dynamic reading practice, and automated progress tracking. 

Built with **Next.js**, **FastAPI**, and **LangChain**, Linguis offers a premium, glassmorphic experience designed for focused study.

---

## ✨ Key Features

### 📖 NEW: AI Reading Room
Sharpen your comprehension with dynamically generated reading passages. 
- **Topic-on-Demand**: Prompt the AI with any topic (e.g., "A walk in Kyoto", "Global news") to get a tailored article.
- **Interactive Quizzes**: Test your understanding with AI-generated MCQs featuring immediate feedback and detailed explanations.
- **Translation Engine**: Toggle between your target language and English instantly.

### 📈 Mastery Tracking & Smart Library
- **Proficiency Scoring**: Vocabulary and grammar points automatically track your "Mastery Level" (0-100%) based on active practice.
- **Smart Sorting**: Prioritize your studies by sorting your library by "Lowest Mastery" to focus on your weakest areas.
- **Automated Logging**: The system extracts and saves key words and patterns from every conversation you have.

### 🎭 Immersive Roleplay Missions
- **10+ Pre-made Scenarios**: Practice in realistic situations like ordering coffee, checking into a hotel, or a business meeting.
- **Objective Tracking**: Real-time monitoring of mission goals; the AI recognizes and rewards your progress.
- **Dedicated Feedback Pane**: A specialized sidebar to view grammatical corrections and natural alternatives without interrupting the flow.

### 💬 Advanced Conversation Hub
- **Editable History**: Keep your workspace organized by renaming chats with custom titles and deleting old sessions.
- **Writing Assistant**: Get three stylistic variations (Formal, Casual, Natural) for any sentence you want to write.
- **Suggesting Engine**: Stuck? Get 4 contextual suggestions for what to say next.

### ⚙️ Hybrid LLM Infrastructure
- **Cloud-Fast**: Integration with **Groq (Llama 3)** and **Gemini** for lightning-fast, high-quality responses.
- **Local-Private**: Full support for **Ollama**, **LM Studio**, or any OpenAI-compatible local API for maximum privacy and offline use.

---

## 🚀 Quick Start (Docker)

The fastest way to run Linguis as a unified service:

1. **Clone & Enter**:
   ```bash
   git clone https://github.com/elvin-mark/language-learning-app.git
   cd language-learning-app
   ```
2. **Setup Keys**: Create a `.env` file in the root with your keys:
   ```env
   GROQ_API_KEY=your_key_here
   GOOGLE_API_KEY=optional_gemini_key
   ```
3. **Build & Run**:
   ```bash
   docker build -t linguis .
   docker run -p 8000:8000 --env-file .env linguis
   ```
4. **Learn**: Visit `http://localhost:8000`

---

## 🛠️ Technical Stack

- **Frontend**: Next.js 14+ (App Router), TypeScript, Framer Motion, Lucide Icons.
- **Backend**: FastAPI, SQLModel (SQLAlchemy + Pydantic), LangChain.
- **Intelligence**: Multi-provider support via LangChain (Groq, Google GenAI, Ollama).
- **Database**: SQLite with automated schema migrations on startup.
- **UI/UX**: Custom glassmorphism design system with responsive layouts and smart language indicators.

---

*Linguis - Master any language, one AI-powered conversation at a time.*
