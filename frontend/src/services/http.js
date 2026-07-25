export const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? "/api" : "http://localhost:5000/api");

export const getToken = () => localStorage.getItem("token");

export const authHeaders = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const readError = async (res, fallback) => {
  try {
    const data = await res.json();
    return data.error || fallback;
  } catch {
    return fallback;
  }
};

export const fetchWithTimeout = async (url, options = {}) => {
  const { timeout = 20000, signal, ...customOptions } = options;

  const controller = new AbortController();
  let timedOut = false;
  const timeoutId = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeout);

  if (signal) {
    if (signal.aborted) {
      clearTimeout(timeoutId);
      throw signal.reason || new DOMException("The user aborted a request.", "AbortError");
    }
    signal.addEventListener("abort", () => {
      clearTimeout(timeoutId);
      controller.abort();
    });
  }

  try {
    const res = await fetch(url, {
      ...customOptions,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.status === 401) {
      // Clear all user related local storage items on unauthorized request
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      localStorage.removeItem("avatar");
      localStorage.removeItem("email");
      localStorage.removeItem("onlineUseCount");
      
      // Prevent infinite redirect loops or redirecting when already at landing/auth pages
      const path = window.location.pathname;
      if (path !== "/login" && path !== "/signup" && path !== "/") {
        window.location.href = "/login?expired=true";
      }
    }

    return res;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === "AbortError") {
      if (timedOut) {
        throw new Error("Request timed out. Please try again.");
      }
      throw error;
    }
    throw error;
  }
};
