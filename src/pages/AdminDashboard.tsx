import {
  Box, Flex, Grid, Text, Heading, Badge, Button, VStack,
  Spacer, Spinner, Input, Stack, IconButton, Center,
  DialogRoot, DialogBackdrop, DialogPositioner, DialogContent,
  DialogHeader, DialogBody, DialogFooter, DialogCloseTrigger,
  DialogTitle, Avatar, createToaster, Toaster,
} from "@chakra-ui/react";
import { useEffect, useState, useCallback, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import axios, { AxiosError } from "axios";
import { FiTrash2, FiPlus, FiRefreshCw, FiLogOut } from "react-icons/fi";
import { useAuth } from "../Component/context/AuthContext"; // adjust path to match your project

interface ImportMetaEnv { VITE_API_URL?: string; }
const env = (import.meta as unknown as { env: ImportMetaEnv }).env;

const API = axios.create({
  baseURL: env?.VITE_API_URL || "http://localhost:5000/api",
});

const toaster = createToaster({ placement: "bottom-end", overlap: true, gap: 16 });

interface User { _id: string; name: string; email: string; role: string; createdAt?: string; isOnline?: boolean; status?: string; }
interface Product { _id: string; name: string; description: string; price: number | string; image: string; countInStock: number | string; createdAt?: string; }
interface AdminUsersResponse { success: boolean; count: number; users: User[]; }
interface AdminProductsResponse { success: boolean; count: number; products: Product[]; }
interface AdminStatsResponse { success: boolean; users: number; products: number; }
interface ChakraToastOptions { id?: string; name?: ReactNode; description?: ReactNode; type?: string; duration?: number; }

const EMPTY_PRODUCT = { name: "", description: "", price: "", image: "", countInStock: "" };

function getErrorMessage(err: unknown): string {
  if (err instanceof AxiosError) {
    const data = err.response?.data as { message?: string } | undefined;
    if (err.response?.status === 401) return "Unauthorized — session expired, please log in again.";
    if (err.response?.status === 403) return "Forbidden — admin access only.";
    return data?.message || err.message;
  }
  if (err instanceof Error) return err.message;
  return String(err);
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user: currentUser, token, isAdmin, isLoggedIn, isLoading: authLoading, logout } = useAuth();

  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [clock, setClock] = useState(new Date().toLocaleTimeString());
  const [isProductOpen, setIsProductOpen] = useState(false);
  const [productForm, setProductForm] = useState<Omit<Product, "_id">>(EMPTY_PRODUCT);
  const [statsUsers, setStatsUsers] = useState<number | null>(null);
  const [statsProducts, setStatsProducts] = useState<number | null>(null);

  const pageBg = { base: "gray.50", _dark: "gray.900" };
  const cardBg = { base: "white", _dark: "gray.800" };
  const borderColor = { base: "gray.100", _dark: "gray.700" };
  const rowHover = { base: "gray.50", _dark: "gray.700" };

  // ── Guard: redirect if not logged in or not admin ──────────
  // (App.tsx's AdminRoute already does this, but this is a safety net
  // for direct mounts and for when the session changes while mounted)
  useEffect(() => {
    if (authLoading) return;
    if (!isLoggedIn) { navigate("/auth", { replace: true }); return; }
    if (!isAdmin) { navigate("/", { replace: true }); return; }
  }, [authLoading, isLoggedIn, isAdmin, navigate]);

  // ── Attach token to every request ──────────────────────────
  useEffect(() => {
    const interceptor = API.interceptors.request.use((config) => {
      if (token) config.headers.Authorization = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
      return config;
    });
    return () => API.interceptors.request.eject(interceptor);
  }, [token]);

  // ── Eject on 401 from any API call ─────────────────────────
  useEffect(() => {
    const interceptor = API.interceptors.response.use(
      (res) => res,
      (err: AxiosError) => {
        if (err.response?.status === 401) {
          logout();
          navigate("/auth", { replace: true });
        }
        return Promise.reject(err);
      }
    );
    return () => API.interceptors.response.eject(interceptor);
  }, [logout, navigate]);

  useEffect(() => {
    const id = setInterval(() => setClock(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(id);
  }, []);

  const showToast = (title: string, type: "error" | "info" | "success" | "warning", description?: string) => {
    toaster.create({ title, description, type, duration: type === "error" ? 4000 : 2000 });
  };

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true); else setRefreshing(true);
    try {
      const [usersRes, productsRes] = await Promise.all([
        API.get<AdminUsersResponse>("/admin/users"),
        API.get<AdminProductsResponse>("/admin/products"),
      ]);
      setUsers(usersRes.data.users ?? []);
      setProducts(productsRes.data.products ?? []);
    } catch (err: unknown) {
      showToast("Error loading data", "error", getErrorMessage(err));
    } finally { setLoading(false); setRefreshing(false); }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const res = await API.get<AdminStatsResponse>("/admin/stats");
      if (res.data.success) { setStatsUsers(res.data.users); setStatsProducts(res.data.products); }
    } catch { /* silently fail */ }
  }, []);

  // Only fetch once auth is confirmed (token attached, admin verified)
  useEffect(() => {
    if (authLoading || !isLoggedIn || !isAdmin) return;
    void fetchData();
    void fetchStats();
  }, [authLoading, isLoggedIn, isAdmin, fetchData, fetchStats]);

  const handleDeleteUser = async (id: string) => {
    setDeletingUserId(id);
    try {
      await API.delete(`/admin/users/${id}`);
      setUsers((prev) => prev.filter((u) => u._id !== id));
      if (statsUsers !== null) setStatsUsers((n) => (n ?? 1) - 1);
      showToast("User deleted", "info");
    } catch (err: unknown) {
      showToast("Failed to delete user", "error", getErrorMessage(err));
    } finally { setDeletingUserId(null); }
  };

  const handleDeleteProduct = async (id: string) => {
    setDeletingProductId(id);
    try {
      await API.delete(`/admin/products/${id}`);
      setProducts((prev) => prev.filter((p) => p._id !== id));
      if (statsProducts !== null) setStatsProducts((n) => (n ?? 1) - 1);
      showToast("Product deleted", "info");
    } catch (err: unknown) {
      showToast("Failed to delete product", "error", getErrorMessage(err));
    } finally { setDeletingProductId(null); }
  };

  const handleAddProduct = async () => {
    if (!productForm.name.trim() || !productForm.price) { showToast("Name and price are required", "warning"); return; }
    setSaving(true);
    try {
      const res = await API.post<{ success: boolean; product: Product }>("/admin/products", {
        ...productForm,
        price: parseFloat(String(productForm.price)) || 0,
        countInStock: parseInt(String(productForm.countInStock)) || 0,
      });
      setProducts((prev) => [res.data.product, ...prev]);
      if (statsProducts !== null) setStatsProducts((n) => (n ?? 0) + 1);
      showToast("Product added", "success");
      setProductForm(EMPTY_PRODUCT);
      setIsProductOpen(false);
    } catch (err: unknown) {
      showToast("Failed to add product", "error", getErrorMessage(err));
    } finally { setSaving(false); }
  };

  // ── Logout handler ────────────────────────────────────────
  const handleLogout = () => {
    logout();
    navigate("/auth", { replace: true });
  };

  const onlineCount = users.filter((u) => u.isOnline || u.status === "online").length;
  const displayUserCount = statsUsers ?? users.length;
  const displayProductCount = statsProducts ?? products.length;

  if (authLoading || loading) {
    return (
      <Flex h="100vh" align="center" justify="center" bg={pageBg}>
        <Spinner size="lg" color="blue.500" />
      </Flex>
    );
  }

  return (
    <Box p={6} bg={pageBg} minH="100vh">

      {/* ── HEADER ── */}
      <Flex mb={6} align="center" gap={3}>
        <Box>
          <Heading size="lg" fontWeight="600">Admin Dashboard</Heading>
          {currentUser && (
            <Text fontSize="12px" color="gray.400" mt={0.5}>
              Logged in as {currentUser.name} ({currentUser.email})
            </Text>
          )}
        </Box>
        <Spacer />
        <IconButton size="sm" variant="ghost" aria-label="Refresh data" loading={refreshing} onClick={() => void fetchData(true)}>
          <FiRefreshCw />
        </IconButton>
        <Text color="gray.400" fontSize="sm" fontVariantNumeric="tabular-nums">{clock}</Text>
        <Button size="sm" variant="outline" colorPalette="red" onClick={handleLogout}>
          <FiLogOut /> Log out
        </Button>
      </Flex>

      {/* ── STATS ── */}
      <Grid templateColumns={{ base: "repeat(2,1fr)", md: "repeat(4,1fr)" }} gap={4} mb={6}>
        {[
          { label: "Total products", value: displayProductCount, color: "blue.500" },
          { label: "Total users",    value: displayUserCount,    color: "gray.700" },
          { label: "Online",         value: onlineCount,         color: "green.500" },
          { label: "Offline",        value: users.length - onlineCount, color: "orange.400" },
        ].map(({ label, value, color }) => (
          <Box key={label} bg={cardBg} p={4} rounded="xl" border="1px solid" borderColor={borderColor}>
            <Text fontSize="xs" textTransform="uppercase" letterSpacing="wider" color="gray.500" mb={1}>{label}</Text>
            <Heading size="lg" color={color}>{value}</Heading>
          </Box>
        ))}
      </Grid>

      {/* ── PANELS ── */}
      <Grid templateColumns={{ base: "1fr", md: "repeat(2,1fr)" }} gap={6}>

        {/* PRODUCTS */}
        <Box bg={cardBg} p={5} rounded="xl" border="1px solid" borderColor={borderColor}>
          <Flex mb={4} align="center">
            <Text fontWeight="600" fontSize="sm">
              Products <Badge ml={2} colorPalette="blue" borderRadius="full" fontSize="10px">{displayProductCount}</Badge>
            </Text>
            <Spacer />
            <Button size="sm" onClick={() => setIsProductOpen(true)} colorPalette="blue" variant="outline">
              <FiPlus /> Add product
            </Button>
          </Flex>
          {products.length === 0 ? (
            <Center py={8} flexDir="column" gap={2}>
              <Text fontSize="sm" color="gray.400">No products yet</Text>
              <Button size="xs" variant="ghost" colorPalette="blue" onClick={() => setIsProductOpen(true)}>Add your first product</Button>
            </Center>
          ) : (
            <VStack align="stretch" gap={0} maxH="360px" overflowY="auto">
              {products.map((p) => (
                <Flex key={p._id} p={3} align="center" borderRadius="lg" _hover={{ bg: rowHover }} transition="background 0.15s">
                  <Box flex={1} minW={0}>
                    <Text fontSize="13px" fontWeight="500" css={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</Text>
                    <Text fontSize="11px" color="gray.500">₦{Number(p.price).toLocaleString()}</Text>
                    <Text fontSize="11px" color="gray.400">Stock: {p.countInStock}</Text>
                    <Text fontSize="11px" color="gray.400" css={{ overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{p.description}</Text>
                  </Box>
                  <IconButton size="xs" variant="ghost" colorPalette="red" aria-label={`Delete ${p.name}`} loading={deletingProductId === p._id} onClick={() => { void handleDeleteProduct(p._id); }}>
                    <FiTrash2 />
                  </IconButton>
                </Flex>
              ))}
            </VStack>
          )}
        </Box>

        {/* USERS */}
        <Box bg={cardBg} p={5} rounded="xl" border="1px solid" borderColor={borderColor}>
          <Flex mb={4} align="center">
            <Text fontWeight="600" fontSize="sm">
              Users <Badge ml={2} colorPalette="gray" borderRadius="full" fontSize="10px">{displayUserCount}</Badge>
            </Text>
          </Flex>
          {users.length === 0 ? (
            <Center py={8}><Text fontSize="sm" color="gray.400">No users found</Text></Center>
          ) : (
            <VStack align="stretch" gap={0} maxH="360px" overflowY="auto">
              {users.map((u) => {
                const isOnline = u.isOnline || u.status === "online";
                const isUserAdmin = u.role === "admin";
                return (
                  <Flex key={u._id} p={3} align="center" gap={3} borderRadius="lg" _hover={{ bg: rowHover }} transition="background 0.15s">
                    <Avatar.Root size="xs" flexShrink={0}><Avatar.Fallback name={u.name} /></Avatar.Root>
                    <Box flex={1} minW={0}>
                      <Flex align="center" gap={2}>
                        <Text fontSize="13px" fontWeight="500" css={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.name}</Text>
                        {isUserAdmin && <Badge colorPalette="purple" fontSize="9px" px={1} borderRadius="sm">admin</Badge>}
                      </Flex>
                      <Text fontSize="11px" color="gray.400" css={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.email}</Text>
                    </Box>
                    <Badge colorPalette={isOnline ? "green" : "gray"} borderRadius="full" fontSize="10px" px={2} flexShrink={0}>
                      {isOnline ? "online" : "offline"}
                    </Badge>
                    {!isUserAdmin && (
                      <IconButton size="xs" variant="ghost" colorPalette="red" aria-label={`Delete ${u.name}`} loading={deletingUserId === u._id} onClick={() => { void handleDeleteUser(u._id); }}>
                        <FiTrash2 />
                      </IconButton>
                    )}
                  </Flex>
                );
              })}
            </VStack>
          )}
        </Box>
      </Grid>

      {/* ── PRODUCT DIALOG ── */}
      <DialogRoot open={isProductOpen} onOpenChange={(details: { open: boolean }) => { if (!details.open) setIsProductOpen(false); }}>
        <DialogBackdrop backdropFilter="blur(4px)" />
        <DialogPositioner>
          <DialogContent>
            <DialogHeader>
              <DialogTitle fontSize="md" fontWeight="600">Add product</DialogTitle>
              <DialogCloseTrigger />
            </DialogHeader>
            <DialogBody pb={2}>
              <Stack gap={3}>
                <Input size="sm" placeholder="Product name *" value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} />
                <Input size="sm" type="number" placeholder="Price (₦) *" value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} />
                <Input size="sm" type="number" placeholder="Stock quantity" value={productForm.countInStock} onChange={(e) => setProductForm({ ...productForm, countInStock: e.target.value })} />
                <Input size="sm" placeholder="Image URL" value={productForm.image} onChange={(e) => setProductForm({ ...productForm, image: e.target.value })} />
                <Input size="sm" placeholder="Description" value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} />
              </Stack>
            </DialogBody>
            <DialogFooter gap={2}>
              <Button size="sm" variant="ghost" onClick={() => setIsProductOpen(false)}>Cancel</Button>
              <Button size="sm" colorPalette="blue" loading={saving} onClick={() => { void handleAddProduct(); }}>Save product</Button>
            </DialogFooter>
          </DialogContent>
        </DialogPositioner>
      </DialogRoot>

      {/* ── Toaster ── */}
      <Toaster toaster={toaster}>
        {(toast: ChakraToastOptions) => (
          <Box bg={cardBg} p={3} rounded="md" border="1px solid" borderColor={borderColor} shadow="md">
            <Text fontSize="sm" fontWeight="500">{toast.name as ReactNode}</Text>
            {toast.description && <Text fontSize="xs" color="gray.400">{toast.description as ReactNode}</Text>}
          </Box>
        )}
      </Toaster>
    </Box>
  );
}