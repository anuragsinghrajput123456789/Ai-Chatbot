import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { OfflineModelManager } from "../services/OfflineModelManager";

const ChatSettingsContext = createContext(null);

const MODE_STORAGE_KEY = "chatProviderMode";

export const ChatSettingsProvider = ({ children }) => {
  const [provider, setProviderState] = useState(() => localStorage.getItem(MODE_STORAGE_KEY) || "online");
  const [ollamaModel, setOllamaModelState] = useState(() => OfflineModelManager.getSelectedModel());
  const [customOllamaModel, setCustomOllamaModel] = useState("");
  const [ollamaModels, setOllamaModels] = useState([]);
  const [ollamaStatus, setOllamaStatus] = useState({ running: false, error: "" });
  const [isOllamaLoading, setIsOllamaLoading] = useState(false);
  const [ollamaError, setOllamaError] = useState("");

  // Online model setting
  const [onlineModel, setOnlineModelState] = useState(() => localStorage.getItem("onlineModel") || "gemini-2.5-flash");

  const selectedOllamaModel = customOllamaModel.trim() || ollamaModel;

  const setProvider = useCallback((nextProvider) => {
    setProviderState(nextProvider);
    localStorage.setItem(MODE_STORAGE_KEY, nextProvider);
  }, []);

  const setOllamaModel = useCallback((model) => {
    setOllamaModelState(model);
    OfflineModelManager.setSelectedModel(model);
  }, []);

  const setOnlineModel = useCallback((model) => {
    setOnlineModelState(model);
    localStorage.setItem("onlineModel", model);
  }, []);

  const selectedOllamaModelRef = React.useRef(selectedOllamaModel);
  selectedOllamaModelRef.current = selectedOllamaModel;

  const refreshOllama = useCallback(async () => {
    setIsOllamaLoading(true);
    setOllamaError("");

    try {
      const status = await OfflineModelManager.checkServiceStatus();
      setOllamaStatus(status);

      if (!status.running) {
        setOllamaModels([]);
        setOllamaError(status.error || "Please start Ollama locally to use offline mode.");
        return;
      }

      const models = await OfflineModelManager.listModels();
      setOllamaModels(models);

      const savedModel = OfflineModelManager.getSelectedModel();
      if (savedModel) {
        setOllamaModelState(savedModel);
      } else if (models.length > 0) {
        const defaultModel = models[0].name;
        setOllamaModelState(defaultModel);
        OfflineModelManager.setSelectedModel(defaultModel);
      }

      if (models.length === 0) {
        setOllamaError("No local Ollama models found. Pull a model to use offline mode.");
      }
    } catch (err) {
      setOllamaStatus({ running: false, error: err.message });
      setOllamaModels([]);
      setOllamaError(err.message || "Failed to connect to Ollama");
    } finally {
      setIsOllamaLoading(false);
    }
  }, []);

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
    onlineModel,
    setOnlineModel,
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
    onlineModel,
    setOnlineModel,
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
