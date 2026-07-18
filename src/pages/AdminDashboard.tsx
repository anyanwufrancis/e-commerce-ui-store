import {
  Box, Flex, Grid, Text, Heading, Badge, Button, VStack,
  Spacer, Spinner, Input, Stack, IconButton, Center, Skeleton,
  DialogRoot, DialogBackdrop, DialogPositioner, DialogContent,
  DialogHeader, DialogBody, DialogFooter,
  DialogTitle, DialogDescription, Avatar, createToaster, Toaster,
  Fieldset, Field, FieldLabel, FieldErrorText, Switch,
  DrawerRoot, DrawerBackdrop, DrawerPositioner, DrawerContent, DrawerBody, DrawerCloseTrigger,
  useDisclosure, HStack, Separator, Textarea,
} from "@chakra-ui/react";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AxiosError } from "axios";
import {
  FiTrash2, FiPlus, FiRefreshCw, FiLogOut,
  FiHome, FiBarChart2, FiPackage, FiUsers, FiShoppingCart, FiSettings,
  FiDollarSign, FiPackage as FiPackageIcon, FiImage, FiFileText, FiMenu,
  FiStar, FiTag, FiTrendingUp, FiBox, FiCheckCircle, FiXCircle, FiMail,
  FiExternalLink, FiGlobe, FiInfo, FiShoppingBag, FiSun, FiMoon,
  FiPhone, FiMapPin, FiClock,
} from "react-icons/fi";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { useAuth } from "../Component/context/AuthContext";
import API from "../services/api";

const toaster = createToaster({ placement: "bottom-end", overlap: true, gap: 16 });

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  isOnline?: boolean;
  status?: string;
}

interface Product {
  _id: string;
  name: string;
  description?: string;
  price: number | string;
  countInStock: number | string;
}

interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
}

interface Review {
  _id: string;
  rating: number;
  comment?: string;
  isApproved: boolean;
  createdAt: string;
  user?: { _id: string; name: string; email: string } | null;
  product?: { _id: string; name: string } | null;
}

interface OrderItem {
  product: string;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  _id: string;
  items: OrderItem[];
  totalPrice: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
  user?: { _id: string; name: string; email: string } | null;
}

interface SettingsData {
  storeName: string;
  storeDescription: string;
  storeAddress: string;
  storePhone: string;
  workingHours: string;
  supportEmail: string;
  currency: string;
  shippingFee: number;
  freeShippingThreshold: number;
  taxRate: number;
  maintenanceMode: boolean;
}

const EMPTY_PRODUCT = { name: "", description: "", price: "", image: "", countInStock: "" };
const EMPTY_CATEGORY = { name: "", description: "", image: "" };
const EMPTY_SETTINGS: SettingsData = {
  storeName: "",
  storeDescription: "",
  storeAddress: "",
  storePhone: "",
  workingHours: "",
  supportEmail: "",
  currency: "NGN",
  shippingFee: 0,
  freeShippingThreshold: 0,
  taxRate: 0,
  maintenanceMode: false,
};
const ORDER_STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"];

type Section =
  | "dashboard"
  | "analytics"
  | "products"
  | "categories"
  | "reviews"
  | "users"
  | "orders"
  | "settings";

interface NavItem {
  id: Section;
  label: string;
  icon: React.ElementType;
}

const OVERVIEW_ITEMS: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: FiHome },
  { id: "analytics", label: "Analytics", icon: FiBarChart2 },
];
const CATALOG_ITEMS: NavItem[] = [
  { id: "products", label: "Products", icon: FiPackage },
  { id: "categories", label: "Categories", icon: FiShoppingCart },
  { id: "reviews", label: "Reviews", icon: FiStar },
];
const PEOPLE_ITEMS: NavItem[] = [
  { id: "users", label: "Users", icon: FiUsers },
  { id: "orders", label: "Orders", icon: FiShoppingCart },
];
const SETTINGS_ITEMS: NavItem[] = [
  { id: "settings", label: "Settings", icon: FiSettings },
];

const STORE_LINKS = [
  { label: "Visit Store",   path: "/",        icon: FiGlobe },
  { label: "Products Page", path: "/product", icon: FiShoppingBag },
  { label: "About Us",      path: "/about",   icon: FiInfo },
];

const SECTION_TITLES: Record<Section, string> = {
  dashboard: "Dashboard",
  analytics: "Analytics",
  products: "Products",
  categories: "Categories",
  reviews: "Reviews",
  users: "Users",
  orders: "Orders",
  settings: "Settings",
};

