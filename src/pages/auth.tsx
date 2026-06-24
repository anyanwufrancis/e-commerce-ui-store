import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box, Button, chakra, Flex, Heading, HStack,
  Text, VStack, Image,
} from "@chakra-ui/react";
import { useAuth } from "../Component/context/AuthContext";

// ─── Config ───────────────────────────────────────────────────────────────────
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// ─── Design Tokens ────────────────────────────────────────────────────────────
const GOLD       = "#C9A96E";
const GOLD_LIGHT = "#E8D5A3";
const DARK       = "#0A0A0B";
const DARK2      = "#111113";
const TEXT_MAIN  = "#F0EDE6";
const TEXT_MUTED = "rgba(232,230,224,0.5)";
const ERR_COLOR  = "#E07070";
const OK_COLOR   = "#6EC99A";

// ─── API call ─────────────────────────────────────────────────────────────────
async function apiPost(path: string, body: object) {
  const res  = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Something went wrong");
  return data;
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface FormErrors {
  fname?:    string;
  lname?:    string;
  email?:    string;
  phone?:    string;
  password?: string;
  confirm?:  string;
  terms?:    string;
}

// ─── Global Styles ────────────────────────────────────────────────────────────
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { background: ${DARK}; font-family: 'DM Sans', sans-serif; }

    @keyframes fadeUp   { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
    @keyframes shimmer  { 0% { background-position:-200% center; } 100% { background-position:200% center; } }
    @keyframes floatBadge { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-8px); } }
    @keyframes spin     { to { transform: rotate(360deg); } }

    .anim-fade { animation: fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) both; }
    .d1 { animation-delay:0.05s; } .d2 { animation-delay:0.15s; }
    .d3 { animation-delay:0.25s; } .d4 { animation-delay:0.35s; }
    .d5 { animation-delay:0.45s; }

    .serif { font-family:'Cormorant Garamond',serif !important; }
    .shimmer-text {
      font-style:italic;
      background: linear-gradient(90deg,${GOLD} 0%,${GOLD_LIGHT} 40%,${GOLD} 60%,#A07840 100%);
      background-size:200% auto;
      -webkit-background-clip:text; -webkit-text-fill-color:transparent;
      background-clip:text; animation:shimmer 4s linear infinite;
    }
    .noise-overlay {
      position:fixed; inset:0; pointer-events:none; z-index:9999;
      background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
      opacity:0.025;
    }
    .field-input {
      width:100%; background:rgba(255,255,255,0.04)!important;
      border:1px solid rgba(201,169,110,0.2)!important; border-radius:0!important;
      color:${TEXT_MAIN}!important; font-family:'DM Sans',sans-serif!important;
      font-size:14px!important; font-weight:300!important;
      padding:14px 16px!important; outline:none!important;
      transition:border-color 0.3s,background 0.3s!important;
    }
    .field-input::placeholder { color:rgba(232,230,224,0.25)!important; }
    .field-input:focus { border-color:${GOLD}!important; background:rgba(201,169,110,0.04)!important; }
    .field-input:hover { border-color:rgba(201,169,110,0.5)!important; }
    .field-input.has-error { border-color:${ERR_COLOR}!important; }

    .tab-btn {
      flex:1; background:transparent; border:none; color:${TEXT_MUTED};
      font-family:'DM Sans',sans-serif; font-size:12px; font-weight:400;
      letter-spacing:0.15em; text-transform:uppercase; padding:10px 0; cursor:pointer;
      border-bottom:1px solid rgba(201,169,110,0.15); transition:all 0.3s;
    }
    .tab-btn.active { color:${GOLD}; border-bottom:1px solid ${GOLD}; }

    .social-btn {
      flex:1; display:flex; align-items:center; justify-content:center; gap:10px;
      background:rgba(255,255,255,0.03); border:1px solid rgba(201,169,110,0.15);
      color:${TEXT_MUTED}; font-family:'DM Sans',sans-serif; font-size:13px;
      font-weight:300; letter-spacing:0.05em; padding:12px 0; cursor:pointer; transition:all 0.3s;
    }
    .social-btn:hover { background:rgba(201,169,110,0.06); border-color:rgba(201,169,110,0.4); color:${TEXT_MAIN}; }

    .benefit-row { display:flex; align-items:center; gap:14px; padding:14px 0; border-bottom:1px solid rgba(255,255,255,0.05); }
    .benefit-row:last-child { border-bottom:none; }
    .float-badge { animation:floatBadge 4s ease-in-out infinite; }
    .spinner-ring {
      width:18px; height:18px;
      border:2px solid rgba(10,10,11,0.3); border-top-color:${DARK};
      border-radius:50%; animation:spin 0.7s linear infinite; display:inline-block;
    }
    ::-webkit-scrollbar { width:5px; }
    ::-webkit-scrollbar-track { background:${DARK2}; }
    ::-webkit-scrollbar-thumb { background:rgba(201,169,110,0.25); border-radius:3px; }
  `}</style>
);

// ─── Small UI helpers ─────────────────────────────────────────────────────────
function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <Text fontSize="10px" letterSpacing="0.18em" textTransform="uppercase"
      color={TEXT_MUTED} mb={2} fontFamily="'DM Sans',sans-serif">{children}</Text>
  );
}
function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <Text fontSize="11px" color={ERR_COLOR} mt={1} fontFamily="'DM Sans',sans-serif">{msg}</Text>;
}
function AlertBanner({ msg, type }: { msg: string; type: "error" | "success" }) {
  if (!msg) return null;
  return (
    <Box mb={5} p={3}
      border={`1px solid ${type === "error" ? "rgba(224,112,112,0.3)" : "rgba(110,201,154,0.3)"}`}
      bg={type === "error" ? "rgba(224,112,112,0.07)" : "rgba(110,201,154,0.07)"}
    >
      <Text fontSize="12px" color={type === "error" ? ERR_COLOR : OK_COLOR}
        fontFamily="'DM Sans',sans-serif" letterSpacing="0.04em">{msg}</Text>
    </Box>
  );
}
function GoldDivider() {
  return (
    <HStack gap={4} my={6}>
      <Box flex={1} h="1px" bg="rgba(201,169,110,0.15)" />
      <Text fontSize="11px" letterSpacing="0.15em" color="rgba(201,169,110,0.4)" textTransform="uppercase">or</Text>
      <Box flex={1} h="1px" bg="rgba(201,169,110,0.15)" />
    </HStack>
  );
}
function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

// ─── Password strength ────────────────────────────────────────────────────────
function StrengthBar({ password }: { password: string }) {
  if (!password) return null;
  let score = 0;
  if (password.length >= 6)  score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  const colors = ["", "#E07070", "#E0A870", GOLD, OK_COLOR];
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  return (
    <Box mt={2}>
      <HStack gap={1} mb={1}>
        {[1,2,3,4].map(i => (
          <Box key={i} flex={1} h="2px"
            bg={i <= score ? colors[score] : "rgba(255,255,255,0.07)"}
            transition="background 0.3s"
          />
        ))}
      </HStack>
      {score > 0 && <Text fontSize="10px" color={colors[score]} letterSpacing="0.1em">{labels[score]}</Text>}
    </Box>
  );
}

// ─── Login Form ───────────────────────────────────────────────────────────────
function LoginForm({ onSwitch }: { onSwitch: () => void }) {
  const { login }    = useAuth();
  const navigate     = useNavigate();
  const location     = useLocation();
  const redirectTo   = (location.state as any)?.from?.pathname || "/";

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [errors,   setErrors]   = useState<FormErrors>({});
  const [alert,    setAlert]    = useState({ msg: "", type: "error" as "error" | "success" });
  const [loading,  setLoading]  = useState(false);

  function validate() {
    const e: FormErrors = {};
    if (!email || !/\S+@\S+\.\S+/.test(email)) e.email = "Enter a valid email address.";
    if (!password) e.password = "Password is required.";
    setErrors(e);
    return !Object.keys(e).length;
  }

  async function handleLogin() {
    setAlert({ msg: "", type: "error" });
    if (!validate()) return;
    setLoading(true);
    try {
      const data = await apiPost("/auth/login", { email, password });
      login(data.token, data.user);                    // ← saves to context + localStorage
      setAlert({ msg: "Login successful! Redirecting home…", type: "success" });
      setTimeout(() => navigate(redirectTo, { replace: true }), 1000);
    } catch (err: any) {
      setAlert({ msg: err.message, type: "error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <VStack gap={0} align="stretch">
      <HStack gap={2} mb={0}>
        <button className="social-btn"><GoogleIcon /><span>Google</span></button>
        <button className="social-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill={TEXT_MUTED}>
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
          <span>Facebook</span>
        </button>
      </HStack>

      <GoldDivider />
      <AlertBanner msg={alert.msg} type={alert.type} />

      {/* Email */}
      <Box mb={5} className="anim-fade d2">
        <FieldLabel>Email Address</FieldLabel>
        <input className={`field-input${errors.email ? " has-error" : ""}`}
          type="email" placeholder="you@example.com" value={email}
          onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: "" })); }}
          onKeyDown={e => e.key === "Enter" && handleLogin()}
        />
        <FieldError msg={errors.email} />
      </Box>

      {/* Password */}
      <Box mb={2} className="anim-fade d3">
        <Flex justify="space-between" align="center" mb={2}>
          <FieldLabel>Password</FieldLabel>
          <Text fontSize="11px" color={GOLD} cursor="pointer" letterSpacing="0.05em"
            _hover={{ color: GOLD_LIGHT }} transition="color 0.2s"
          >Forgot password?</Text>
        </Flex>
        <input className={`field-input${errors.password ? " has-error" : ""}`}
          type="password" placeholder="Enter your password" value={password}
          onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: "" })); }}
          onKeyDown={e => e.key === "Enter" && handleLogin()}
        />
        <FieldError msg={errors.password} />
      </Box>

      {/* Remember me */}
      <HStack justify="flex-start" mb={7} mt={4} className="anim-fade d4">
        <Box as="label" display="flex" alignItems="center" gap={3} cursor="pointer" color={TEXT_MUTED} fontSize="13px">
          <Box w="16px" h="16px" border="1px solid rgba(201,169,110,0.3)" flexShrink={0} />
          <Text fontFamily="'DM Sans',sans-serif" fontWeight={300} letterSpacing="0.03em">Remember me for 30 days</Text>
        </Box>
      </HStack>

      <Button w="100%" h="50px" rounded="none" bg={GOLD} color={DARK} className="anim-fade d5"
        fontFamily="'DM Sans',sans-serif" fontSize="12px" fontWeight={500}
        letterSpacing="0.15em" textTransform="uppercase"
        _hover={{ bg: GOLD_LIGHT, transform: "translateY(-2px)" }} transition="all 0.3s" mb={6}
        disabled={loading} onClick={handleLogin}
      >
        {loading ? <span className="spinner-ring" /> : "Sign In to LuxeHub"}
      </Button>

      <Text textAlign="center" fontSize="13px" color={TEXT_MUTED} fontFamily="'DM Sans',sans-serif">
        No account yet?{" "}
        <Box as="span" color={GOLD} cursor="pointer" onClick={onSwitch} _hover={{ color: GOLD_LIGHT }} transition="color 0.2s">
          Create one →
        </Box>
      </Text>
    </VStack>
  );
}

// ─── Signup Form ──────────────────────────────────────────────────────────────
function SignupForm({ onSwitch }: { onSwitch: () => void }) {
  const { login } = useAuth();
  const navigate  = useNavigate();

  const [fname,    setFname]    = useState("");
  const [lname,    setLname]    = useState("");
  const [email,    setEmail]    = useState("");
  const [phone,    setPhone]    = useState("");
  const [password, setPassword] = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [terms,    setTerms]    = useState(false);
  const [errors,   setErrors]   = useState<FormErrors>({});
  const [alert,    setAlert]    = useState({ msg: "", type: "error" as "error" | "success" });
  const [loading,  setLoading]  = useState(false);

  function validate() {
    const e: FormErrors = {};
    if (!fname.trim())                               e.fname    = "First name is required.";
    if (!lname.trim())                               e.lname    = "Last name is required.";
    if (!email || !/\S+@\S+\.\S+/.test(email))      e.email    = "Enter a valid email address.";
    if (!password || password.length < 6)            e.password = "Password must be at least 6 characters.";
    if (password !== confirm)                        e.confirm  = "Passwords do not match.";
    if (!terms)                                      e.terms    = "You must agree to the Terms of Service.";
    setErrors(e);
    return !Object.keys(e).length;
  }

  async function handleRegister() {
    setAlert({ msg: "", type: "error" });
    if (!validate()) return;
    setLoading(true);
    try {
      const data = await apiPost("/auth/register", {
        name: `${fname.trim()} ${lname.trim()}`,
        email,
        phone,
        password,
      });
      login(data.token, data.user);                  // ← saves to context + localStorage
      setAlert({ msg: "Account created! Redirecting home…", type: "success" });
      setTimeout(() => navigate("/", { replace: true }), 1200);
    } catch (err: any) {
      setAlert({ msg: err.message, type: "error" });
    } finally {
      setLoading(false);
    }
  }

  const clr = (f: keyof FormErrors) => setErrors(p => ({ ...p, [f]: "" }));

  return (
    <VStack gap={0} align="stretch">
      <AlertBanner msg={alert.msg} type={alert.type} />

      {/* Name row */}
      <HStack gap={4} mb={5} className="anim-fade d1">
        <Box flex={1}>
          <FieldLabel>First Name</FieldLabel>
          <input className={`field-input${errors.fname ? " has-error" : ""}`}
            placeholder="Amara" value={fname}
            onChange={e => { setFname(e.target.value); clr("fname"); }}
          />
          <FieldError msg={errors.fname} />
        </Box>
        <Box flex={1}>
          <FieldLabel>Last Name</FieldLabel>
          <input className={`field-input${errors.lname ? " has-error" : ""}`}
            placeholder="Okafor" value={lname}
            onChange={e => { setLname(e.target.value); clr("lname"); }}
          />
          <FieldError msg={errors.lname} />
        </Box>
      </HStack>

      {/* Email */}
      <Box mb={5} className="anim-fade d2">
        <FieldLabel>Email Address</FieldLabel>
        <input className={`field-input${errors.email ? " has-error" : ""}`}
          type="email" placeholder="you@example.com" value={email}
          onChange={e => { setEmail(e.target.value); clr("email"); }}
        />
        <FieldError msg={errors.email} />
      </Box>

      {/* Phone */}
      <Box mb={5} className="anim-fade d3">
        <FieldLabel>Phone Number</FieldLabel>
        <input className="field-input" type="tel" placeholder="+234 800 000 0000"
          value={phone} onChange={e => setPhone(e.target.value)} />
      </Box>

      {/* Password */}
      <Box mb={5} className="anim-fade d4">
        <FieldLabel>Password</FieldLabel>
        <input className={`field-input${errors.password ? " has-error" : ""}`}
          type="password" placeholder="Min. 6 characters" value={password}
          onChange={e => { setPassword(e.target.value); clr("password"); }}
        />
        <StrengthBar password={password} />
        <FieldError msg={errors.password} />
      </Box>

      {/* Confirm */}
      <Box mb={6} className="anim-fade d4">
        <FieldLabel>Confirm Password</FieldLabel>
        <input className={`field-input${errors.confirm ? " has-error" : ""}`}
          type="password" placeholder="Re-enter password" value={confirm}
          onChange={e => { setConfirm(e.target.value); clr("confirm"); }}
        />
        <FieldError msg={errors.confirm} />
      </Box>

      {/* Terms checkbox */}
      <Box mb={errors.terms ? 3 : 7} className="anim-fade d5">
        <HStack align="flex-start" gap={3}>
          <Box as="button"
            w="16px" h="16px" flexShrink={0} mt="2px"
            border={`1px solid ${errors.terms ? ERR_COLOR : "rgba(201,169,110,0.3)"}`}
            bg={terms ? GOLD : "transparent"}
            cursor="pointer" transition="all 0.2s"
            display="flex" alignItems="center" justifyContent="center"
            onClick={() => { setTerms(p => !p); clr("terms"); }}
          >
            {terms && (
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                <path d="M2 6l3 3 5-5" stroke={DARK} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </Box>
          <Text fontSize="12px" color={TEXT_MUTED} fontFamily="'DM Sans',sans-serif" lineHeight={1.6}>
            I agree to the{" "}
            <Box as="span" color={GOLD} cursor="pointer">Terms of Service</Box>{" "}and{" "}
            <Box as="span" color={GOLD} cursor="pointer">Privacy Policy</Box>
          </Text>
        </HStack>
        <FieldError msg={errors.terms} />
      </Box>

      <Button w="100%" h="50px" rounded="none" bg={GOLD} color={DARK} className="anim-fade d5"
        fontFamily="'DM Sans',sans-serif" fontSize="12px" fontWeight={500}
        letterSpacing="0.15em" textTransform="uppercase"
        _hover={{ bg: GOLD_LIGHT, transform: "translateY(-2px)" }} transition="all 0.3s" mb={6}
        disabled={loading} onClick={handleRegister}
      >
        {loading ? <span className="spinner-ring" /> : "Create My Account"}
      </Button>

      <Text textAlign="center" fontSize="13px" color={TEXT_MUTED} fontFamily="'DM Sans',sans-serif">
        Already have an account?{" "}
        <Box as="span" color={GOLD} cursor="pointer" onClick={onSwitch} _hover={{ color: GOLD_LIGHT }} transition="color 0.2s">
          Sign in →
        </Box>
      </Text>
    </VStack>
  );
}

// ─── Left Panel ───────────────────────────────────────────────────────────────
function LeftPanel() {
  return (
    <Box position="relative" overflowY="auto" overflowX="hidden" h="100%">
      <Image src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1000&q=80"
        alt="" position="absolute" inset={0} w="100%" h="100%" objectFit="cover" filter="brightness(0.35)"
      />
      <Box position="absolute" inset={0} bg="linear-gradient(135deg,rgba(10,10,11,0.95) 0%,rgba(10,10,11,0.6) 100%)" />
      <Box position="absolute" inset={0} bg={`linear-gradient(to right,transparent 60%,${DARK} 100%)`} />
      <Box position="absolute" top={0} left="60px" w="1px" h="60px" bg={`linear-gradient(to bottom,${GOLD},transparent)`} />

      <VStack position="relative" zIndex={2} minH="100vh" align="flex-start" justify="center" px={12} py={8} gap={0}>
        <Box mb={8} className="anim-fade d1">
          <Text className="serif" fontSize="28px" fontWeight={300} letterSpacing="0.05em" color={TEXT_MAIN}>
            Luxe<Box as="span" color={GOLD}>Hub</Box>
          </Text>
          <Box w="30px" h="1px" bg={GOLD} mt={2} />
        </Box>
        <Box mb={5} className="anim-fade d2">
          <Text fontSize="11px" letterSpacing="0.25em" textTransform="uppercase" color={GOLD} mb={3}>Nigeria's Luxury Marketplace</Text>
          <Heading className="serif" fontSize="clamp(34px,3.5vw,52px)" fontWeight={300} color={TEXT_MAIN} lineHeight={1.05}>
            Shop the<br />Finest Things<br /><Box as="span" className="shimmer-text">In Life</Box>
          </Heading>
        </Box>
        <Text fontSize="14px" lineHeight={1.8} color={TEXT_MUTED} maxW="420px" mb={6}
          className="anim-fade d3" fontFamily="'DM Sans',sans-serif" fontWeight={300}
        >
          Curated fashion, electronics, accessories and more — delivered to your door with care.
        </Text>
        <Box w="100%" maxW="420px" className="anim-fade d4">
          {[
            { icon: "M5 12h14M12 5l7 7-7 7", label: "Fast Delivery", sub: "Nationwide within 3 days" },
            { icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z", label: "Secure Checkout", sub: "256-bit encryption" },
            { icon: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15", label: "Easy Returns", sub: "Hassle-free 30 days" },
          ].map(b => (
            <Box key={b.label} className="benefit-row" py={2}>
              <Box w="34px" h="34px" flexShrink={0} border="1px solid rgba(201,169,110,0.2)" display="flex" alignItems="center" justifyContent="center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.5">
                  <path d={b.icon} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Box>
              <Box>
                <Text fontSize="13px" color={TEXT_MAIN} fontWeight={400}>{b.label}</Text>
                <Text fontSize="11px" color={TEXT_MUTED}>{b.sub}</Text>
              </Box>
            </Box>
          ))}
        </Box>
        <Box mt={6} maxW="420px" bg="rgba(201,169,110,0.06)" border="1px solid rgba(201,169,110,0.2)" p={4} className="float-badge anim-fade d5">
          <Box mb={2}>
            {[1,2,3,4,5].map(i => (
              <svg key={i} width="12" height="12" viewBox="0 0 24 24" fill={GOLD} style={{ display:"inline-block", marginRight:4 }}>
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            ))}
          </Box>
          <Text className="serif" fontSize="15px" fontStyle="italic" color={TEXT_MAIN} lineHeight={1.6} mb={3}>
            "Packaging alone felt like an event. Delivered same day to Abuja."
          </Text>
          <HStack gap={3}>
            <Image src="https://i.pravatar.cc/100?img=47" w="34px" h="34px" borderRadius="full" />
            <Box>
              <Text fontSize="13px" color={TEXT_MAIN}>Amara Okafor</Text>
              <Text fontSize="11px" color={TEXT_MUTED}>Verified Buyer · Lagos</Text>
            </Box>
          </HStack>
        </Box>
        <HStack gap={6} mt={6} flexWrap="wrap" className="anim-fade d5">
          {[["12K+","Products"],["98%","Satisfaction"],["50K+","Customers"]].map(([n,l]) => (
            <Box key={l}>
              <Text className="serif" fontSize="22px" fontWeight={300} color={GOLD}>{n}</Text>
              <Text fontSize="10px" letterSpacing="0.12em" textTransform="uppercase" color={TEXT_MUTED}>{l}</Text>
            </Box>
          ))}
        </HStack>
      </VStack>
    </Box>
  );
}

// ─── Main Auth Page ───────────────────────────────────────────────────────────
export default function AuthPage() {
  const [tab, setTab] = useState<"login" | "signup">("login");

  return (
    <Flex minH="100vh" bg={DARK} fontFamily="'DM Sans',sans-serif">
      <GlobalStyles />
      <Box className="noise-overlay" aria-hidden />

      <Box display={{ base:"none", lg:"block" }} flex={1} position="sticky" top={0} h="100vh">
        <LeftPanel />
      </Box>

      <Flex flex={{ base:1, lg:"0 0 520px" }} direction="column" bg={DARK2}
        borderLeft="1px solid rgba(201,169,110,0.1)" overflowY="auto"
      >
        <Box h="3px" bgGradient={`linear(to-r,transparent,${GOLD},transparent)`} />

        <Flex direction="column" justify="center" flex={1} px={{ base:8, md:14 }} py={16}>
          <Box display={{ base:"block", lg:"none" }} mb={10}>
            <Text className="serif" fontSize="24px" fontWeight={300} color={TEXT_MAIN}>
              Luxe<Box as="span" color={GOLD}>Hub</Box>
            </Text>
          </Box>

          <Box mb={10} className="anim-fade d1">
            <Text fontSize="10px" letterSpacing="0.25em" textTransform="uppercase" color={GOLD} mb={3} fontFamily="'DM Sans',sans-serif">
              {tab === "login" ? "Welcome Back" : "Join LuxeHub"}
            </Text>
            <Heading className="serif" fontSize="38px" fontWeight={300} color={TEXT_MAIN} lineHeight={1.1} mb={2}>
              {tab === "login"
                ? <>{`Sign in to your`}<br /><Box as="em" color={GOLD}>Account</Box></>
                : <>{`Create your`}<br /><Box as="em" color={GOLD}>Account</Box></>
              }
            </Heading>
            <Text fontSize="13px" color={TEXT_MUTED} fontFamily="'DM Sans',sans-serif">
              {tab === "login" ? "Good to see you again. Your luxury awaits." : "Join thousands of happy shoppers across Nigeria."}
            </Text>
          </Box>

          <HStack gap={0} mb={8} className="anim-fade d1">
            <button className={`tab-btn ${tab === "login"  ? "active" : ""}`} onClick={() => setTab("login")}>Sign In</button>
            <button className={`tab-btn ${tab === "signup" ? "active" : ""}`} onClick={() => setTab("signup")}>Create Account</button>
          </HStack>

          {tab === "login"
            ? <LoginForm  onSwitch={() => setTab("signup")} />
            : <SignupForm onSwitch={() => setTab("login")}  />
          }

          <HStack gap={6} justify="center" mt={10} borderTop="1px solid rgba(201,169,110,0.1)" pt={8}>
            {[
              { icon:"M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z", label:"SSL Secured" },
              { icon:"M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z", label:"Verified" },
              { icon:"M5 12h14M12 5l7 7-7 7", label:"Fast Delivery" },
            ].map(b => (
              <VStack key={b.label} gap={1}>
                <chakra.svg w="18px" h="18px" viewBox="0 0 24 24" fill="none" stroke="rgba(201,169,110,0.5)" strokeWidth="1.5">
                  <path d={b.icon} strokeLinecap="round" strokeLinejoin="round" />
                </chakra.svg>
                <Text fontSize="10px" letterSpacing="0.12em" textTransform="uppercase" color={TEXT_MUTED}>{b.label}</Text>
              </VStack>
            ))}
          </HStack>
        </Flex>

        <Box h="1px" bg="rgba(201,169,110,0.1)" />
        <Box py={4} px={14}>
          <Text fontSize="11px" color="rgba(232,230,224,0.2)" textAlign="center" fontFamily="'DM Sans',sans-serif">
            © 2026 LuxeHub · Privacy · Terms
          </Text>
        </Box>
      </Flex>
    </Flex>
  );
}