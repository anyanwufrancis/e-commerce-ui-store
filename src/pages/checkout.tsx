import { useLocation, useNavigate } from "react-router-dom";

const Checkout = () => {
  const location = useLocation();
//   const navigate = useNavigate();
  const navigate = useNavigate(); // ✅ inside component

  const cartItems = location.state?.cartItems || [];

  if (cartItems.length === 0) {
    return (
      <div className="text-center mt-10">
        No items to checkout
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>

      {cartItems.map((item: any) => (
        <div key={item.id} className="border p-4 mb-4 rounded">
          <img src={item.image} className="w-24 h-24 object-contain" />

          <h2 className="font-semibold">{item.title}</h2>
          <p>${item.price}</p>

          {/* 🔥 FULL DESCRIPTION ONLY HERE */}
          <p className="text-gray-600 mt-2">
            {item.description}
          </p>

          <p className="text-sm text-gray-500">
            Quantity: {item.quantity}
          </p>
        </div>
      ))}

      <button
        onClick={() => navigate("/")}
        className="mt-6 bg-black text-white px-4 py-2"
      >
        Place Order
      </button>
    </div>
  );
};

export default Checkout;