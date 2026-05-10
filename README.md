<div align="center">

<img src="./frontend/public/bot-logo.png" alt="Chatterbot Logo" width="100" height="100" />

# 🤖 Chatterbot — AI Assistant

**A production-ready, full-stack AI Chatbot powered by Google Gemini & Ollama**

[![MIT License](https://img.shields.io/badge/License-MIT-purple.svg)](https://choosealicense.com/licenses/mit/)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green?logo=node.js)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb)](https://www.mongodb.com/)
[![Express](https://img.shields.io/badge/Express-5.x-black?logo=express)](https://expressjs.com/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?logo=vite)](https://vitejs.dev/)
[![Gemini](https://img.shields.io/badge/Gemini-1.5-blue?logo=google)](https://ai.google.dev/)

[🌐 Live Demo](#) · [🐛 Report Bug](https://github.com/anuragsinghrajput123456789/Ai-Chatbot/issues) · [✨ Request Feature](https://github.com/anuragsinghrajput123456789/Ai-Chatbot/issues)

</div>

---

## 📸 App Screenshots

<table>
  <tr>
    <td align="center" width="33%">
      <img src="./screenshots/home.png" alt="Home Page - Hero Section" width="100%"/>
      <br/><br/>
      <strong>🏠 Home — Hero Section</strong><br/>
      <em>Modern landing with animated AI robot, mode switcher, and prompt preview</em>
    </td>
    <td align="center" width="33%">
      <img src="./screenshots/about.png" alt="About Page - Mission" width="100%"/>
      <br/><br/>
      <strong>ℹ️ About — Mission Page</strong><br/>
      <em>Mission statement, live stats (Gemini 1.5, 10k+ Users, 24/7, 100% Privacy)</em>
    </td>
    <td align="center" width="33%">
      <img src="./screenshots/chat.png" alt="Chat Interface - Online Mode" width="100%"/>
      <br/><br/>
      <strong>💬 Chat — Interface</strong><br/>
      <em>4 specialized AI modes: Friendly Chat, Code Expert, Study Buddy, Creative Muse</em>
    </td>
  </tr>
  <tr>
    <td align="center" colspan="1">
      <img src="./screenshots/chat.png" alt="Online Mode - Gemini AI" width="100%"/>
      <br/><br/>
      <strong>🌐 Online Mode — Gemini AI</strong><br/>
      <em>Cloud-powered responses with persistent chat history</em>
    </td>
    <td align="center" colspan="1">
      <img src="./screenshots/offline.png" alt="Offline Mode - Ollama" width="100%"/>
      <br/><br/>
      <strong>🔌 Offline Mode — Ollama</strong><br/>
      <em>100% local AI — no internet, no data shared</em>
    </td>
    <td align="center" colspan="1">
      <img src="./screenshots/modes.png" alt="Chat Mode Selection" width="100%"/>
      <br/><br/>
      <strong>🤖 Chat Mode Selection</strong><br/>
      <em>Pick from Friendly Chat, Code Expert, Study Buddy, or Creative Muse</em>
    </td>
  </tr>
</table>

---

## 🧭 Table of Contents

- [✨ Features](#-features)
- [⚙️ Tech Stack](#️-tech-stack)
- [📁 Folder Structure](#-folder-structure)
- [🚀 Getting Started](#-getting-started)
- [🌐 Online Mode — Google Gemini](#-online-mode--google-gemini)
- [🔌 Offline Mode — Ollama](#-offline-mode--ollama)
- [🤖 AI Chat Modes](#-ai-chat-modes)
- [🔐 API Routes](#-api-routes)
- [🛡️ Security Features](#️-security-features)
- [🌍 Environment Variables](#-environment-variables)
- [📦 Deployment](#-deployment)
- [🤝 Contributing](#-contributing)

---

## ✨ Features

<table>
  <tr>
    <td>🌐</td>
    <td><strong>Online Mode (Gemini 1.5)</strong></td>
    <td>Connect to Google's Gemini API for blazing-fast, cloud-powered AI responses</td>
  </tr>
  <tr>
    <td>🔌</td>
    <td><strong>Offline Mode (Ollama)</strong></td>
    <td>Run completely locally using Ollama — zero internet, zero data sharing</td>
  </tr>
  <tr>
    <td>🤖</td>
    <td><strong>4 Specialized AI Modes</strong></td>
    <td>Friendly Chat, Code Expert, Study Buddy, Creative Muse — each with tuned prompts</td>
  </tr>
  <tr>
    <td>🔐</td>
    <td><strong>JWT Auth System</strong></td>
    <td>Secure login & signup with bcrypt password hashing and JWT token sessions</td>
  </tr>
  <tr>
    <td>💾</td>
    <td><strong>Persistent Chat History</strong></td>
    <td>All signed-in conversations saved to MongoDB Atlas per user</td>
  </tr>
  <tr>
    <td>✍️</td>
    <td><strong>Markdown Rendering</strong></td>
    <td>AI responses render with full Markdown + syntax-highlighted code blocks</td>
  </tr>
  <tr>
    <td>⚡</td>
    <td><strong>Professional Prompt Examples</strong></td>
    <td>Pre-filled prompt suggestions per mode to onboard users instantly</td>
  </tr>
  <tr>
    <td>🌗</td>
    <td><strong>Light / Dark Theme</strong></td>
    <td>Toggle between dark glassmorphic and light modes seamlessly</td>
  </tr>
  <tr>
    <td>🛡️</td>
    <td><strong>Production Security</strong></td>
    <td>Helmet headers, rate limiting, MongoDB sanitization, CORS policies</td>
  </tr>
  <tr>
    <td>📱</td>
    <td><strong>Fully Responsive</strong></td>
    <td>Works flawlessly across mobile, tablet, and desktop</td>
  </tr>
  <tr>
    <td>🔑</td>
    <td><strong>Private API Keys</strong></td>
    <td>Users can optionally bring their own Gemini API key for personal use</td>
  </tr>
  <tr>
    <td>🎨</td>
    <td><strong>Premium UI / Glassmorphism</strong></td>
    <td>Framer Motion animations, Tailwind CSS, vibrant purple-pink gradients</td>
  </tr>
</table>

---

## ⚙️ Tech Stack

### 🖥️ Frontend

| Technology | Version | Purpose |
|---|---|---|
| **React** | 19.x | UI Framework |
| **Vite** | 6.x | Build Tool & Dev Server |
| **React Router DOM** | 7.x | Client-side Routing |
| **Framer Motion** | 12.x | Animations & Transitions |
| **Tailwind CSS** | 4.x | Utility-first Styling |
| **React Markdown** | 10.x | Markdown Rendering |
| **React Syntax Highlighter** | 16.x | Code Block Highlighting |
| **Lucide React** | Latest | Icon Library |
| **React Icons** | 5.x | Extended Icon Set |

### 🔧 Backend

| Technology | Version | Purpose |
|---|---|---|
| **Node.js** | 18+ | Runtime Environment |
| **Express** | 5.x | REST API Framework |
| **MongoDB** | Atlas | Database |
| **Mongoose** | 9.x | MongoDB ODM |
| **JWT** | 9.x | Authentication Tokens |
| **Bcryptjs** | 3.x | Password Hashing |
| **@google/genai** | 1.x | Gemini AI SDK |
| **Helmet** | 8.x | HTTP Security Headers |
| **express-rate-limit** | 8.x | API Rate Limiting |
| **express-mongo-sanitize** | 2.x | NoSQL Injection Prevention |
| **Nodemon** | 3.x | Dev Auto-restart |

---

## 📁 Folder Structure

```
Ai_chatbot/
│
├── 📂 backend/                        # Express REST API
│   ├── 📂 config/
│   │   └── db.js                      # MongoDB connection
│   │
│   ├── 📂 controllers/
│   │   ├── authController.js          # Login, signup, token logic
│   │   ├── chatController.js          # Gemini AI chat handler
│   │   └── ollamaController.js        # Ollama local AI handler
│   │
│   ├── 📂 middlewares/
│   │   ├── authMiddleware.js          # JWT verification guard
│   │   ├── errorMiddleware.js         # Global error handler
│   │   ├── notFoundMiddleware.js      # 404 handler
│   │   └── sanitizeMiddleware.js      # Input sanitization
│   │
│   ├── 📂 models/
│   │   ├── User.js                    # User schema (name, email, password)
│   │   └── Chat.js                    # Chat history schema
│   │
│   ├── 📂 routes/
│   │   ├── auth.js                    # /api/auth/* routes
│   │   ├── chat.js                    # /api/chat/* routes
│   │   └── ollama.js                  # /api/ollama/* routes
│   │
│   ├── 📂 services/
│   │   ├── geminiService.js           # Google Gemini API integration
│   │   └── ollamaService.js           # Ollama local LLM integration
│   │
│   ├── app.js                         # Express app configuration
│   ├── server.js                      # Server entry point
│   └── package.json
│
├── 📂 frontend/                        # React + Vite SPA
│   ├── 📂 public/
│   │   └── bot-logo.png               # Custom chatbot brand logo
│   │
│   ├── 📂 src/
│   │   ├── 📂 components/
│   │   │   ├── Auth.jsx               # Login / Signup modal
│   │   │   ├── ChatInterface.jsx      # Core chat UI with modes
│   │   │   ├── ErrorBoundary.jsx      # React error boundary
│   │   │   ├── Footer.jsx             # Site footer
│   │   │   ├── KittyBot.jsx           # Animated robot mascot
│   │   │   ├── LandingPage.jsx        # Hero section component
│   │   │   ├── Layout.jsx             # Page layout wrapper
│   │   │   └── Navbar.jsx             # Top navigation bar
│   │   │
│   │   ├── 📂 context/
│   │   │   └── ChatSettingsContext.jsx # Global chat settings state
│   │   │
│   │   ├── 📂 pages/
│   │   │   ├── About.jsx              # About / Mission page
│   │   │   └── AuthPage.jsx           # Full auth page wrapper
│   │   │
│   │   ├── 📂 services/
│   │   │   └── (API service utilities)
│   │   │
│   │   ├── App.jsx                    # Root component + routing
│   │   ├── api.js                     # Axios API instance
│   │   ├── constants.js               # App-wide constants
│   │   ├── index.css                  # Global styles + CSS vars
│   │   └── main.jsx                   # React DOM entry point
│   │
│   ├── index.html                     # HTML entry point
│   ├── vite.config.js                 # Vite configuration
│   ├── vercel.json                    # Vercel deployment config
│   └── package.json
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- **Node.js** `v18+` — [Download](https://nodejs.org/)
- **MongoDB** — Use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (free tier)
- **Git** — [Download](https://git-scm.com/)
- *(Optional)* **Ollama** — for offline mode — [Download](https://ollama.com/)

### 1. Clone the Repository

```bash
git clone https://github.com/anuragsinghrajput123456789/Ai-Chatbot.git
cd Ai-Chatbot
```

### 2. Setup the Backend

```bash
cd backend
npm install
```

Create a `.env` file inside `backend/`:

```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/chatbot
JWT_SECRET=your_super_secret_jwt_key
GEMINI_API_KEY=your_google_gemini_api_key
NODE_ENV=development
```

Start the backend dev server:

```bash
npm run dev        # with nodemon (recommended for development)
# or
npm start          # production start
```

> The backend will run on `http://localhost:5000`

### 3. Setup the Frontend

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

> The frontend will run on `http://localhost:5173`

---

## 🌐 Online Mode — Google Gemini

Chatterbot connects to **Google Gemini 1.5** for powerful cloud-based AI responses.

**Setup:**
1. Get a free API key from [Google AI Studio](https://aistudio.google.com/)
2. Add it to your `backend/.env` as `GEMINI_API_KEY`
3. Select **Online Mode** in the Navbar toggle
4. Sign in and start chatting instantly ✅

**Features in Online Mode:**
- Persistent chat history saved to MongoDB
- Full access to all 4 AI personality modes
- Smart, context-aware multi-turn conversations
- Responses rendered with full Markdown & syntax highlighting

---

## 🔌 Offline Mode — Ollama

Run AI **100% locally** on your machine — no internet required, no data sent anywhere.

**Setup:**

```bash
# 1. Install Ollama
# Download from https://ollama.com and install

# 2. Pull a model (e.g., Llama 3)
ollama pull llama3

# 3. Start Ollama server
ollama serve
# Runs on http://localhost:11434
```

4. Select **Offline Mode** in the Navbar toggle
5. Start chatting privately, on-device ✅

**Features in Offline Mode:**
- Completely air-gapped — no external API calls
- Supports any Ollama-compatible model (Llama3, Mistral, Phi-3, etc.)
- Ideal for private/sensitive use cases
- Works without a MongoDB connection

---

## 🤖 AI Chat Modes

Chatterbot offers **4 specialized AI personas**, each with custom system prompts:

| Mode | Icon | Description | Example Prompts |
|---|---|---|---|
| 🗨️ **Friendly Chat** | 💬 | Your casual AI companion — warm, fun, and helpful for everyday questions | *"Help me write a professional email"* |
| 👨‍💻 **Code Expert** | `</>` | Senior developer AI — explains code, debugs, and teaches best practices | *"Explain JavaScript promises simply"* |
| 📚 **Study Buddy** | 📖 | Adaptive tutor — breaks down complex concepts, quizzes you, and reinforces learning | *"Teach me how React hooks work"* |
| 🎨 **Creative Muse** | ✨ | Your creative partner — brainstorms ideas, writes stories, and sparks imagination | *"Give me 5 creative project ideas"* |

---

## 🔐 API Routes

### Auth Routes — `/api/auth`

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new user | ❌ |
| `POST` | `/api/auth/login` | Login & receive JWT | ❌ |
| `GET` | `/api/auth/me` | Get logged-in user profile | ✅ |

### Chat Routes — `/api/chat`

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/chat/send` | Send message to Gemini AI | ✅ |
| `GET` | `/api/chat/history` | Fetch chat history | ✅ |
| `DELETE` | `/api/chat/clear` | Clear all chat history | ✅ |

### Ollama Routes — `/api/ollama`

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/ollama/chat` | Send message to local Ollama model | ❌ |

---

## 🛡️ Security Features

Chatterbot is built with **production-grade security** from the ground up:

```
✅ Helmet.js           — Secure HTTP headers (XSS, clickjacking protection)
✅ Rate Limiting       — Max 100 requests per 15 min per IP (express-rate-limit)
✅ Mongo Sanitization  — Prevents NoSQL injection attacks
✅ Input Sanitization  — Custom middleware strips dangerous input
✅ JWT Auth            — Stateless, expiring token-based sessions
✅ Bcrypt Hashing      — Passwords hashed with salt rounds
✅ CORS Policy         — Strict origin allowlist for cross-origin requests
✅ Error Handling      — Global error handler, no sensitive stack traces in prod
```

---

## 🌍 Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|---|---|---|
| `PORT` | ✅ | Server port (default: `5000`) |
| `MONGO_URI` | ✅ | MongoDB connection string |
| `JWT_SECRET` | ✅ | Secret key for JWT signing |
| `GEMINI_API_KEY` | ✅ | Google Gemini AI API key |
| `NODE_ENV` | ✅ | `development` or `production` |

---

## 📦 Deployment

### Frontend — Vercel

```bash
cd frontend
npm run build
# Deploy via Vercel CLI or connect GitHub repo to vercel.com
```

A `vercel.json` is included for SPA routing support.

### Backend — Render / Railway

```bash
# Set environment variables in your hosting dashboard
# Set start command to:
node server.js
```

> **Note:** In production, the backend serves the frontend's `dist/` folder as a static SPA from a single origin.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! 🎉

```bash
# 1. Fork the repo
# 2. Create your feature branch
git checkout -b feature/amazing-feature

# 3. Commit your changes
git commit -m "feat: add amazing feature"

# 4. Push to the branch
git push origin feature/amazing-feature

# 5. Open a Pull Request
```

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

<div align="center">

**Built with ❤️ by [Anurag Singh Rajput](https://github.com/anuragsinghrajput123456789)**

⭐ **Star this repo** if you found it helpful!

[![GitHub stars](https://img.shields.io/github/stars/anuragsinghrajput123456789/Ai-Chatbot?style=social)](https://github.com/anuragsinghrajput123456789/Ai-Chatbot/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/anuragsinghrajput123456789/Ai-Chatbot?style=social)](https://github.com/anuragsinghrajput123456789/Ai-Chatbot/network/members)

</div>
