import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";

import { AuthProvider, useAuth } from "./Component/context/AuthContext";

import Layout         from "./pages/layout";
import Homepage       from "./pages/Homepage";
import AuthPage       from "./pages/auth";
import Products       from "./Component/Product";
import Cart           from "./Component/Cart";
import About          from "./pages/About";
import Checkout       from "./pages/checkout";
import AdminDashboard from "./pages/AdminDashboard";
import Users          from "./pages/Users";

// ── ProtectedRoute: must be logged in ────────────────────────
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, isLoading } = useAuth();
  if (isLoading) return null; // or a spinner, while context restores from storage
  if (!isLoggedIn) return <Navigate to="/auth" replace />;
  return <>{children}</>;
}

// ── AdminRoute: must be logged in AND role === "admin" ────────
function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, isAdmin, isLoading } = useAuth();
  if (isLoading) return null;
  if (!isLoggedIn) return <Navigate to="/auth" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function App() {
  return (
    <ChakraProvider value={defaultSystem}>
      <AuthProvider>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>

            <Route path="/"         element={<Layout><Homepage /></Layout>} />
            <Route path="/about"    element={<Layout><About /></Layout>} />
            <Route path="/Product"  element={<Layout><Products /></Layout>} />
            <Route path="/auth"     element={<AuthPage />} />

            <Route path="/checkout" element={<ProtectedRoute><Layout><Checkout /></Layout></ProtectedRoute>} />
            <Route path="/users"    element={<ProtectedRoute><Layout><Users /></Layout></ProtectedRoute>} />

            <Route path="/cart" element={
              <Layout>
                <Cart cartItems={[]} closeCart={() => {}} />
              </Layout>
            } />

            <Route path="/AdminDashboard" element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            } />

            <Route path="*" element={<Navigate to="/" replace />} />

          </Routes>
        </Router>
      </AuthProvider>
    </ChakraProvider>
  );
}

export default App;