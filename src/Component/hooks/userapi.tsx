import { useCallback } from "react";
import { useAuth } from "../context/AuthContext";

const API_BASE =
  import.meta.env.VITE_API_URL ||
  "https://e-commerce-store-backend-0exy.onrender.com/api";
interface RequestOptions {
  method?:  "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  body?:    object;
}

// ─── useApi ───────────────────────────────────────────────────────────────────
// Provides an authenticated `request` function that automatically
// attaches the JWT token from AuthContext to every request.
//
// Usage:
//   const { request } = useApi();
//   const data = await request("/products");
//   const order = await request("/orders", { method: "POST", body: { ... } });
export function useApi() {
  const { token, logout } = useAuth();

  const request = useCallback(async (path: string, options: RequestOptions = {}) => {
    const { method = "GET", body } = options;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    // Token expired or invalid → force logout
    if (res.status === 401) {
      logout();
      throw new Error("Session expired. Please log in again.");
    }

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Request failed");

    return data;
  }, [token, logout]);

  return { request };
}