import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "./Component/context/AuthContext";

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim();

if (import.meta.env.DEV) {
  console.log("Google OAuth config:", {
    clientId: googleClientId,
    origin: window.location.origin,
  });
}

ReactDOM.createRoot(
  document.getElementById("root")!
).render(
  <ChakraProvider value={defaultSystem}>
    <AuthProvider>
      {googleClientId ? (
        <GoogleOAuthProvider clientId={googleClientId}>
          <App />
        </GoogleOAuthProvider>
      ) : (
        <App />
      )}
    </AuthProvider>
  </ChakraProvider>
);