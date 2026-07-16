import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("react-router-dom") || id.includes("react-router") || id.includes("@remix-run")) {
              return "react-router";
            }
            if (id.includes("framer-motion")) {
              return "framer-motion";
            }
            if (id.includes("react-markdown") || id.includes("remark-gfm") || id.includes("unist-") || id.includes("mdast-") || id.includes("micromark") || id.includes("decode-uri-component")) {
              return "markdown";
            }
            if (id.includes("react-syntax-highlighter") || id.includes("prismjs")) {
              return "syntax-highlighter";
            }
            if (id.includes("lucide-react") || id.includes("react-icons")) {
              return "icons";
            }
            return "vendor";
          }
        },
      },
    },
    chunkSizeWarningLimit: 800,
  },
});

