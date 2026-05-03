import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { fetchOllamaModels, fetchOllamaStatus } from "../services/ollamaService";

const ChatSettingsContext = createContext(null);

const MODE_STORAGE_KEY = "chatProviderMode";
const MODEL_STORAGE_KEY = "ollamaModel";

export const ChatSettingsProvider = ({ children }) => {
  const [provider, setProviderState] = useState(() => localStorage.getItem(MODE_STORAGE_KEY) || "online");
  const [ollamaModel, setOllamaModelState] = useState(() => localStorage.getItem(MODEL_STORAGE_KEY) || "");
  const [customOllamaModel, setCustomOllamaModel] = useState("");
  const [ollamaModels, setOllamaModels] = useState([]);
  const [ollamaStatus, setOllamaStatus] = useState({ running: false, error: "" });
  const [isOllamaLoading, setIsOllamaLoading] = useState(false);
  const [ollamaError, setOllamaError] = useState("");

  const selectedOllamaModel = customOllamaModel.trim() || ollamaModel;

  const setProvider = useCallback((nextProvider) => {
    setProviderState(nextProvider);
    localStorage.setItem(MODE_STORAGE_KEY, nextProvider);
  }, []);

  const setOllamaModel = useCallback((model) => {
    setOllamaModelState(model);
    localStorage.setItem(MODEL_STORAGE_KEY, model);
  }, []);

  const refreshOllama = useCallback(async () => {
    setIsOllamaLoading(true);
    setOllamaError("");

    try {
      const status = await fetchOllamaStatus();
      setOllamaStatus(status);

      if (!status.running) {
        setOllamaModels([]);
        setOllamaError(status.error || "Please start Ollama locally to use offline mode.");
        return;
      }

      const models = await fetchOllamaModels();
      setOllamaModels(models);

      if (models.length > 0 && !selectedOllamaModel) {
        setOllamaModel(models[0].name);
      }

      if (models.length === 0) {
        setOllamaError("No local Ollama models found. Pull a model to use offline mode.");
      }
    } catch (err) {
      setOllamaStatus({ running: false, error: err.message });
      setOllamaModels([]);
      setOllamaError(err.message);
    } finally {
      setIsOllamaLoading(false);
    }
  }, [selectedOllamaModel, setOllamaModel]);

  useEffect(() => {
    if (provider === "offline") {
      refreshOllama();
    }
  }, [provider, refreshOllama]);

  const value = useMemo(() => ({
    provider,
    setProvider,
    ollamaModel,
    setOllamaModel,
    customOllamaModel,
    setCustomOllamaModel,
    selectedOllamaModel,
    ollamaModels,
    ollamaStatus,
    isOllamaLoading,
    ollamaError,
    refreshOllama,
  }), [
    provider,
    setProvider,
    ollamaModel,
    setOllamaModel,
    customOllamaModel,
    selectedOllamaModel,
    ollamaModels,
    ollamaStatus,
    isOllamaLoading,
    ollamaError,
    refreshOllama,
  ]);

  return (
    <ChatSettingsContext.Provider value={value}>
      {children}
    </ChatSettingsContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useChatSettings = () => {
  const context = useContext(ChatSettingsContext);
  if (!context) {
    throw new Error("useChatSettings must be used inside ChatSettingsProvider");
  }
  return context;
};
