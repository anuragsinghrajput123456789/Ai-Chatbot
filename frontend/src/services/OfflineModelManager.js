/**
 * OfflineModelManager (Frontend)
 * 
 * Responsible for local model state management, service detection,
 * model tags retrieval, selection persistence, and verification.
 */

const OLLAMA_BASE_URL = "http://localhost:11434";
const MODEL_STORAGE_KEY = "ollamaModel";

const getTimeoutSignal = (ms) => {
  if (typeof AbortSignal.timeout === "function") {
    return AbortSignal.timeout(ms);
  }
  const controller = new AbortController();
  setTimeout(() => controller.abort(), ms);
  return controller.signal;
};

export const OfflineModelManager = {
  /**
   * Checks whether the local Ollama service is running.
   * Sends a fast ping to http://localhost:11434/.
   */
  async checkServiceStatus() {
    try {
      const res = await fetch(`${OLLAMA_BASE_URL}/`, {
        method: "GET",
        signal: getTimeoutSignal(2000),
      });
      if (res.ok || res.status === 200) {
        const text = await res.text();
        if (text.toLowerCase().includes("ollama")) {
          return { running: true, error: "" };
        }
      }
      return { running: false, error: "Ollama is responding but returned an invalid response." };
    } catch (err) {
      return { 
        running: false, 
        error: "Ollama is not running. Please install and start Ollama on your computer." 
      };
    }
  },

  /**
   * Fetches the list of locally pulled/installed models from GET /api/tags.
   */
  async listModels() {
    try {
      const res = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
        method: "GET",
        signal: getTimeoutSignal(3000),
      });

      if (!res.ok) {
        throw new Error("Failed to retrieve local models list.");
      }

      const data = await res.json();
      return data.models || [];
    } catch (err) {
      if (err instanceof TypeError || err.message?.includes("fetch")) {
        throw new Error("Cannot connect to Ollama. Ensure Ollama is running.");
      }
      throw err;
    }
  },

  /**
   * Persists the selected local model name in localStorage.
   */
  setSelectedModel(modelName) {
    if (modelName) {
      localStorage.setItem(MODEL_STORAGE_KEY, modelName);
    } else {
      localStorage.removeItem(MODEL_STORAGE_KEY);
    }
  },

  /**
   * Retrieves the selected local model name from localStorage.
   */
  getSelectedModel() {
    return localStorage.getItem(MODEL_STORAGE_KEY) || "";
  },

  /**
   * Verifies if the specified model is still present in Ollama's local registry.
   */
  async verifyModelAvailability(modelName) {
    if (!modelName) {
      return { available: false, error: "No model selected." };
    }
    try {
      const models = await this.listModels();
      // Exact match or prefix match (ignoring tag)
      const found = models.some(
        (m) => m.name === modelName || m.name.split(":")[0] === modelName
      );
      if (found) {
        return { available: true, error: "" };
      }
      return { 
        available: false, 
        error: `Model "${modelName}" is not pulled. Please pull it using the CLI.` 
      };
    } catch (err) {
      return { 
        available: false, 
        error: "Cannot connect to local Ollama server to verify model availability." 
      };
    }
  },

  /**
   * Provides helpful context/actions when models are missing.
   */
  handleMissingModel(modelName) {
    return {
      message: `Model "${modelName}" was not found.`,
      solution: `Please open your terminal and run: ollama pull ${modelName}`,
    };
  },

  /**
   * Provides resolution steps when a model returns corruption/load errors.
   */
  handleCorruptedModel(modelName) {
    return {
      message: `Model "${modelName}" failed to load or run.`,
      solution: `The model files might be corrupted or incompatible with your GPU/CPU RAM. Try re-pulling it: ollama pull ${modelName}`,
    };
  }
};
