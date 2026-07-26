# Operations & Deployment Guide — Chatterbot AI Workspace

This guide outlines setup, deployment, operations, and troubleshooting protocols for **Chatterbot**, a hybrid Online/Offline AI Workspace.

---

## 1. Architecture Topology

```
             ONLINE MODE
             
+------------------------------------------+
|          Vercel Static Frontend          |
+------------------------------------------+
                    | (HTTPS REST / SSE)
                    v
+------------------------------------------+
|      Node / Express REST API Proxy       |
+------------------------------------------+
        |                 |               |
        v                 v               v
+--------------+   +-------------+   +-----------+
| MongoDB Atlas|   |  Gemini AI  |   |OpenRouter |
+--------------+   +-------------+   +-----------+
  (Data Store)     (Primary LLM)     (Fallback)
  

             OFFLINE MODE
             
+------------------------------------------+
|          Vercel Static Frontend          |
+------------------------------------------+
                    | (Direct Client CORS fetch to Localhost)
                    v
+------------------------------------------+
|     Ollama Daemon (localhost:11434)      |
+------------------------------------------+
                    | (Local CPU/GPU RAM)
                    v
+------------------------------------------+
|          Local LLM Model weights         |
+------------------------------------------+
```

---

## 2. Environment Variables Specification

### A. Frontend Environment Variables
Saved inside `frontend/.env.production` or `frontend/.env.local`:
- **`VITE_API_URL`**: Base URL pointing to the deployed backend server API endpoints (e.g. `https://chatterbot-backend.onrender.com/api`). Defaults to `/api` in monolith mode.

### B. Backend Environment Variables
Saved inside `backend/.env`:
- **`MONGO_URI`** *(Mandatory)*: MongoDB Connection URI string (Atlas cluster or local service).
- **`JWT_SECRET`** *(Mandatory)*: Strong random alphanumeric string used to sign and verify JSON Web Tokens (7d expiration).
- **`PORT`** *(Optional)*: Server listening port. Defaults to `5000`.
- **`NODE_ENV`** *(Optional)*: Set to `production` in live environments to activate static routing and compress logs.
- **`GEMINI_API_KEY`** *(Optional)*: Google Gemini API developer key. Required to run native online models and vector grounding.
- **`OPENROUTER_API_KEY`** *(Optional)*: OpenRouter authentication token. Required for OpenRouter endpoint routing.
- **`OPENROUTER_MODEL`** *(Optional)*: Default model fallback on OpenRouter. Defaults to `google/gemini-2.0-flash`.
- **`FRONTEND_URL`** *(Optional)*: Permitted origin for CORS configuration. If split-domain is used, set this to Vercel's URL.

---

## 3. Local Development Guide

### Prerequisite: Local Ollama Setup
1. Download and install [Ollama](https://ollama.com).
2. Configure Ollama to allow browser origins by setting the environment variable `OLLAMA_ORIGINS=*` on your host machine.
3. Start the Ollama application.
4. Pull a local model:
   ```bash
   ollama pull deepseek-r1:8b
   ```

### Execution Steps
1. Clone the repository and install all dependencies:
   ```bash
   npm run install-all
   ```
2. Set up local configurations:
   - Copy `backend/.env.example` to `backend/.env` and fill in local MongoDB URI and keys.
   - Copy `frontend/.env.example` to `frontend/.env.local`.
3. Boot the environment concurrently:
   ```bash
   npm run dev
   ```
   Access the frontend at `http://localhost:5173`.

---

## 4. Production Deployment Guide

### Option A: Unified Monolith Deployment (Render Blueprint)
1. Log in to [Render](https://render.com).
2. Click **New** -> **Blueprint**.
3. Link your repository. Render will automatically parse the `render.yaml` specification.
4. Set your `MONGO_URI` and API keys inside the blueprint prompts.
5. Deploy. Render will build the frontend statically, copy it to the backend folder, and serve it via port `10000`.

### Option B: Split-Domain Deployment (Vercel + Render)

#### Part 1: Vercel Frontend Deployment
1. Log in to [Vercel](https://vercel.com) and click **Add New Project**.
2. Connect your Git repository.
3. In the project settings, set:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
4. Set the Environment Variable:
   - `VITE_API_URL` = `https://your-backend-url.onrender.com/api`
5. Click **Deploy**.

#### Part 2: Render Backend Deployment
1. Click **New** -> **Web Service** on Render.
2. Select **Build and deploy from Git repository**.
3. Set the following build options:
   - **Runtime**: `Node`
   - **Build Command**: `npm install --prefix backend`
   - **Start Command**: `npm start --prefix backend`
4. Add environment variables:
   - `NODE_ENV` = `production`
   - `MONGO_URI` = `mongodb+srv://...`
   - `JWT_SECRET` = `your-secure-secret`
   - `FRONTEND_URL` = `https://your-frontend-vercel-domain.vercel.app`
5. Deploy the service.

---

## 5. Operations & Health Monitoring

### Health Endpoint Checkers
- **Liveness Checker**: `GET /health/live`
  - Returns `200 OK` as long as the Express service is up.
  - Used for orchestrator container liveness probes.
- **Readiness Checker**: `GET /health/ready`
  - Returns `200 OK` if the MongoDB connection is alive.
  - Returns `503 Service Unavailable` if database is disconnected.
  - Used for routing and rolling updates.

### Logs
- Request logging includes unique tracing headers `x-request-id` to correlate client actions to server outputs.
- Execution latencies are printed automatically to `stdout` in milliseconds.

---

## 6. Troubleshooting & Failovers

### A. Ollama Status "Offline" / Mixed Content Blocks
- **Error**: "Cannot connect to Ollama. Ensure Ollama is running."
- **Remediation**:
  - Open terminal and verify Ollama is active: `curl http://localhost:11434/`
  - If using HTTPS on Vercel, modern browsers permit `http://localhost` exceptions, but you must ensure `OLLAMA_ORIGINS=*` is set in your terminal session or host daemon configurations.
  - **Windows configuration**: Close Ollama from taskbar. Open PowerShell and run:
    ```powershell
    [System.Environment]::SetEnvironmentVariable('OLLAMA_ORIGINS', '*', 'User')
    ```
    Restart Ollama.

### B. MongoDB Unavailable
- **Indicator**: `/health/ready` responds with `503 Degraded`.
- **Mitigation**: Verify MongoDB Atlas network access rules. Add `0.0.0.0/0` IP whitelist or target host server IPs in the Mongo Atlas console.

### C. Gemini/OpenRouter API Failover
- If Google Gemini API key is missing or fails with rate limit errors (HTTP 429), the server automatically falls back to OpenRouter API configurations. If both fail, it returns an explicit `503 Service Unavailable` error containing citation logs, keeping the chat session stable.
