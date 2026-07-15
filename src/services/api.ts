import axios from "axios";

const API = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    "https://e-commerce-store-backend-0exy.onrender.com/api",
});

// ── Reads the active account's token the same way AuthContext stores it ──────
// AuthContext keeps accounts in localStorage under "saved_accounts" (an array
// of { user, token }) and tracks which one is active via "active_user_id".
// There is no separate "token" key — that mismatch was the original bug.
function getActiveToken(): string | null {
  try {
    const accounts = JSON.parse(localStorage.getItem("saved_accounts") || "[]");
    const activeId = localStorage.getItem("active_user_id");
    const active = accounts.find((a: any) => a.user?._id === activeId);
    return active?.token ?? null;
  } catch {
    return null;
  }
}

API.interceptors.request.use((req) => {
  const token = getActiveToken();

  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }

  return req;
});

// ── Global 401 response handler: force logout on session expiry ──────────────
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Dispatch a custom event so any component can listen and react
      window.dispatchEvent(new CustomEvent("auth:session-expired"));
    }
    return Promise.reject(error);
  }
);

export default API;