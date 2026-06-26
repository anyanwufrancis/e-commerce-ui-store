import { useEffect, useState } from "react";
import { IProduct } from "@/interface/iproducts";
import Card from "@/Component/Card";
import Cart from "./Cart";
import Searchbox from "@/Component/searchbox";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { FaShoppingCart } from "react-icons/fa";

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
    <main className="px-4 md:px-8 lg:px-10 max-w-[1400px] mx-auto min-h-screen bg-gradient-to-b from-slate-100 to-slate-200">
      {!isOnline && (
        <div className="fixed top-0 left-0 w-full bg-red-600 text-white text-center py-2 z-50">
          ⚠️ No internet connection. Please check your network.
        </div>
      )}

      {showOnlineMessage && (
        <div className="fixed top-0 left-0 w-full bg-green-600 text-white text-center py-2 z-50">
          ✅ Internet connection restored. You're back online!
        </div>
      )}

      {/* Header */}
      <div className="mt-8 mb-6">
        <div className="hidden md:grid grid-cols-3 items-center gap-4">
          <div className="flex items-center gap-3 justify-start">
            <img
              src="cart image.jpg"
              alt="Cart"
              className="w-8 h-8"
            />
            <span className="text-sm font-medium">
              Cart Items: {cartItems.length}
            </span>
          </div>

          <div className="flex justify-center">
            <div className="w-full max-w-md">
              <Searchbox
                products={products}
                setProducts={setfilterProducts}
              />
            </div>
          </div>

          <div />
        </div>

        {/* Mobile */}
        <div className="md:hidden flex flex-col gap-4">
          <div className="w-full">
            <Searchbox
              products={products}
              setProducts={setfilterProducts}
            />
          </div>

          <div className="flex items-center gap-2">
            <img
              src="cart image.jpg"
              alt="Cart"
              className="w-7 h-7"
            />

            <span className="text-sm">
              {cartItems.length} items
            </span>
          </div>
        </div>
      </div>

      {/* Cart Modal */}
      {ViewCart && (
        <Cart
          cartItems={cartItems}
          closeCart={() => setViewCart(false)}
        />
      )}

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {isOnline ? (
          filteredproducts.length === 0 ? (
            <div className="col-span-full flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500" />
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
          <div className="col-span-full text-center text-lg text-gray-500">
            No products available. You're offline.
          </div>
        )}
      </div>

      {/* Floating Cart Icon */}
      <Box
        position="fixed"
        bottom="25px"
        right="25px"
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
          borderRadius="full"
          w="60px"
          h="60px"
          bg="blue.500"
          color="white"
          position="relative"
          _hover={{
            bg: "blue.600",
          }}
        >
          <FaShoppingCart size={24} />

          {cartItems.length > 0 && (
            <Box
              position="absolute"
              top="-5px"
              right="-5px"
              bg="red.500"
              color="white"
              borderRadius="full"
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