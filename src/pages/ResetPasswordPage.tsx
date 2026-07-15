import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Box, Button, Heading, Text } from "@chakra-ui/react";
import { useAuth } from "../Component/context/AuthContext";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const GOLD = "#C9A96E", GOLD_LIGHT = "#E8D5A3", DARK = "#0A0A0B", DARK2 = "#111113";
const TEXT_MAIN = "#F0EDE6", TEXT_MUTED = "rgba(232,230,224,0.5)";
const ERR_COLOR = "#E07070", OK_COLOR = "#6EC99A";

async function apiPost(path: string, body: object) {
  const url = `${API_BASE}${path}`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const text = await res.text();
    const data = text ? JSON.parse(text) : {};
    if (!res.ok) throw new Error(data?.message || `Request failed with status ${res.status}`);
    return data;
  } catch (err: any) {
    if (err instanceof SyntaxError) {
      throw new Error(`Invalid JSON response from ${url}`);
    }
    if (err instanceof Error && err.message.includes("Failed to fetch")) {
      throw new Error(`Unable to reach backend at ${API_BASE}. Is the backend running?`);
    }
    throw err;
  }
}

export default function ResetPasswordPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { login } = useAuth();

  const [password, setPassword]   = useState("");
  const [confirm, setConfirm]     = useState("");
  const [error, setError]         = useState("");
  const [loading, setLoading]     = useState(false);
  const [success, setSuccess]     = useState(false);

  async function handleSubmit() {
    setError("");
    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const data = await apiPost(`/auth/reset-password/${token}`, {
        password,
        confirmPassword: confirm,
      });
      login(data.token, data.user);
      setSuccess(true);
      setTimeout(() => navigate("/", { replace: true }), 1500);
    } catch (err: any) {
      setError(err.message || "Reset link is invalid or has expired");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box minH="100vh" bg={DARK} display="flex" alignItems="center" justifyContent="center" px={4}>
      <Box bg={DARK2} border="1px solid rgba(201,169,110,0.2)" maxW="440px" w="100%" p={10}>
        <Text fontSize="10px" letterSpacing="0.25em" textTransform="uppercase" color={GOLD} mb={2}>
          LuxeHub
        </Text>

        {!success ? (
          <>
            <Heading fontFamily="'Cormorant Garamond',serif" fontSize="30px" fontWeight={300} color={TEXT_MAIN} mb={2}>
              Set a new <Box as="em" color={GOLD}>password</Box>
            </Heading>
            <Text fontSize="13px" color={TEXT_MUTED} mb={8}>
              Choose a new password for your account.
            </Text>

            {error && (
              <Box mb={5} p={3} border={`1px solid rgba(224,112,112,0.3)`} bg="rgba(224,112,112,0.07)">
                <Text fontSize="12px" color={ERR_COLOR}>{error}</Text>
              </Box>
            )}

            <Box mb={5}>
              <Text fontSize="10px" letterSpacing="0.18em" textTransform="uppercase" color={TEXT_MUTED} mb={2}>
                New Password
              </Text>
              <input
                className="field-input"
                style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(201,169,110,0.2)", color: TEXT_MAIN, padding: "14px 16px", outline: "none" }}
                type="password" placeholder="Min. 6 characters" value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </Box>

            <Box mb={7}>
              <Text fontSize="10px" letterSpacing="0.18em" textTransform="uppercase" color={TEXT_MUTED} mb={2}>
                Confirm Password
              </Text>
              <input
                className="field-input"
                style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(201,169,110,0.2)", color: TEXT_MAIN, padding: "14px 16px", outline: "none" }}
                type="password" placeholder="Re-enter password" value={confirm}
                onChange={e => setConfirm(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSubmit()}
              />
            </Box>

            <Button
              w="100%" h="50px" borderRadius="0" bg={GOLD} color={DARK}
              fontSize="12px" fontWeight={500} letterSpacing="0.15em" textTransform="uppercase"
              _hover={{ bg: GOLD_LIGHT }}
              disabled={loading}
              onClick={() => { void handleSubmit(); }}
            >
              {loading ? "Updating..." : "Update Password"}
            </Button>
          </>
        ) : (
          <>
            <Heading fontFamily="'Cormorant Garamond',serif" fontSize="28px" fontWeight={300} color={OK_COLOR} mb={3}>
              Password updated!
            </Heading>
            <Text fontSize="13px" color={TEXT_MUTED}>
              Redirecting you to LuxeHub...
            </Text>
          </>
        )}
      </Box>
    </Box>
  );
}