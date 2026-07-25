# 🔍 Project Deep Dive

This document provides a detailed breakdown of Chatterbot's codebase, including key components, styling conventions, deploy configurations, and performance optimizations.

---

## 📂 Codebase File Mapping

### Backend Structure
* **[server.js](file:///c:/Users/91836/Downloads/Mern-Ai-Projects/Ai_chatBot_offline_online/backend/server.js)**: The entry point of the backend application. Handles environment variables, runs the database initialization script, and boots the HTTP server on the configured port.
* **[app.js](file:///c:/Users/91836/Downloads/Mern-Ai-Projects/Ai_chatBot_offline_online/backend/app.js)**: Configures the Express middleware pipeline, sets up rate limiters, compression, Helmet headers, CORS policies, routes static frontend assets for production, and registers global 404 and error-handling utilities.
* **[config/db.js](file:///c:/Users/91836/Downloads/Mern-Ai-Projects/Ai_chatBot_offline_online/backend/config/db.js)**: Implements Mongoose database connectivity with retry logic and connection timeout limits.
* **[middlewares/sanitizeMiddleware.js](file:///c:/Users/91836/Downloads/Mern-Ai-Projects/Ai_chatBot_offline_online/backend/middlewares/sanitizeMiddleware.js)**: Scans request bodies, query strings, and path parameters to strip NoSQL operators, protecting the database against injection attacks.

### Frontend Structure
* **[vite.config.js](file:///c:/Users/91836/Downloads/Mern-Ai-Projects/Ai_chatBot_offline_online/frontend/vite.config.js)**: Configures Vite for building the React application. Defines asset aliases, proxy routes for local development, and manual Rollup code-splitting chunks.
* **[vercel.json](file:///c:/Users/91836/Downloads/Mern-Ai-Projects/Ai_chatBot_offline_online/frontend/vercel.json)**: Configures SPA routing on Vercel by rewriting all incoming request paths to `index.html`, allowing the client-side router to handle navigation.
* **[src/context/ChatSettingsContext.jsx](file:///c:/Users/91836/Downloads/Mern-Ai-Projects/Ai_chatBot_offline_online/frontend/src/context/ChatSettingsContext.jsx)**: Manages global state, including authentication status, active chat configurations, offline mode toggles, and UI themes.
* **[src/components/ChatInterface.jsx](file:///c:/Users/91836/Downloads/Mern-Ai-Projects/Ai_chatBot_offline_online/frontend/src/components/ChatInterface.jsx)**: The primary chat UI component. Manages input states, text formatting, auto-scroll behaviors, and redirects requests to either the local Ollama service or the backend API.
* **[src/components/KittyBot.jsx](file:///c:/Users/91836/Downloads/Mern-Ai-Projects/Ai_chatBot_offline_online/frontend/src/components/KittyBot.jsx)**: An interactive robot mascot animated with Framer Motion, displaying visual states based on connection status (online, offline, loading).
* **[src/services/ollamaService.js](file:///c:/Users/91836/Downloads/Mern-Ai-Projects/Ai_chatBot_offline_online/frontend/src/services/ollamaService.js)**: A lightweight API client that manages model discovery and text generation by communicating directly with the local Ollama endpoint (`http://localhost:11434`).

---

## 🎨 CSS Variables & Dark Theme

Chatterbot's UI uses a glassmorphic design system configured in [index.css](file:///c:/Users/91836/Downloads/Mern-Ai-Projects/Ai_chatBot_offline_online/frontend/src/index.css). Key visual variables include:

```css
:root {
  /* Core Theme Tokens */
  --bg-gradient-start: #0f0c1b;
  --bg-gradient-end: #05020a;
  --glass-bg: rgba(15, 12, 27, 0.45);
  --glass-border: rgba(147, 51, 234, 0.15);
  --text-primary: #f3f4f6;
  --text-secondary: #9ca3af;
  --accent-purple: #a855f7;
  --accent-glow: rgba(168, 85, 247, 0.4);
}
```

* **Glassmorphic Cards**: Implemented using backdrop filters (`backdrop-filter: blur(16px)`) combined with borders (`border: 1px solid var(--glass-border)`).
* **Cinematic Dark Theme**: Utilizes a deep purple/indigo color palette with glowing borders (`box-shadow: 0 0 20px var(--accent-glow)`) on interactive components.

---

## 🏎️ Performance Tuning & Optimizations

### 1. GPU Scroll Acceleration
To maintain a consistent 60fps scrolling rate in long chat histories, container elements include the `will-change: transform` property. This offloads layout rendering from the CPU to the GPU, preventing jitter when loading syntax-highlighted code blocks.
```css
.chat-scroll-container {
  will-change: transform;
  overflow-y: auto;
  scroll-behavior: smooth;
}
```

### 2. Manual Rollup Chunking
To optimize page load times, Vite is configured with manual Rollup chunking. This splits large external libraries into dedicated files, improving browser caching efficiency:
```javascript
// vite.config.js
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          markdown: ['react-markdown', 'remark-gfm'],
          highlight: ['react-syntax-highlighter'],
        }
      }
    }
  }
});
```

### 3. AbortSignals for Network Requests
All API requests (both client-side calls to Ollama and server-side fallbacks to Gemini) implement timeout guards using `AbortSignal`. Client-side calls to `localhost:11434` time out after 5 seconds to prevent the UI from hanging if the local model is offline. Server-side cloud calls time out after 15 seconds.
