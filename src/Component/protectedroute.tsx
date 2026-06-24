import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

// ─── Spinner shown while auth state loads from localStorage ──────────────────
function LoadingScreen() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "#0A0A0B",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: "16px",
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <div style={{
        width: 36, height: 36,
        border: "2px solid rgba(201,169,110,0.2)",
        borderTop: "2px solid #C9A96E",
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <p style={{ color: "rgba(240,237,230,0.3)", fontSize: 12, letterSpacing: "0.15em", textTransform: "uppercase" }}>
        Loading…
      </p>
    </div>
  );
}

// ─── ProtectedRoute ───────────────────────────────────────────────────────────
// Wrap any route that needs login:
//   <Route element={<ProtectedRoute />}>
//     <Route path="/dashboard" element={<Dashboard />} />
//   </Route>
export function ProtectedRoute() {
  const { isLoggedIn, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <LoadingScreen />;

  // Not logged in → send to /auth, remember where they came from
  if (!isLoggedIn) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <Outlet />;
}

// ─── AdminRoute ───────────────────────────────────────────────────────────────
// Wrap admin-only routes:
//   <Route element={<AdminRoute />}>
//     <Route path="/admin" element={<AdminPanel />} />
//   </Route>
export function AdminRoute() {
  const { isLoggedIn, isAdmin, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <LoadingScreen />;

  if (!isLoggedIn) return <Navigate to="/auth" state={{ from: location }} replace />;
  if (!isAdmin)    return <Navigate to="/"     replace />;

  return <Outlet />;
}

// ─── GuestRoute ───────────────────────────────────────────────────────────────
// Wrap routes only guests should see (like /auth):
//   <Route element={<GuestRoute />}>
//     <Route path="/auth" element={<AuthPage />} />
//   </Route>
export function GuestRoute() {
  const { isLoggedIn, isLoading } = useAuth();

  if (isLoading) return <LoadingScreen />;

  // Already logged in → redirect to home page
  if (isLoggedIn) return <Navigate to="/" replace />;

  return <Outlet />;
}