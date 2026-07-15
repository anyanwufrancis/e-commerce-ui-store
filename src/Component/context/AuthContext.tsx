import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export interface User {
  _id:       string;
  name:      string;
  email:     string;
  phone?:    string;
  role:      "user" | "admin";
  avatar?:   string;
  addresses: object[];
}

interface SavedAccount {
  user:  User;
  token: string;
}

interface AuthContextType {
  user:       User | null;
  token:      string | null;
  isLoading:  boolean;
  isLoggedIn: boolean;
  isAdmin:    boolean;
  accounts:   SavedAccount[];
  login:      (token: string, user: User) => void;
  logout:     () => Promise<void>;
  logoutAll:  () => Promise<void>;
  switchAccount: (userId: string) => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const ACCOUNTS_KEY  = "saved_accounts";
const ACTIVE_ID_KEY = "active_user_id";
const AUTH_TOKEN_KEY = "auth_token";
const AUTH_USER_KEY  = "auth_user";

const API_BASE =
  import.meta.env.VITE_API_URL ||
  "https://e-commerce-store-backend-0exy.onrender.com/api";

function isValidUser(value: unknown): value is User {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as any)._id === "string" &&
    typeof (value as any).name === "string" &&
    typeof (value as any).email === "string" &&
    typeof (value as any).role === "string"
  );
}

function readAccounts(): SavedAccount[] {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (a) => isValidUser(a?.user) && typeof a?.token === "string"
    );
  } catch {
    return [];
  }
}

function writeAccounts(accounts: SavedAccount[]) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

// ── Calls the backend to mark a user offline ──────────────────────────────────
async function serverLogout(token: string) {
  try {
    await fetch(`${API_BASE}/auth/logout`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (err) {
    console.error("Logout API call failed:", err);
    // proceed with local logout regardless
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accounts, setAccounts] = useState<SavedAccount[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ── On mount: load saved accounts, migrate legacy keys ────────────────────
  useEffect(() => {
    let loaded = readAccounts();

    const legacyToken   = localStorage.getItem(AUTH_TOKEN_KEY);
    const legacyUserRaw = localStorage.getItem(AUTH_USER_KEY);
    if (legacyToken && legacyUserRaw) {
      try {
        const legacyUser = JSON.parse(legacyUserRaw);
        if (
          isValidUser(legacyUser) &&
          !loaded.some((a) => a.user._id === legacyUser._id)
        ) {
          loaded = [...loaded, { user: legacyUser, token: legacyToken }];
          writeAccounts(loaded);
        }
      } catch { /* ignore corrupted legacy data */ }
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(AUTH_USER_KEY);
    }

    setAccounts(loaded);

    const savedActiveId      = localStorage.getItem(ACTIVE_ID_KEY);
    const activeStillExists  = loaded.some((a) => a.user._id === savedActiveId);

    if (savedActiveId && activeStillExists) {
      setActiveId(savedActiveId);
    } else if (loaded.length > 0) {
      setActiveId(loaded[0].user._id);
      localStorage.setItem(ACTIVE_ID_KEY, loaded[0].user._id);
    }

    setIsLoading(false);
  }, []);

  const active = accounts.find((a) => a.user._id === activeId) ?? null;

  // ── Heartbeat: ping the server every 30s while a user is active ──────────
  // The admin dashboard derives online/offline from `lastSeen`, so this keeps
  // the active user "online". When the tab closes without a logout click,
  // the pings stop and the user ages out as offline after ~60s.
  useEffect(() => {
    if (!active) return;

    let failureCount = 0;

    const sendHeartbeat = async () => {
      try {
        const res = await fetch(`${API_BASE}/auth/heartbeat`, {
          method: "POST",
          headers: { Authorization: `Bearer ${active.token}` },
        });

        if (!res.ok) {
          failureCount += 1;
          if (failureCount <= 3) {
            const body = await res.text().catch(() => "<unreadable>");
            console.error(`Heartbeat failed: ${res.status} ${res.statusText}`, body);
          }
          return;
        }

        failureCount = 0;
      } catch (err) {
        failureCount += 1;
        if (failureCount <= 3) {
          console.error("Heartbeat failed:", err);
        }
      }
    };

    sendHeartbeat(); // fire immediately on login / account switch
    const interval = setInterval(sendHeartbeat, 30_000);
    return () => clearInterval(interval);
  }, [active]);

  // ── Listen for session-expired events from API interceptor ────────────────
  useEffect(() => {
    const handleSessionExpired = () => {
      if (!active) return;
      console.warn("Session expired — logging out");
      // Use the logout function but we need to call it asynchronously
      logout();
    };

    window.addEventListener("auth:session-expired", handleSessionExpired);
    return () => window.removeEventListener("auth:session-expired", handleSessionExpired);
  }, [active]);

  // ── Auth actions ──────────────────────────────────────────────────────────
  function login(newToken: string, newUser: User) {
    const next    = accounts.filter((a) => a.user._id !== newUser._id);
    const updated = [...next, { user: newUser, token: newToken }];
    writeAccounts(updated);
    setAccounts(updated);
    setActiveId(newUser._id);
    localStorage.setItem(ACTIVE_ID_KEY, newUser._id);
  }

  function switchAccount(userId: string) {
    const target = accounts.find((a) => a.user._id === userId);
    if (!target) return;
    setActiveId(userId);
    localStorage.setItem(ACTIVE_ID_KEY, userId);
  }

  // Logs out only the active account; switches to next saved one if available
  async function logout() {
    if (!activeId) return;

    const account = accounts.find((a) => a.user._id === activeId);
    if (account) await serverLogout(account.token);

    const next = accounts.filter((a) => a.user._id !== activeId);
    writeAccounts(next);
    setAccounts(next);

    if (next.length > 0) {
      setActiveId(next[0].user._id);
      localStorage.setItem(ACTIVE_ID_KEY, next[0].user._id);
    } else {
      setActiveId(null);
      localStorage.removeItem(ACTIVE_ID_KEY);
    }
  }

  // Clears every saved account
  async function logoutAll() {
    // Tell the server the active user is offline
    if (active) await serverLogout(active.token);

    setAccounts([]);
    setActiveId(null);
    localStorage.removeItem(ACCOUNTS_KEY);
    localStorage.removeItem(ACTIVE_ID_KEY);
  }

  function updateUser(updated: User) {
    const next = accounts.map((a) =>
      a.user._id === updated._id ? { ...a, user: updated } : a
    );
    writeAccounts(next);
    setAccounts(next);
  }

  return (
    <AuthContext.Provider
      value={{
        user:       active?.user ?? null,
        token:      active?.token ?? null,
        isLoading,
        isLoggedIn: !!active,
        isAdmin:    active?.user?.role === "admin",
        accounts,
        login,
        logout,
        logoutAll,
        switchAccount,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}