# 🚀 Chatterbot Deployment Guide

This guide provides a step-by-step walkthrough for deploying your full-stack AI Chatbot. We will cover the decoupled approach (deploying the **React frontend on Vercel** and the **Express backend on Render**) utilizing their free tiers.

---

## 🧭 Table of Contents
1. [Prerequisites & Code Check](#1-prerequisites--code-check)
2. [Database Setup (MongoDB Atlas)](#2-database-setup-mongodb-atlas)
3. [Deploying the Express Backend (Render)](#3-deploying-the-express-backend-render)
4. [Deploying the React Frontend (Vercel)](#4-deploying-the-react-frontend-vercel)
5. [Connecting the Frontend & Backend (CORS Alignment)](#5-connecting-the-frontend--backend-cors-alignment)
6. [Configuring Offline Mode (Ollama) in Production](#6-configuring-offline-mode-ollama-in-production)

---

## 1. Prerequisites & Code Check

Before you begin, make sure of the following:
* Your code is pushed to a remote repository on **GitHub** (public or private).
* The backend and frontend directories are situated at the root level of your project:
  * [/backend](file:///c:/Users/91836/Downloads/Mern-Ai-Projects/Ai_chatBot_offline_online/backend) (Contains `server.js`, `package.json`, controllers, etc.)
  * [/frontend](file:///c:/Users/91836/Downloads/Mern-Ai-Projects/Ai_chatBot_offline_online/frontend) (Contains Vite config, `index.html`, React app source)

---

## 2. Database Setup (MongoDB Atlas)

To persist chat histories, users, and session states, you need a cloud-hosted MongoDB database:

1. Sign up/log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a **free-tier shared cluster**.
3. Under **Database Access**, create a database user and record the username and password safely.
4. Under **Network Access**, click **Add IP Address** and add **`0.0.0.0/0`** (allows access from all IPs).
   > [!IMPORTANT]
   > Render's free tier outgoing IPs are dynamic and change constantly. Restricting network access to a single IP will cause Render to fail to connect to your database.
5. In the **Database** cluster tab, click **Connect** -> **Drivers**, and copy the connection string. Replace `<username>` and `<password>` with your user credentials.

---

## 3. Deploying the Express Backend (Render)

Render offers free web service hosting with automatic HTTPS and Git integration.

1. Sign up/log in to [Render](https://render.com/) with your GitHub account.
2. In the dashboard, click **New +** -> **Web Service**.
3. Choose **Connect a repository** and import your chatbot repository.
4. Set the following configuration settings:
   * **Name:** `chatterbot-backend`
   * **Language:** `Node`
   * **Branch:** `main` (or the branch you want to build from)
   * **Root Directory:** `backend` *(CRITICAL: This tells Render to run commands inside the `/backend` subfolder)*
   * **Build Command:** `npm install`
   * **Start Command:** `node server.js`
   * **Instance Type:** `Free`
5. Click the **Advanced** button to add the following **Environment Variables**:

| Variable Name | Value | Purpose |
|---|---|---|
| `NODE_ENV` | `production` | Enables production optimizations |
| `PORT` | `10000` | Default listening port |
| `MONGO_URI` | `mongodb+srv://...` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | `your_long_random_jwt_secret_key` | Secret key used to encrypt user tokens |
| `GEMINI_API_KEY` | `AIzaSy...` | Your Google Gemini API key |
| `FRONTEND_URL` | `https://your-chatbot-frontend.vercel.app` | The production URL of your Vercel deployment *(You will update this in Step 5)* |

6. Click **Create Web Service**. 
7. Once the build finishes and shows a green `Live` status, copy the public URL provided by Render (e.g., `https://chatterbot-backend.onrender.com`).

---

## 4. Deploying the React Frontend (Vercel)

Vercel is optimized for building and hosting frontends built with Vite.

1. Sign up/log in to [Vercel](https://vercel.com/) using your GitHub account.
2. Click **Add New** -> **Project**.
3. Import your chatbot repository.
4. In the Project Configuration, adjust the settings:
   * **Framework Preset:** `Vite` (Vercel automatically detects this)
   * **Root Directory:** Click Edit and select **`frontend`** *(CRITICAL: This ensures Vercel runs commands inside the `/frontend` subfolder)*
   * **Build and Output Settings:** Leave default (`npm run build` command and `dist` output folder)
   * **Environment Variables:** Add the following key:
     * **Key:** `VITE_API_URL`
     * **Value:** `https://your-render-backend-url.onrender.com/api` *(Paste the Render service URL you copied in Step 3, ensuring it ends with `/api`)*
5. Click **Deploy**. Vercel will build the React SPA and generate a public URL (e.g., `https://chatterbot-ai.vercel.app`). Copy this URL.

---

## 5. Connecting the Frontend & Backend (CORS Alignment)

Because the frontend and backend are hosted on separate domains, the browser will block cross-origin requests unless the backend explicitly allows your Vercel domain.

1. Go back to your [Render Dashboard](https://dashboard.render.com).
2. Select your `chatterbot-backend` web service and click the **Environment** tab.
3. Edit the `FRONTEND_URL` environment variable.
4. Replace the placeholder value with your actual Vercel deployment URL (e.g., `https://chatterbot-ai.vercel.app`).
   > [!WARNING]
   > Do NOT append a trailing slash `/` at the end of the URL. The CORS configuration in [app.js](file:///c:/Users/91836/Downloads/Mern-Ai-Projects/Ai_chatBot_offline_online/backend/app.js) matches the string exactly.
5. Save changes. Render will automatically redeploy your backend with the new CORS permissions.

---

## 6. Configuring Offline Mode (Ollama) in Production

### The Challenge
When using **Offline Mode**, the backend routes requests to a local Ollama server running on `http://127.0.0.1:11434`. 
Because your backend is deployed in the cloud (Render), it cannot access your computer's local port `11434` directly (localhost on Render refers to the Render host machine itself, which does not run Ollama).

### The Solution: Secure Tunneling
To route offline mode queries from your deployed Render server to your local machine:

1. Download and run [ngrok](https://ngrok.com/) on your local machine.
2. Run the following command in your terminal to create a public tunnel to your local Ollama port:
   ```bash
   ngrok http 11434
   ```
3. Copy the public forwarding URL generated by ngrok (e.g., `https://a1b2-34-56-78-90.ngrok-free.app`).
4. Go to your **Render dashboard** -> **Environment** tab for the backend.
5. Add/Update these environment variables:
   * **Key:** `OLLAMA_BASE_URL`
   * **Value:** `https://a1b2-34-56-78-90.ngrok-free.app` *(Your ngrok forwarding URL)*
   * **Key:** `OLLAMA_TIMEOUT_MS`
   * **Value:** `60000` *(Allows sufficient time for your local machine's GPU to start and generate a response)*
6. Save changes to redeploy. Now, when you trigger offline mode in your deployed application, requests will route through ngrok to your local computer's Ollama models.
