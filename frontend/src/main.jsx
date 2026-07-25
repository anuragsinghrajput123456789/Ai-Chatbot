import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Auto-recovery for Vite dynamic import preload/chunk errors
window.addEventListener("vite:preloadError", (event) => {
  event.preventDefault();
  console.warn("Vite preload error detected. Reloading page to fetch latest version...");
  const lastReload = sessionStorage.getItem("last-preload-error-reload");
  const now = Date.now();
  if (!lastReload || now - parseInt(lastReload, 10) > 10000) {
    sessionStorage.setItem("last-preload-error-reload", now.toString());
    window.location.reload();
  }
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
