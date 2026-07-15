import { useEffect, useState } from "react";
import { IProduct } from "@/interface/iproducts";
import Card from "@/Component/Card";
import Cart from "./Cart";
import Searchbox from "@/Component/searchbox";
import Navbar from "@/Component/nav";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { FaShoppingCart } from "react-icons/fa";
// import { ArrowLeft } from "lucide-react";

import {
  Box,
  Button,
} from "@chakra-ui/react";

type IProductWithQuantity = IProduct & {
  quantity: number;
};

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://e-commerce-store-backend-0exy.onrender.com/api";

const Product = () => {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [cartItems, setCartItems] = useState<IProductWithQuantity[]>([]);
  const [ViewCart, setViewCart] = useState(false);
  const [filteredproducts, setfilterProducts] = useState<IProduct[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOnlineMessage, setShowOnlineMessage] = useState(false);

  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOnlineMessage(true);

      setTimeout(() => {
        setShowOnlineMessage(false);
      }, 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setProducts([]);
      setfilterProducts([]);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    if (!isOnline) return;

    fetch(`${API_URL}/products`)
      .then((res) => res.json())
      .then((data) => {
        const list = data.products ?? [];
        setProducts(list);
        setfilterProducts(list);
      })
      .catch((err) => console.error("Fetch error:", err));
  }, [isOnline]);

  const addToCart = (product: IProduct) => {
    setCartItems((prevCart) => {
      const existingProduct = prevCart.find(
        (item) => item._id === product._id
      );

      if (existingProduct) {
        return prevCart.map((item) =>
          item._id === product._id
            ? {
                ...item,
                quantity: item.quantity + 1,
              }
            : item
        );
      }

      return [
        ...prevCart,
        {
          ...product,
          quantity: 1,
        },
      ];
    });
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />

      {!isOnline && (
        <div className="fixed top-20 left-0 w-full bg-red-600 text-white text-center py-2 z-[1000] px-4 text-sm sm:text-base">
          ⚠️ No internet connection. Please check your network.
        </div>
      )}

      {showOnlineMessage && (
        <div className="fixed top-20 left-0 w-full bg-green-600 text-white text-center py-2 z-[1000] px-4 text-sm sm:text-base">
          ✅ Internet connection restored. You're back online!
        </div>
      )}

      <section className="relative overflow-hidden bg-[#0A0A0B] px-4 pb-8 pt-28 text-white sm:px-6 md:px-8 md:pb-10 lg:px-10 lg:pt-32">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(201,169,110,0.24),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.08),transparent_38%)]" />
        <div className="relative mx-auto flex max-w-[1400px] flex-col gap-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              {/* <Button
                onClick={() => navigate(-1)}
                variant="outline"
                borderRadius="9999px"
                borderColor="rgba(201,169,110,0.55)"
                color="#F0EDE6"
                bg="rgba(255,255,255,0.06)"
                px="16px"
                h="40px"
                mb="18px"
                _hover={{ bg: "rgba(201,169,110,0.16)", borderColor: "#C9A96E" }}
              >
                <ArrowLeft size={16} color="currentColor" />
                Back
              </Button> */}

              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.35em] text-[#C9A96E] sm:text-sm">
                LuxeHub Store
              </p>
              <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
                Shop the collection
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
                Find the latest products, search by name, and add your favorites to cart.
              </p>
            </div>

            {/* <div className="rounded-2xl border border-[#C9A96E]/25 bg-white/10 px-4 py-3 text-sm shadow-2xl shadow-black/20 backdrop-blur md:min-w-[180px]"> */}
              {/* <div className="flex items-center gap-3"> */}
                {/* <img
                  src="cart image.jpg"
                  alt="Cart"
                  className="h-9 w-9 rounded-full bg-white/90 p-1"
                />
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-300">
                    Cart Items
                  </p>
                  <p className="text-lg font-semibold text-white">
                    {cartItems.length} {cartItems.length === 1 ? "item" : "items"}
                  </p>
                </div> */}
              {/* </div> */}
            {/* </div> */}
          </div>

          <div className="rounded-2xl border border-white/10 bg-white p-3 shadow-xl shadow-black/20 sm:p-4 md:max-w-xl">
            <Searchbox
              products={products}
              setProducts={setfilterProducts}
            />
          </div>
        </div>
      </section>

      {ViewCart && (
        <Cart
          cartItems={cartItems}
          closeCart={() => setViewCart(false)}
        />
      )}

      <section className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 md:px-8 lg:px-10 lg:py-10">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:gap-6 lg:grid-cols-3 xl:grid-cols-4">
          {isOnline ? (
            filteredproducts.length === 0 ? (
              <div className="col-span-full flex min-h-[240px] items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white">
                <div className="h-12 w-12 animate-spin rounded-full border-t-4 border-[#C9A96E]" />
              </div>
            ) : (
              filteredproducts.map((product) => (
                <Card
                  key={product._id}
                  product={product}
                  addToCart={addToCart}
                />
              ))
            )
          ) : (
            <div className="col-span-full rounded-3xl border border-slate-200 bg-white px-6 py-14 text-center text-base text-slate-500 sm:text-lg">
              No products available. You're offline.
            </div>
          )}
        </div>
      </section>

      <Box
        position="fixed"
        bottom={{ base: "18px", md: "25px" }}
        right={{ base: "18px", md: "25px" }}
        zIndex={9999}
      >
        <Button
          onClick={() => {
            if (!isLoggedIn) {
              navigate("/auth", {
                state: { from: "/product" },
              });
              return;
            }

            setViewCart(true);
          }}
          aria-label="Open cart"
          borderRadius="9999px"
          w={{ base: "54px", md: "60px" }}
          h={{ base: "54px", md: "60px" }}
          bg="#0A0A0B"
          color="#C9A96E"
          border="1px solid rgba(201,169,110,0.35)"
          boxShadow="0 18px 45px rgba(10,10,11,0.28)"
          position="relative"
          _hover={{
            bg: "#171717",
            transform: "translateY(-2px)",
          }}
        >
          <FaShoppingCart size={22} color="currentColor" />

          {cartItems.length > 0 && (
            <Box
              position="absolute"
              top="-5px"
              right="-5px"
              bg="#C9A96E"
              color="#0A0A0B"
              borderRadius="9999px"
              minW="22px"
              h="22px"
              display="flex"
              alignItems="center"
              justifyContent="center"
              fontSize="12px"
              fontWeight="bold"
            >
              {cartItems.length}
            </Box>
          )}
        </Button>
      </Box>
    </main>
  );
};

export default Product;