function getErrorMessage(err: unknown): string {
  if (err instanceof AxiosError) {
    const data = err.response?.data as { message?: string };
    if (err.response?.status === 401) return "Session expired. Please log in again.";
    return data?.message || err.message || "An error occurred";
  }
  return String(err);
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { token, isAdmin, isLoggedIn, isLoading: authLoading, logout } = useAuth();
  const [colorMode, setColorMode] = useState<"light" | "dark">(
    () => (localStorage.getItem("chakra-ui-color-mode") as "light" | "dark") || "light"
  );

  useEffect(() => {
    document.documentElement.dataset.theme = colorMode;
    const html = document.documentElement;
    if (colorMode === "dark") {
      html.classList.add("dark");
      html.style.colorScheme = "dark";
    } else {
      html.classList.remove("dark");
      html.style.colorScheme = "light";
    }
    localStorage.setItem("chakra-ui-color-mode", colorMode);
  }, [colorMode]);

  const toggleColorMode = () => setColorMode((prev) => (prev === "light" ? "dark" : "light"));

  const { open: sidebarOpen, onOpen: openSidebar, onClose: closeSidebar } = useDisclosure();

  const [activeSection, setActiveSection] = useState<Section>("dashboard");

  const [users, setUsers]                     = useState<User[]>([]);
  const [products, setProducts]               = useState<Product[]>([]);
  const [categories, setCategories]           = useState<Category[]>([]);
  const [reviews, setReviews]                 = useState<Review[]>([]);
  const [orders, setOrders]                   = useState<Order[]>([]);
  const [settings, setSettings]               = useState<SettingsData | null>(null);
  const [settingsForm, setSettingsForm]       = useState<SettingsData>(EMPTY_SETTINGS);

  const [loading, setLoading]                 = useState(true);
  const [refreshing, setRefreshing]           = useState(false);
  const [deletingUserId, setDeletingUserId]   = useState<string | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(null);
  const [deletingReviewId, setDeletingReviewId] = useState<string | null>(null);
  const [togglingReviewId, setTogglingReviewId] = useState<string | null>(null);
  const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [savingSettings, setSavingSettings]   = useState(false);

  const [saving, setSaving]                   = useState(false);
  const [clock, setClock]                     = useState(new Date().toLocaleTimeString());
  const [isProductOpen, setIsProductOpen]     = useState(false);
  const [productForm, setProductForm]         = useState(EMPTY_PRODUCT);
  const [isCategoryOpen, setIsCategoryOpen]   = useState(false);
  const [categoryForm, setCategoryForm]       = useState(EMPTY_CATEGORY);
  const [savingCategory, setSavingCategory]   = useState(false);
  const [statsUsers, setStatsUsers]           = useState<number | null>(null);
  const [statsProducts, setStatsProducts]     = useState<number | null>(null);

  const pageBg      = { base: "gray.50",  _dark: "gray.950" };
  const cardBg      = { base: "white",    _dark: "gray.900" };
  const borderColor = { base: "gray.200", _dark: "gray.700" };

  // ── Auth Guard ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (authLoading) return;
    if (!isLoggedIn) navigate("/auth", { replace: true });
    if (!isAdmin)    navigate("/",     { replace: true });
  }, [authLoading, isLoggedIn, isAdmin, navigate]);

  // ── Token Interceptor ──────────────────────────────────────────────────────
  useEffect(() => {
    const interceptor = API.interceptors.request.use((config) => {
      if (token) config.headers.Authorization = `Bearer ${token.replace("Bearer ", "")}`;
      return config;
    });
    return () => API.interceptors.request.eject(interceptor);
  }, [token]);

  // ── Live Clock ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const id = setInterval(() => setClock(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(id);
  }, []);

  const showToast = (
    title: string,
    type: "success" | "error" | "warning" | "info",
    description?: string
  ) => {
    toaster.create({ title, description, type, duration: type === "error" ? 5000 : 3000 });
  };

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);

    try {
      const [usersRes, productsRes, categoriesRes, reviewsRes, ordersRes, settingsRes] = await Promise.all([
        API.get<{ users: User[] }>("/admin/users"),
        API.get<{ products: Product[] }>("/admin/products"),
        API.get<{ success: boolean; categories: Category[] }>("/admin/categories"),
        API.get<{ success: boolean; reviews: Review[] }>("/admin/reviews"),
        API.get<{ success: boolean; orders: Order[] }>("/admin/orders"),
        API.get<{ success: boolean; settings: SettingsData }>("/admin/settings"),
      ]);
      setUsers(usersRes.data?.users ?? []);
      setProducts(productsRes.data?.products ?? []);
      setCategories(categoriesRes.data?.categories ?? []);
      setReviews(reviewsRes.data?.reviews ?? []);
      setOrders(ordersRes.data?.orders ?? []);
      if (settingsRes.data?.settings) {
        setSettings(settingsRes.data.settings);
        setSettingsForm(settingsRes.data.settings);
      }
    } catch (err) {
      showToast("Failed to load data", "error", getErrorMessage(err));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const res = await API.get<{ success: boolean; users: number; products: number }>("/admin/stats");
      if (res.data?.success) {
        setStatsUsers(res.data.users);
        setStatsProducts(res.data.products);
      }
    } catch (err) {
      console.error("Stats fetch failed", err);
    }
  }, []);

  // ── Initial load ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (authLoading || !isLoggedIn || !isAdmin) return;
    void fetchData();
    void fetchStats();
  }, [authLoading, isLoggedIn, isAdmin, fetchData, fetchStats]);

  // ── Auto-poll every 15s so online/offline counts stay fresh ───────────────
  useEffect(() => {
    if (authLoading || !isLoggedIn || !isAdmin) return;
    const interval = setInterval(() => void fetchData(true), 15_000);
    return () => clearInterval(interval);
  }, [authLoading, isLoggedIn, isAdmin, fetchData]);

  // ── Delete Handlers ────────────────────────────────────────────────────────
  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    setDeletingProductId(id);
    try {
      await API.delete(`/admin/products/${id}`);
      setProducts((prev) => prev.filter((p) => p._id !== id));
      if (statsProducts !== null) setStatsProducts((prev) => (prev ?? 1) - 1);
      showToast("Product deleted", "success");
    } catch (err) {
      showToast("Failed to delete product", "error", getErrorMessage(err));
    } finally {
      setDeletingProductId(null);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm("Delete this user?")) return;
    setDeletingUserId(id);
    try {
      await API.delete(`/admin/users/${id}`);
      setUsers((prev) => prev.filter((u) => u._id !== id));
      if (statsUsers !== null) setStatsUsers((prev) => (prev ?? 1) - 1);
      showToast("User deleted", "success");
    } catch (err) {
      showToast("Failed to delete user", "error", getErrorMessage(err));
    } finally {
      setDeletingUserId(null);
    }
  };

  // ── Add Product Handler ────────────────────────────────────────────────────
  const handleAddProduct = async () => {
    if (!productForm.name.trim() || !productForm.price) {
      showToast("Name and price are required", "warning");
      return;
    }

    let success = false;
    setSaving(true);
    try {
      const payload = {
        name:         productForm.name.trim(),
        description:  productForm.description.trim(),
        price:        parseFloat(String(productForm.price)) || 0,
        countInStock: parseInt(String(productForm.countInStock)) || 0,
        image:        productForm.image.trim() || undefined,
      };

      await API.post("/admin/products", payload);
      showToast("Product added successfully!", "success", `${payload.name} has been added to your catalog.`);
      setProductForm(EMPTY_PRODUCT);
      await fetchData(true);
      success = true;
    } catch (err: unknown) {
      console.error("Add product error:", err);
      showToast("Failed to add product", "error", getErrorMessage(err));
    } finally {
      setSaving(false);
      if (success) setIsProductOpen(false);
    }
  };

  // ── Prevent dialog close while saving ──────────────────────────────────────
  const handleOpenChange = useCallback((details: { open: boolean }) => {
    if (!saving) setIsProductOpen(details.open);
  }, [saving]);

  const handleCategoryOpenChange = useCallback((details: { open: boolean }) => {
    if (!savingCategory) setIsCategoryOpen(details.open);
  }, [savingCategory]);

  // ── Category Handlers ─────────────────────────────────────────────────────
  const handleAddCategory = async () => {
    if (!categoryForm.name.trim()) {
      showToast("Category name is required", "warning");
      return;
    }

    let success = false;
    setSavingCategory(true);
    try {
      const payload = {
        name: categoryForm.name.trim(),
        description: categoryForm.description.trim(),
        image: categoryForm.image.trim(),
      };
      const res = await API.post<{ success: boolean; category: Category }>("/admin/categories", payload);
      setCategories((prev) => [...prev, res.data.category].sort((a, b) => a.name.localeCompare(b.name)));
      showToast("Category added successfully!", "success", `${payload.name} category has been created.`);
      setCategoryForm(EMPTY_CATEGORY);
      success = true;
    } catch (err) {
      showToast("Failed to add category", "error", getErrorMessage(err));
    } finally {
      setSavingCategory(false);
      if (success) setIsCategoryOpen(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Delete this category?")) return;
    setDeletingCategoryId(id);
    try {
      await API.delete(`/admin/categories/${id}`);
      setCategories((prev) => prev.filter((c) => c._id !== id));
      showToast("Category deleted", "success");
    } catch (err) {
      showToast("Failed to delete category", "error", getErrorMessage(err));
    } finally {
      setDeletingCategoryId(null);
    }
  };

  // ── Review Handlers ───────────────────────────────────────────────────────
  const handleToggleReviewApproval = async (id: string) => {
    setTogglingReviewId(id);
    try {
      const res = await API.patch<{ success: boolean; review: Review }>(`/admin/reviews/${id}/approval`);
      setReviews((prev) => prev.map((r) => (r._id === id ? res.data.review : r)));
      showToast("Review updated", "success");
    } catch (err) {
      showToast("Failed to update review", "error", getErrorMessage(err));
    } finally {
      setTogglingReviewId(null);
    }
  };

  const handleDeleteReview = async (id: string) => {
    if (!confirm("Delete this review?")) return;
    setDeletingReviewId(id);
    try {
      await API.delete(`/admin/reviews/${id}`);
      setReviews((prev) => prev.filter((r) => r._id !== id));
      showToast("Review deleted", "success");
    } catch (err) {
      showToast("Failed to delete review", "error", getErrorMessage(err));
    } finally {
      setDeletingReviewId(null);
    }
  };

  // ── Order Handlers ────────────────────────────────────────────────────────
  const handleUpdateOrderStatus = async (id: string, status: string) => {
    setUpdatingOrderId(id);
    try {
      const res = await API.patch<{ success: boolean; order: Order }>(`/admin/orders/${id}/status`, { status });
      setOrders((prev) => prev.map((o) => (o._id === id ? res.data.order : o)));
      showToast("Order status updated", "success");
    } catch (err) {
      showToast("Failed to update order", "error", getErrorMessage(err));
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleDeleteOrder = async (id: string) => {
    if (!confirm("Delete this order?")) return;
    setDeletingOrderId(id);
    try {
      await API.delete(`/admin/orders/${id}`);
      setOrders((prev) => prev.filter((o) => o._id !== id));
      showToast("Order deleted", "success");
    } catch (err) {
      showToast("Failed to delete order", "error", getErrorMessage(err));
    } finally {
      setDeletingOrderId(null);
    }
  };

  // ── Settings Handler ──────────────────────────────────────────────────────
  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      const res = await API.put<{ success: boolean; settings: SettingsData }>("/admin/settings", settingsForm);
      setSettings(res.data.settings);
      setSettingsForm(res.data.settings);
      showToast("Settings saved", "success");
    } catch (err) {
      showToast("Failed to save settings", "error", getErrorMessage(err));
    } finally {
      setSavingSettings(false);
    }
  };

  const goTo = useCallback((section: Section) => {
    setActiveSection(section);
    closeSidebar();
  }, [closeSidebar]);

  const onlineCount          = users.filter((u) => u.isOnline || u.status === "online").length;
  const displayProductCount  = statsProducts ?? products.length;
  const displayUserCount     = statsUsers    ?? users.length;

  // ── Derived analytics from data we already have (no extra API calls) ─────
  const analytics = useMemo(() => {
    const numericProducts = products.map((p) => ({
      name: p.name,
      price: Number(p.price) || 0,
      stock: Number(p.countInStock) || 0,
    }));

    const totalInventoryValue = numericProducts.reduce((sum, p) => sum + p.price * p.stock, 0);
    const totalUnitsInStock   = numericProducts.reduce((sum, p) => sum + p.stock, 0);
    const avgPrice            = numericProducts.length
      ? numericProducts.reduce((sum, p) => sum + p.price, 0) / numericProducts.length
      : 0;
    const outOfStockCount     = numericProducts.filter((p) => p.stock === 0).length;

    const topStock = [...numericProducts]
      .sort((a, b) => b.stock - a.stock)
      .slice(0, 6)
      .map((p) => ({ name: p.name.length > 14 ? `${p.name.slice(0, 14)}…` : p.name, stock: p.stock }));

    const priceBuckets = [
      { label: "₦0–5k",     min: 0,     max: 5000 },
      { label: "₦5k–20k",   min: 5000,  max: 20000 },
      { label: "₦20k–50k",  min: 20000, max: 50000 },
      { label: "₦50k–150k", min: 50000, max: 150000 },
      { label: "₦150k+",    min: 150000, max: Infinity },
    ].map((bucket) => ({
      name: bucket.label,
      count: numericProducts.filter((p) => p.price >= bucket.min && p.price < bucket.max).length,
    }));

    const userStatusData = [
      { name: "Online",  value: onlineCount },
      { name: "Offline", value: users.length - onlineCount },
    ];

    const adminCount = users.filter((u) => u.role === "admin").length;

    return {
      totalInventoryValue,
      totalUnitsInStock,
      avgPrice,
      outOfStockCount,
      topStock,
      priceBuckets,
      userStatusData,
      adminCount,
    };
  }, [products, users, onlineCount]);

  const showSkeleton = authLoading || loading;

  function PanelSkeleton({ rows = 3, compact = false }: { rows?: number; compact?: boolean }) {
    return (
      <Box bg={cardBg} p={6} rounded="2xl" border="1px solid" borderColor={borderColor} shadow="sm">
        <Flex mb={5} align="center">
          <Skeleton height="24px" width={compact ? "96px" : "120px"} rounded="md" />
          <Spacer />
          {!compact && <Skeleton height="40px" width="110px" rounded="md" />}
        </Flex>
        <VStack align="stretch" gap={3}>
          {Array.from({ length: rows }).map((_, index) => (
            <Skeleton key={index} height={compact ? "72px" : "88px"} rounded="xl" />
          ))}
        </VStack>
      </Box>
    );
  }

  function DashboardSkeleton() {
    return (
      <Flex h="100vh" flexDir={{ base: "column", md: "row" }} bg={pageBg}>
        <Box
          display={{ base: "none", md: "block" }}
          w={{ md: "260px", lg: "280px" }}
          bg={cardBg}
          borderRight="1px solid"
          borderColor={borderColor}
          p={4}
          overflowY="auto"
        >
          <Flex align="center" gap={3} mb={8}>
            <Skeleton w="40px" h="40px" rounded="lg" />
            <Skeleton height="28px" width="140px" rounded="md" />
          </Flex>
          <VStack align="stretch" gap={4}>
            {Array.from({ length: 4 }).map((_, index) => (
              <Box key={index}>
                <Skeleton height="12px" width="70px" mb={2} rounded="sm" />
                <Skeleton height="40px" rounded="md" mb={2} />
                <Skeleton height="40px" rounded="md" />
              </Box>
            ))}
          </VStack>
          <Box mt={8}>
            <Skeleton height="12px" width="80px" mb={2} rounded="sm" />
            <Skeleton height="40px" rounded="md" mb={2} />
            <Skeleton height="40px" rounded="md" />
          </Box>
        </Box>

        <Box flex={1} overflowY="auto" p={{ base: 4, md: 6 }}>
          <Flex mb={8} align="center" justify="space-between" flexWrap="wrap" gap={3}>
            <Box w={{ base: "100%", md: "auto" }}>
              <Skeleton height="32px" width="180px" mb={2} rounded="md" />
              <Skeleton height="16px" width="220px" rounded="md" />
            </Box>
            <Flex align="center" gap={4} flexWrap="wrap" justify="flex-end" w={{ base: "100%", md: "auto" }}>
              <Skeleton height="40px" width="40px" rounded="md" />
              <Skeleton height="20px" width="72px" rounded="md" />
              <Skeleton height="40px" width="40px" rounded="md" />
              <Skeleton height="40px" width="120px" rounded="md" />
            </Flex>
          </Flex>

          <Grid templateColumns={{ base: "1fr", sm: "repeat(2,1fr)", md: "repeat(4,1fr)" }} gap={6} mb={10}>
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} height="140px" rounded="2xl" />
            ))}
          </Grid>

          <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={6}>
            <PanelSkeleton rows={3} />
            <PanelSkeleton rows={3} />
          </Grid>
        </Box>
      </Flex>
    );
  }

  if (showSkeleton) {
    return <DashboardSkeleton />;
  }

  // ── Reusable sidebar nav group ───────────────────────────────────────────
  function NavGroup({ title, items }: { title: string; items: NavItem[] }) {
    return (
      <Box>
        <Text fontSize="xs" fontWeight="bold" color="gray.500" mb={2} letterSpacing="wider" textTransform="uppercase">{title}</Text>
        {items.map((item) => {
          const active = activeSection === item.id;
          return (
            <Button
              key={item.id}
              variant={active ? "solid" : "ghost"}
              colorScheme={active ? "blue" : "gray"}
              w="full"
              justifyContent="flex-start"
              mb={1}
              onClick={() => goTo(item.id)}
              fontWeight={active ? "semibold" : "normal"}
              _hover={{
                bg: active ? undefined : { base: "gray.100", _dark: "gray.800" },
              }}
            >
              <Box as={item.icon} mr={3} />
              {item.label}
            </Button>
          );
        })}
      </Box>
    );
  }

  // ── Products panel (shared between Dashboard overview + Products section) ─
  function ProductsPanel({ maxH }: { maxH?: string }) {
    return (
      <Box bg={cardBg} p={6} rounded="2xl" border="1px solid" borderColor={borderColor} shadow="sm" _hover={{ shadow: "md" }} transition="box-shadow 0.2s">
        <Flex mb={5} align="center" flexWrap="wrap" gap={3}>
          <Heading size="md">
            Products <Badge ml={2} colorScheme="blue" variant="solid" rounded="full" px={2}>{displayProductCount}</Badge>
          </Heading>
          <Spacer />
          <Button
            colorScheme="blue"
            bgGradient="linear(to-r, blue.500, blue.600)"
            _hover={{ bgGradient: "linear(to-r, blue.600, blue.700)", shadow: "lg", transform: "translateY(-1px)" }}
            _active={{ transform: "translateY(0)" }}
            onClick={() => setIsProductOpen(true)}
            shadow="md"
            transition="all 0.2s"
          >
            <Box as={FiPlus} mr={2} />
            Add Product
          </Button>
        </Flex>

        <VStack align="stretch" gap={3} maxH={maxH ?? "420px"} overflowY="auto">
          {products.length === 0 ? (
            <Center py={10} color="gray.400">No products yet</Center>
          ) : (
            products.map((p) => (
              <Flex
                key={p._id}
                p={4}
                bg="gray.50" _dark={{ bg: "gray.800" }}
                rounded="xl" align="center"
                _hover={{ shadow: "md", bg: { base: "gray.100", _dark: "gray.700" } }}
                transition="all 0.2s"
              >
                <Box flex={1} minW={0}>
                  <Text fontWeight="semibold" css={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</Text>
                  <Text fontSize="sm" color="gray.500">₦{Number(p.price).toLocaleString()}</Text>
                  <Text fontSize="xs" color="gray.400">Stock: {p.countInStock}</Text>
                </Box>
                <IconButton
                  size="sm"
                  colorScheme="red"
                  variant="ghost"
                  onClick={() => void handleDeleteProduct(p._id)}
                  loading={deletingProductId === p._id}
                  aria-label="Delete product"
                >
                  <Box as={FiTrash2} />
                </IconButton>
              </Flex>
            ))
          )}
        </VStack>
      </Box>
    );
  }

  // ── Users panel (shared between Dashboard overview + Users section) ───────
  function UsersPanel({ maxH }: { maxH?: string }) {
    return (
      <Box bg={cardBg} p={6} rounded="2xl" border="1px solid" borderColor={borderColor} shadow="sm" _hover={{ shadow: "md" }} transition="box-shadow 0.2s">
        <Flex mb={5} align="center">
          <Heading size="md">
            Users <Badge ml={2} variant="solid" colorScheme="gray" rounded="full" px={2}>{displayUserCount}</Badge>
          </Heading>
        </Flex>

        <VStack align="stretch" gap={3} maxH={maxH ?? "420px"} overflowY="auto">
          {users.map((u) => {
            const isOnline = u.isOnline || u.status === "online";
            return (
              <Flex
                key={u._id}
                p={4}
                bg="gray.50" _dark={{ bg: "gray.800" }}
                rounded="xl" align="center" gap={4}
                _hover={{ shadow: "md", bg: { base: "gray.100", _dark: "gray.700" } }}
                transition="all 0.2s"
              >
                <Avatar.Root size="md">
                  <Avatar.Fallback name={u.name} />
                </Avatar.Root>
                <Box flex={1} minW={0}>
                  <Flex align="center" gap={2} flexWrap="wrap">
                    <Text fontWeight="semibold" css={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.name}</Text>
                    {u.role === "admin" && <Badge colorScheme="purple" variant="solid" size="xs">Admin</Badge>}
                  </Flex>
                  <Text fontSize="sm" color="gray.500" css={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.email}</Text>
                </Box>
                <Badge
                  colorScheme={isOnline ? "green" : "gray"}
                  variant="solid"
                  px={3}
                  rounded="full"
                  fontSize="xs"
                >
                  {isOnline ? "Online" : "Offline"}
                </Badge>
                {u.role !== "admin" && (
                  <IconButton
                    size="sm"
                    colorScheme="red"
                    variant="ghost"
                    onClick={() => void handleDeleteUser(u._id)}
                    loading={deletingUserId === u._id}
                    aria-label="Delete user"
                  >
                    <Box as={FiTrash2} />
                  </IconButton>
                )}
              </Flex>
            );
          })}
        </VStack>
      </Box>
    );
  }

  // ── Categories panel ────────────────────────────────────────────────────
  function CategoriesPanel({ maxH }: { maxH?: string }) {
    return (
      <Box bg={cardBg} p={6} rounded="2xl" border="1px solid" borderColor={borderColor} shadow="sm" _hover={{ shadow: "md" }} transition="box-shadow 0.2s">
        <Flex mb={5} align="center" flexWrap="wrap" gap={3}>
          <Heading size="md">
            Categories <Badge ml={2} colorScheme="blue" variant="solid" rounded="full" px={2}>{categories.length}</Badge>
          </Heading>
          <Spacer />
          <Button
            colorScheme="blue"
            bgGradient="linear(to-r, blue.500, blue.600)"
            _hover={{ bgGradient: "linear(to-r, blue.600, blue.700)", shadow: "lg", transform: "translateY(-1px)" }}
            _active={{ transform: "translateY(0)" }}
            onClick={() => setIsCategoryOpen(true)}
            shadow="md"
            transition="all 0.2s"
          >
            <Box as={FiPlus} mr={2} />
            Add Category
          </Button>
        </Flex>

        <Grid templateColumns={{ base: "1fr", sm: "repeat(2,1fr)" }} gap={3} maxH={maxH ?? "420px"} overflowY="auto">
          {categories.length === 0 ? (
            <Center py={10} color="gray.400" gridColumn="1 / -1">No categories yet</Center>
          ) : (
            categories.map((c) => (
              <Flex
                key={c._id}
                p={4}
                bg="gray.50" _dark={{ bg: "gray.800" }}
                rounded="xl" align="center"
                _hover={{ shadow: "md" }}
                transition="all 0.2s"
              >
                <Box flex={1} minW={0}>
                  <Text fontWeight="semibold">{c.name}</Text>
                  <Text fontSize="xs" color="gray.400">/{c.slug}</Text>
                  {c.description && (
                    <Text fontSize="sm" color="gray.500" mt={1} css={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {c.description}
                    </Text>
                  )}
                </Box>
                <IconButton
                  size="sm"
                  colorScheme="red"
                  variant="ghost"
                  onClick={() => void handleDeleteCategory(c._id)}
                  loading={deletingCategoryId === c._id}
                  aria-label="Delete category"
                >
                  <Box as={FiTrash2} />
                </IconButton>
              </Flex>
            ))
          )}
        </Grid>
      </Box>
    );
  }

  // ── Reviews panel ────────────────────────────────────────────────────────
  function ReviewsPanel({ maxH }: { maxH?: string }) {
    return (
      <Box bg={cardBg} p={6} rounded="2xl" border="1px solid" borderColor={borderColor} shadow="sm" _hover={{ shadow: "md" }} transition="box-shadow 0.2s">
        <Flex mb={5} align="center">
          <Heading size="md">
            Reviews <Badge ml={2} variant="solid" colorScheme="yellow" rounded="full" px={2}>{reviews.length}</Badge>
          </Heading>
        </Flex>

        <VStack align="stretch" gap={3} maxH={maxH ?? "420px"} overflowY="auto">
          {reviews.length === 0 ? (
            <Center py={10} color="gray.400">No reviews yet</Center>
          ) : (
            reviews.map((r) => (
              <Box
                key={r._id}
                p={4}
                bg="gray.50" _dark={{ bg: "gray.800" }}
                rounded="xl"
                _hover={{ shadow: "md" }}
                transition="all 0.2s"
              >
                <Flex align="center" justify="space-between" mb={2} flexWrap="wrap" gap={2}>
                  <Flex align="center" gap={2}>
                    <Badge colorScheme="yellow" variant="solid" px={2} rounded="full">★ {r.rating}/5</Badge>
                    <Text fontSize="sm" fontWeight="semibold">
                      {r.product?.name ?? "Deleted product"}
                    </Text>
                  </Flex>
                  <Badge colorScheme={r.isApproved ? "green" : "gray"} variant="subtle" rounded="full" px={2}>
                    {r.isApproved ? "Approved" : "Hidden"}
                  </Badge>
                </Flex>

                {r.comment && (
                  <Text fontSize="sm" color="gray.600" _dark={{ color: "gray.300" }} mb={2} fontStyle="italic">
                    "{r.comment}"
                  </Text>
                )}

                <Flex align="center" justify="space-between" flexWrap="wrap" gap={2}>
                  <Text fontSize="xs" color="gray.400">
                    {r.user?.name ?? "Unknown user"} · {new Date(r.createdAt).toLocaleDateString()}
                  </Text>
                  <Flex gap={1}>
                    <IconButton
                      size="sm"
                      variant="ghost"
                      colorScheme={r.isApproved ? "orange" : "green"}
                      aria-label="Toggle approval"
                      onClick={() => void handleToggleReviewApproval(r._id)}
                      loading={togglingReviewId === r._id}
                    >
                      <Box as={r.isApproved ? FiXCircle : FiCheckCircle} />
                    </IconButton>
                    <IconButton
                      size="sm"
                      colorScheme="red"
                      variant="ghost"
                      aria-label="Delete review"
                      onClick={() => void handleDeleteReview(r._id)}
                      loading={deletingReviewId === r._id}
                    >
                      <Box as={FiTrash2} />
                    </IconButton>
                  </Flex>
                </Flex>
              </Box>
            ))
          )}
        </VStack>
      </Box>
    );
  }

  // ── Orders panel ─────────────────────────────────────────────────────────
  function OrdersPanel({ maxH }: { maxH?: string }) {
    return (
      <Box bg={cardBg} p={6} rounded="2xl" border="1px solid" borderColor={borderColor} shadow="sm" _hover={{ shadow: "md" }} transition="box-shadow 0.2s">
        <Flex mb={5} align="center">
          <Heading size="md">
            Orders <Badge ml={2} variant="solid" colorScheme="orange" rounded="full" px={2}>{orders.length}</Badge>
          </Heading>
        </Flex>

        <VStack align="stretch" gap={3} maxH={maxH ?? "420px"} overflowY="auto">
          {orders.length === 0 ? (
            <Center py={10} color="gray.400">No orders yet</Center>
          ) : (
            orders.map((o) => (
              <Box
                key={o._id}
                p={4}
                bg="gray.50" _dark={{ bg: "gray.800" }}
                rounded="xl"
                _hover={{ shadow: "md" }}
                transition="all 0.2s"
              >
                <Flex align="center" justify="space-between" mb={2} flexWrap="wrap" gap={2}>
                  <Box minW={0}>
                    <Text fontWeight="semibold" css={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{o.user?.name ?? "Unknown customer"}</Text>
                    <Text fontSize="xs" color="gray.400">{o.user?.email}</Text>
                  </Box>
                  <Badge colorScheme={o.paymentStatus === "paid" ? "green" : "orange"} variant="solid" rounded="full" px={2} fontSize="xs">
                    {o.paymentStatus}
                  </Badge>
                </Flex>

                <Text fontSize="sm" color="gray.500" mb={2}>
                  {o.items.length} item{o.items.length === 1 ? "" : "s"} · ₦{Number(o.totalPrice).toLocaleString()} · {new Date(o.createdAt).toLocaleDateString()}
                </Text>

                <Flex align="center" justify="space-between" gap={3} flexWrap="wrap">
                  <select
                    value={o.status}
                    disabled={updatingOrderId === o._id}
                    onChange={(e) => void handleUpdateOrderStatus(o._id, e.target.value)}
                    style={{
                      padding: "8px 12px",
                      borderRadius: "8px",
                      border: "1px solid rgba(160,174,192,0.4)",
                      fontSize: "13px",
                      background: "transparent",
                      cursor: updatingOrderId === o._id ? "not-allowed" : "pointer",
                    }}
                  >
                    {ORDER_STATUSES.map((s) => (
                      <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                    ))}
                  </select>

                  <IconButton
                    size="sm"
                    colorScheme="red"
                    variant="ghost"
                    aria-label="Delete order"
                    onClick={() => void handleDeleteOrder(o._id)}
                    loading={deletingOrderId === o._id}
                  >
                    <Box as={FiTrash2} />
                  </IconButton>
                </Flex>
              </Box>
            ))
          )}
        </VStack>
      </Box>
    );
  }

  // ── Settings panel ───────────────────────────────────────────────────────
  function SettingsPanel() {
    if (!settings) {
      return (
        <Box bg={cardBg} p={10} rounded="2xl" border="1px solid" borderColor={borderColor} shadow="sm">
          <Center py={10} color="gray.400">Loading settings…</Center>
        </Box>
      );
    }

    return (
      <Box bg={cardBg} p={6} rounded="2xl" border="1px solid" borderColor={borderColor} shadow="sm" maxW="740px" w="full" mx="auto">
        <Heading size="md" mb={6}>Store Settings</Heading>

        <Stack gap={5}>
          {/* ── Theme Toggle ──────────────────────────────────────────────── */}
          <Flex
            align="center"
            justify="space-between"
            p={4}
            bg="gray.50"
            _dark={{ bg: "gray.800" }}
            rounded="xl"
            border="1px solid"
            borderColor={borderColor}
          >
            <Box>
              <Flex align="center" gap={2}>
                <Box as={colorMode === "dark" ? FiMoon : FiSun} color={colorMode === "dark" ? "yellow.400" : "orange.400"} />
                <Text fontWeight="semibold" fontSize="sm">
                  {colorMode === "dark" ? "Dark Mode" : "Light Mode"}
                </Text>
              </Flex>
              <Text fontSize="xs" color="gray.500" mt={1}>
                Toggle between light and dark theme
              </Text>
            </Box>
            <Button
              colorScheme={colorMode === "dark" ? "yellow" : "orange"}
              variant="outline"
              size="sm"
              onClick={toggleColorMode}
            >
              <Box as={colorMode === "dark" ? FiSun : FiMoon} mr={2} />
              Switch to {colorMode === "dark" ? "Light" : "Dark"}
            </Button>
          </Flex>

          <Field.Root>
            <FieldLabel>Store Name</FieldLabel>
            <Input
              value={settingsForm.storeName}
              onChange={(e) => setSettingsForm({ ...settingsForm, storeName: e.target.value })}
              size="lg"
            />
          </Field.Root>

          <Field.Root>
            <FieldLabel>
              <Flex align="center" gap={2}>
                <Box as={FiFileText} color="gray.500" />
                Store Description
              </Flex>
            </FieldLabel>
            <Textarea
              value={settingsForm.storeDescription}
              onChange={(e) => setSettingsForm({ ...settingsForm, storeDescription: e.target.value })}
              size="lg"
              placeholder="A short description of your store…"
              rows={3}
            />
          </Field.Root>

          <Field.Root>
            <FieldLabel>
              <Flex align="center" gap={2}>
                <Box as={FiMail} color="gray.500" />
                Support Email
              </Flex>
            </FieldLabel>
            <Input
              type="email"
              value={settingsForm.supportEmail}
              onChange={(e) => setSettingsForm({ ...settingsForm, supportEmail: e.target.value })}
              size="lg"
            />
          </Field.Root>

          <Flex gap={4} direction={{ base: "column", sm: "row" }}>
            <Field.Root flex={1}>
              <FieldLabel>
                <Flex align="center" gap={2}>
                  <Box as={FiPhone} color="gray.500" />
                  Phone Number
                </Flex>
              </FieldLabel>
              <Input
                type="tel"
                value={settingsForm.storePhone}
                onChange={(e) => setSettingsForm({ ...settingsForm, storePhone: e.target.value })}
                size="lg"
                placeholder="+234 800 000 0000"
              />
            </Field.Root>
            <Field.Root flex={1}>
              <FieldLabel>
                <Flex align="center" gap={2}>
                  <Box as={FiMapPin} color="gray.500" />
                  Store Address
                </Flex>
              </FieldLabel>
              <Input
                value={settingsForm.storeAddress}
                onChange={(e) => setSettingsForm({ ...settingsForm, storeAddress: e.target.value })}
                size="lg"
                placeholder="123 Main St, City"
              />
            </Field.Root>
          </Flex>

          <Field.Root>
            <FieldLabel>
              <Flex align="center" gap={2}>
                <Box as={FiClock} color="gray.500" />
                Working Hours
              </Flex>
            </FieldLabel>
            <Input
              value={settingsForm.workingHours}
              onChange={(e) => setSettingsForm({ ...settingsForm, workingHours: e.target.value })}
              size="lg"
              placeholder="Mon–Fri: 9am–6pm, Sat: 10am–4pm"
            />
          </Field.Root>

          <Flex gap={4} direction={{ base: "column", sm: "row" }}>
            <Field.Root flex={1}>
              <FieldLabel>Currency</FieldLabel>
              <Input
                value={settingsForm.currency}
                onChange={(e) => setSettingsForm({ ...settingsForm, currency: e.target.value.toUpperCase() })}
                size="lg"
                maxLength={3}
              />
            </Field.Root>
            <Field.Root flex={1}>
              <FieldLabel>Tax Rate (%)</FieldLabel>
              <Input
                type="number"
                value={settingsForm.taxRate}
                onChange={(e) => setSettingsForm({ ...settingsForm, taxRate: Number(e.target.value) || 0 })}
                size="lg"
              />
            </Field.Root>
          </Flex>

          <Flex gap={4} direction={{ base: "column", sm: "row" }}>
            <Field.Root flex={1}>
              <FieldLabel>Shipping Fee (₦)</FieldLabel>
              <Input
                type="number"
                value={settingsForm.shippingFee}
                onChange={(e) => setSettingsForm({ ...settingsForm, shippingFee: Number(e.target.value) || 0 })}
                size="lg"
              />
            </Field.Root>
            <Field.Root flex={1}>
              <FieldLabel>Free Shipping Threshold (₦)</FieldLabel>
              <Input
                type="number"
                value={settingsForm.freeShippingThreshold}
                onChange={(e) => setSettingsForm({ ...settingsForm, freeShippingThreshold: Number(e.target.value) || 0 })}
                size="lg"
              />
            </Field.Root>
          </Flex>

          <Flex align="center" justify="space-between" p={4} bg="gray.50" _dark={{ bg: "gray.800" }} rounded="xl">
            <Box>
              <Text fontWeight="semibold" fontSize="sm">Maintenance Mode</Text>
              <Text fontSize="xs" color="gray.500">Temporarily disable the storefront for customers</Text>
            </Box>
            <Switch.Root
              checked={settingsForm.maintenanceMode}
              onCheckedChange={(details) => setSettingsForm({ ...settingsForm, maintenanceMode: details.checked })}
            >
              <Switch.HiddenInput />
              <Switch.Control>
                <Switch.Thumb />
              </Switch.Control>
            </Switch.Root>
          </Flex>

          <Button
            colorScheme="blue"
            bgGradient="linear(to-r, blue.500, blue.600)"
            _hover={{ bgGradient: "linear(to-r, blue.600, blue.700)", shadow: "lg", transform: "translateY(-1px)" }}
            _active={{ transform: "translateY(0)" }}
            size="lg"
            alignSelf="flex-start"
            onClick={() => void handleSaveSettings()}
            disabled={savingSettings}
            shadow="md"
            transition="all 0.2s"
          >
            {savingSettings ? (
              <Flex align="center" gap={2}>
                <Spinner size="sm" />
                Saving…
              </Flex>
            ) : (
              "Save Settings"
            )}
          </Button>
        </Stack>
      </Box>
    );
  }

  // ── Analytics panel — derived entirely from products & users already loaded ─
  const PIE_COLORS = ["#38A169", "#A0AEC0"]; // green (online), gray (offline)

  function AnalyticsPanel() {
    return (
      <VStack align="stretch" gap={6}>
        {/* Quick stat row */}
        <Grid templateColumns={{ base: "1fr", sm: "repeat(2,1fr)", md: "repeat(4,1fr)" }} gap={6}>
          {[
            { label: "Inventory Value", value: `₦${analytics.totalInventoryValue.toLocaleString()}`, sub: "Price × stock, all products", icon: FiDollarSign, color: "blue.600" },
            { label: "Units in Stock",  value: analytics.totalUnitsInStock.toLocaleString(),          sub: "Across all products",        icon: FiBox,        color: "green.500" },
            { label: "Avg. Price",      value: `₦${Math.round(analytics.avgPrice).toLocaleString()}`, sub: "Per product",                icon: FiTrendingUp, color: "purple.500" },
            { label: "Out of Stock",    value: analytics.outOfStockCount,                              sub: "Products at 0 stock",         icon: FiPackage,    color: "orange.500" },
          ].map((stat) => (
            <Box key={stat.label} bg={cardBg} p={6} rounded="2xl" border="1px solid" borderColor={borderColor} shadow="sm" _hover={{ shadow: "md" }} transition="box-shadow 0.2s">
              <Flex align="center" justify="space-between" mb={2}>
                <Text fontSize="sm" color="gray.500">{stat.label}</Text>
                <Box as={stat.icon} color={stat.color} boxSize={5} />
              </Flex>
              <Heading size="2xl" color={stat.color}>{stat.value}</Heading>
              <Text fontSize="xs" color="gray.400" mt={1}>{stat.sub}</Text>
            </Box>
          ))}
        </Grid>

        <Grid templateColumns={{ base: "1fr", lg: "3fr 2fr" }} gap={6}>
          {/* Stock levels bar chart */}
          <Box bg={cardBg} p={6} rounded="2xl" border="1px solid" borderColor={borderColor} shadow="sm" _hover={{ shadow: "md" }} transition="box-shadow 0.2s">
            <Heading size="md" mb={4}>Top Products by Stock</Heading>
            {analytics.topStock.length === 0 ? (
              <Center py={16} color="gray.400">No product data yet</Center>
            ) : (
              <Box h="280px">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.topStock} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(160,174,192,0.2)" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="stock" fill="#3182CE" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            )}
          </Box>

          {/* Online vs offline pie */}
          <Box bg={cardBg} p={6} rounded="2xl" border="1px solid" borderColor={borderColor} shadow="sm" _hover={{ shadow: "md" }} transition="box-shadow 0.2s">
            <Heading size="md" mb={4}>User Activity</Heading>
            {users.length === 0 ? (
              <Center py={16} color="gray.400">No user data yet</Center>
            ) : (
              <Box h="280px">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.userStatusData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                    >
                      {analytics.userStatusData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={30} />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            )}
            <Text fontSize="xs" color="gray.400" mt={2} textAlign="center">
              {analytics.adminCount} admin{analytics.adminCount === 1 ? "" : "s"} · {users.length} total user{users.length === 1 ? "" : "s"}
            </Text>
          </Box>
        </Grid>

        {/* Price distribution */}
        <Box bg={cardBg} p={6} rounded="2xl" border="1px solid" borderColor={borderColor} shadow="sm" _hover={{ shadow: "md" }} transition="box-shadow 0.2s">
          <Heading size="md" mb={4}>Price Distribution</Heading>
          {products.length === 0 ? (
            <Center py={16} color="gray.400">No product data yet</Center>
          ) : (
            <Box h="240px">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.priceBuckets} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(160,174,192,0.2)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#805AD5" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          )}
        </Box>

        <Text fontSize="xs" color="gray.400" textAlign="center">
          Calculated live from your current products and users — no separate analytics backend required.
        </Text>
      </VStack>
    );
  }

  // ── Section content switch ─────────────────────────────────────────────
  function SectionContent() {
    switch (activeSection) {
      case "dashboard":
        return (
          <>
            <Grid templateColumns={{ base: "1fr", sm: "repeat(2,1fr)", md: "repeat(4,1fr)" }} gap={6} mb={10}>
              {[
                { label: "Products",    value: displayProductCount,          sub: "In catalog",      color: "blue.600"   },
                { label: "Users",       value: displayUserCount,             sub: "Registered",      color: "gray.700"   },
                { label: "Online Now",  value: onlineCount,                  sub: "Active sessions", color: "green.500"  },
                { label: "Offline",     value: users.length - onlineCount,   sub: "Inactive",        color: "orange.500" },
              ].map((stat, i) => (
                <Box key={i} bg={cardBg} p={6} rounded="2xl" border="1px solid" borderColor={borderColor} shadow="sm" _hover={{ shadow: "md" }} transition="box-shadow 0.2s">
                  <Text fontSize="sm" color="gray.500">{stat.label}</Text>
                  <Heading size="3xl" color={stat.color} mt={2}>{stat.value}</Heading>
                  <Text fontSize="xs" color="gray.400" mt={1}>{stat.sub}</Text>
                </Box>
              ))}
            </Grid>

            <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={6}>
              <ProductsPanel maxH="380px" />
              <UsersPanel maxH="380px" />
            </Grid>
          </>
        );

      case "products":
        return <ProductsPanel maxH="calc(100vh - 320px)" />;

      case "users":
        return <UsersPanel maxH="calc(100vh - 320px)" />;

      case "analytics":
        return <AnalyticsPanel />;

      case "categories":
        return <CategoriesPanel maxH="calc(100vh - 320px)" />;

      case "reviews":
        return <ReviewsPanel maxH="calc(100vh - 320px)" />;

      case "orders":
        return <OrdersPanel maxH="calc(100vh - 320px)" />;

      case "settings":
        return <SettingsPanel />;

      default:
        return null;
    }
  }

  return (
    <Flex h="100vh" flexDir={{ base: "column", md: "row" }} bg={pageBg}>
      {/* ── Sidebar ──────────────────────────────────────────────────────── */}
      <Box
        display={{ base: "none", md: "flex" }}
        w={{ md: "260px", lg: "280px" }}
        bg={cardBg}
        borderRight="1px solid"
        borderColor={borderColor}
        p={4}
        overflowY="auto"
        flexDir="column"
        position="sticky"
        top={0}
        h="100vh"
      >
        <Flex align="center" gap={3} mb={8}>
          <Box
            w="40px" h="40px"
            bg="blue.600" color="white"
            borderRadius="lg"
            display="flex" alignItems="center" justifyContent="center"
            fontWeight="bold" fontSize="xl"
            shadow="md"
          >
            S
          </Box>
          <Heading size="lg" fontSize={{ lg: "xl" }}>StoreAdmin</Heading>
        </Flex>

        <VStack align="stretch" gap={6} flex={1}>
          <NavGroup title="OVERVIEW" items={OVERVIEW_ITEMS} />
          <NavGroup title="CATALOG" items={CATALOG_ITEMS} />
          <NavGroup title="PEOPLE" items={PEOPLE_ITEMS} />
          <NavGroup title="SETTINGS" items={SETTINGS_ITEMS} />

          {/* ── Store Links Section ─────────────────────────────────────── */}
          <Box>
            <Separator mb={4} />
            <Text fontSize="xs" fontWeight="bold" color="gray.500" mb={2} letterSpacing="wider" textTransform="uppercase">
              <Flex align="center" gap={1}>
                <Box as={FiExternalLink} fontSize="12px" />
                STORE LINKS
              </Flex>
            </Text>
            {STORE_LINKS.map((link) => (
              <Button
                key={link.path}
                variant="ghost"
                colorScheme="gray"
                w="full"
                justifyContent="flex-start"
                mb={1}
                size="sm"
                onClick={() => navigate(link.path)}
                _hover={{ bg: { base: "gray.100", _dark: "gray.800" }, color: "blue.500" }}
              >
                <Box as={link.icon} mr={2} fontSize="14px" />
                {link.label}
              </Button>
            ))}
          </Box>
        </VStack>
      </Box>

      {/* ── Main Content ─────────────────────────────────────────────────── */}
      <Box flex={1} overflowY="auto" p={{ base: 3, sm: 4, md: 6 }}>
        {/* Header */}
        <Flex mb={6} align="center" justify="space-between" flexWrap="wrap" gap={3}>
          <Box w={{ base: "100%", md: "auto" }}>
            <Heading size="lg">{SECTION_TITLES[activeSection]}</Heading>
            <Text fontSize="sm" color="gray.500">
              {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </Text>
          </Box>

          <HStack gap={3} flexWrap="wrap" justify={{ base: "space-between", md: "flex-end" }} w={{ base: "100%", md: "auto" }}>
            <IconButton
              aria-label="Open menu"
              display={{ base: "inline-flex", md: "none" }}
              variant="ghost"
              onClick={openSidebar}
              size="md"
            >
              <Box as={FiMenu} />
            </IconButton>
            <IconButton
              aria-label="Toggle color mode"
              variant="ghost"
              size="md"
              onClick={toggleColorMode}
            >
              <Box as={colorMode === "dark" ? FiSun : FiMoon} />
            </IconButton>
            <Text fontVariantNumeric="tabular-nums" color="gray.500" fontSize="sm">{clock}</Text>
            <IconButton
              aria-label="Refresh"
              variant="ghost"
              onClick={() => void fetchData(true)}
              loading={refreshing}
              size="md"
            >
              <FiRefreshCw />
            </IconButton>
            <Button variant="outline" colorScheme="red" size="md" onClick={() => void logout()}>
              <Box as={FiLogOut} mr={2} />
              Log out
            </Button>
          </HStack>
        </Flex>

        <SectionContent />
      </Box>

      {/* ── Mobile Sidebar Drawer ────────────────────────────────────────── */}
      <DrawerRoot open={sidebarOpen} placement="start" onOpenChange={(details) => { if (!details.open) closeSidebar(); }}>
        <DrawerBackdrop />
        <DrawerPositioner>
          <DrawerContent>
            {/* ── Mobile Drawer Header with Close Button ────────────────── */}
            <Flex align="center" justify="space-between" px={4} pt={4} pb={0}>
              <Flex align="center" gap={3}>
                <Box
                  w="36px" h="36px"
                  bg="blue.600" color="white"
                  borderRadius="lg"
                  display="flex" alignItems="center" justifyContent="center"
                  fontWeight="bold"
                >
                  S
                </Box>
                <Heading size="md">StoreAdmin</Heading>
              </Flex>
              <IconButton
                aria-label="Close menu"
                variant="ghost"
                colorScheme="red"
                size="lg"
                onClick={closeSidebar}
              >
                <Box as={FiXCircle} fontSize="24px" />
              </IconButton>
            </Flex>
            <DrawerCloseTrigger />
            <DrawerBody>
              <VStack align="stretch" gap={6} mt={4}>
                <NavGroup title="OVERVIEW" items={OVERVIEW_ITEMS} />
                <NavGroup title="CATALOG" items={CATALOG_ITEMS} />
                <NavGroup title="PEOPLE" items={PEOPLE_ITEMS} />
                <NavGroup title="SETTINGS" items={SETTINGS_ITEMS} />

                {/* ── Mobile Store Links ────────────────────────────────── */}
                <Box>
                  <Separator mb={4} />
                  <Text fontSize="xs" fontWeight="bold" color="gray.500" mb={2} letterSpacing="wider" textTransform="uppercase">
                    <Flex align="center" gap={1}>
                      <Box as={FiExternalLink} fontSize="12px" />
                      STORE LINKS
                    </Flex>
                  </Text>
                  {STORE_LINKS.map((link) => (
                    <Button
                      key={link.path}
                      variant="ghost"
                      colorScheme="gray"
                      w="full"
                      justifyContent="flex-start"
                      mb={1}
                      size="sm"
                      onClick={() => { navigate(link.path); closeSidebar(); }}
                      _hover={{ bg: { base: "gray.100", _dark: "gray.800" }, color: "blue.500" }}
                    >
                      <Box as={link.icon} mr={2} fontSize="14px" />
                      {link.label}
                    </Button>
                  ))}
                </Box>

                {/* ── Mobile Theme Toggle ──────────────────────────────── */}
                <Box>
                  <Separator mb={4} />
                  <Button
                    variant="ghost"
                    colorScheme="gray"
                    w="full"
                    justifyContent="flex-start"
                    size="sm"
                    onClick={toggleColorMode}
                    _hover={{ bg: { base: "gray.100", _dark: "gray.800" }, color: "blue.500" }}
                  >
                    <Box as={colorMode === "dark" ? FiSun : FiMoon} mr={2} />
                    Switch to {colorMode === "dark" ? "Light" : "Dark"} Mode
                  </Button>
                </Box>
              </VStack>
            </DrawerBody>
          </DrawerContent>
        </DrawerPositioner>
      </DrawerRoot>

      {/* ── Add Product Dialog ────────────────────────────────────────────── */}
      <DialogRoot open={isProductOpen} onOpenChange={handleOpenChange} closeOnInteractOutside={!saving}>
        <DialogBackdrop />
        <DialogPositioner>
          <DialogContent position="relative" overflow="hidden" rounded="2xl" shadow="2xl" borderWidth="1px" borderColor={borderColor}>
            {/* ── Loading Overlay (blur + spinner) ──────────────────────────── */}
            {saving && (
              <Box
                position="absolute"
                inset="0"
                bg="rgba(255,255,255,0.85)"
                _dark={{ bg: "rgba(0,0,0,0.85)" }}
                backdropFilter="blur(6px)"
                display="flex"
                alignItems="center"
                justifyContent="center"
                zIndex={10}
                rounded="2xl"
              >
                <VStack gap={4}>
                  <Spinner
                    width="48px"
                    height="48px"
                    borderWidth="4px"
                    color="blue.500"
                  />
                  <Text fontWeight="semibold" fontSize="lg" color="gray.700" _dark={{ color: "gray.200" }}>
                    Saving product…
                  </Text>
                </VStack>
              </Box>
            )}

            <DialogHeader pb={2}>
              <DialogTitle fontSize="xl">Add New Product</DialogTitle>
              <DialogDescription color="gray.500" fontSize="sm">
                Fill in the details below to add a new product to your catalog.
              </DialogDescription>
            </DialogHeader>
            <DialogBody>
              <Fieldset.Root disabled={saving}>
                <Stack gap={5}>
                  {/* Product Name */}
                  <Field.Root required>
                    <FieldLabel>
                      <Flex align="center" gap={2}>
                        <Box as={FiPackageIcon} color="gray.500" />
                        Product Name
                      </Flex>
                    </FieldLabel>
                    <Input
                      placeholder="e.g. Wireless Headphones"
                      value={productForm.name}
                      onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                      size="lg"
                      _placeholder={{ color: "gray.400" }}
                    />
                    <FieldErrorText />
                  </Field.Root>

                  {/* Price & Stock side-by-side */}
                  <Flex gap={4} direction={{ base: "column", sm: "row" }}>
                    <Field.Root required flex={2}>
                      <FieldLabel>
                        <Flex align="center" gap={2}>
                          <Box as={FiDollarSign} color="gray.500" />
                          Price (₦)
                        </Flex>
                      </FieldLabel>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={productForm.price}
                        onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                        size="lg"
                        _placeholder={{ color: "gray.400" }}
                      />
                      <FieldErrorText />
                    </Field.Root>
                    <Field.Root flex={1}>
                      <FieldLabel>
                        <Flex align="center" gap={2}>
                          Stock
                        </Flex>
                      </FieldLabel>
                      <Input
                        type="number"
                        placeholder="0"
                        value={productForm.countInStock}
                        onChange={(e) => setProductForm({ ...productForm, countInStock: e.target.value })}
                        size="lg"
                        _placeholder={{ color: "gray.400" }}
                      />
                      <FieldErrorText />
                    </Field.Root>
                  </Flex>

                  {/* Image URL */}
                  <Field.Root>
                    <FieldLabel>
                      <Flex align="center" gap={2}>
                        <Box as={FiImage} color="gray.500" />
                        Image URL
                      </Flex>
                    </FieldLabel>
                    <Input
                      placeholder="https://example.com/image.jpg"
                      value={productForm.image}
                      onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                      size="lg"
                      _placeholder={{ color: "gray.400" }}
                    />
                    <FieldErrorText />
                  </Field.Root>

                  {/* Description */}
                  <Field.Root>
                    <FieldLabel>
                      <Flex align="center" gap={2}>
                        <Box as={FiFileText} color="gray.500" />
                        Description
                      </Flex>
                    </FieldLabel>
                    <Input
                      placeholder="A short description of the product…"
                      value={productForm.description}
                      onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                      size="lg"
                      _placeholder={{ color: "gray.400" }}
                    />
                    <FieldErrorText />
                  </Field.Root>
                </Stack>
              </Fieldset.Root>
            </DialogBody>
            <DialogFooter gap={3} pt={4} borderTop="1px solid" borderColor={borderColor} flexDir={{ base: "column-reverse", sm: "row" }}>
              <Button
                variant="ghost"
                onClick={() => setIsProductOpen(false)}
                disabled={saving}
                size="lg"
                w={{ base: "full", sm: "auto" }}
              >
                Cancel
              </Button>
              <Button
                colorScheme="blue"
                bgGradient="linear(to-r, blue.500, blue.600)"
                _hover={{ bgGradient: "linear(to-r, blue.600, blue.700)", shadow: "lg" }}
                size="lg"
                px={6}
                w={{ base: "full", sm: "auto" }}
                onClick={() => void handleAddProduct()}
                disabled={saving}
                shadow="md"
                transition="all 0.2s"
              >
                {saving ? (
                  <Flex align="center" gap={2}>
                    <Spinner size="sm" />
                    Saving…
                  </Flex>
                ) : (
                  <Flex align="center" gap={2}>
                    <Box as={FiCheckCircle} />
                    Save Product
                  </Flex>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </DialogPositioner>
      </DialogRoot>

      {/* ── Add Category Dialog ───────────────────────────────────────────── */}
      <DialogRoot open={isCategoryOpen} onOpenChange={handleCategoryOpenChange} closeOnInteractOutside={!savingCategory}>
        <DialogBackdrop />
        <DialogPositioner>
          <DialogContent position="relative" overflow="hidden" rounded="2xl" shadow="2xl" borderWidth="1px" borderColor={borderColor}>
            {savingCategory && (
              <Box
                position="absolute"
                inset="0"
                bg="rgba(255,255,255,0.85)"
                _dark={{ bg: "rgba(0,0,0,0.85)" }}
                backdropFilter="blur(6px)"
                display="flex"
                alignItems="center"
                justifyContent="center"
                zIndex={10}
                rounded="2xl"
              >
                <VStack gap={4}>
                  <Spinner width="48px" height="48px" borderWidth="4px" color="blue.500" />
                  <Text fontWeight="semibold" fontSize="lg" color="gray.700" _dark={{ color: "gray.200" }}>
                    Saving category…
                  </Text>
                </VStack>
              </Box>
            )}

            <DialogHeader pb={2}>
              <DialogTitle fontSize="xl">Add New Category</DialogTitle>
              <DialogDescription color="gray.500" fontSize="sm">
                Create a category to organize your products.
              </DialogDescription>
            </DialogHeader>
            <DialogBody>
              <Fieldset.Root disabled={savingCategory}>
                <Stack gap={5}>
                  <Field.Root required>
                    <FieldLabel>
                      <Flex align="center" gap={2}>
                        <Box as={FiTag} color="gray.500" />
                        Category Name
                      </Flex>
                    </FieldLabel>
                    <Input
                      placeholder="e.g. Footwear"
                      value={categoryForm.name}
                      onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                      size="lg"
                      _placeholder={{ color: "gray.400" }}
                    />
                    <FieldErrorText />
                  </Field.Root>

                  <Field.Root>
                    <FieldLabel>
                      <Flex align="center" gap={2}>
                        <Box as={FiImage} color="gray.500" />
                        Image URL
                      </Flex>
                    </FieldLabel>
                    <Input
                      placeholder="https://example.com/image.jpg"
                      value={categoryForm.image}
                      onChange={(e) => setCategoryForm({ ...categoryForm, image: e.target.value })}
                      size="lg"
                      _placeholder={{ color: "gray.400" }}
                    />
                    <FieldErrorText />
                  </Field.Root>

                  <Field.Root>
                    <FieldLabel>
                      <Flex align="center" gap={2}>
                        <Box as={FiFileText} color="gray.500" />
                        Description
                      </Flex>
                    </FieldLabel>
                    <Input
                      placeholder="A short description of the category…"
                      value={categoryForm.description}
                      onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                      size="lg"
                      _placeholder={{ color: "gray.400" }}
                    />
                    <FieldErrorText />
                  </Field.Root>
                </Stack>
              </Fieldset.Root>
            </DialogBody>
            <DialogFooter gap={3} pt={4} borderTop="1px solid" borderColor={borderColor} flexDir={{ base: "column-reverse", sm: "row" }}>
              <Button variant="ghost" onClick={() => setIsCategoryOpen(false)} disabled={savingCategory} size="lg" w={{ base: "full", sm: "auto" }}>
                Cancel
              </Button>
              <Button
                colorScheme="blue"
                bgGradient="linear(to-r, blue.500, blue.600)"
                _hover={{ bgGradient: "linear(to-r, blue.600, blue.700)", shadow: "lg" }}
                size="lg"
                px={6}
                w={{ base: "full", sm: "auto" }}
                onClick={() => void handleAddCategory()}
                disabled={savingCategory}
                shadow="md"
                transition="all 0.2s"
              >
                {savingCategory ? (
                  <Flex align="center" gap={2}>
                    <Spinner size="sm" />
                    Saving…
                  </Flex>
                ) : (
                  <Flex align="center" gap={2}>
                    <Box as={FiCheckCircle} />
                    Save Category
                  </Flex>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </DialogPositioner>
      </DialogRoot>

      <Toaster toaster={toaster}>{() => null}</Toaster>
    </Flex>
  );
}