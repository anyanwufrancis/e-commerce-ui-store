import {
  Card as ProductCard,
  CardContent,
  Typography,
  CardActions,
  Button,
} from "@mui/material"; // Importing Material-UI components
import { IProduct } from "@/interface/iproducts"; // Importing IProduct interface

// Define the props for the Card component
type ICardProps = {
  product: IProduct; // Product object containing details like image, title, price, etc.
  addToCart: (product: IProduct) => void; // Function to handle adding product to cart
};
const Card: React.FC<ICardProps> = ({ product, addToCart }) => {
const { image, name, price, _id } = product;
  // Check if the product is a special product (ID 123), to customize size
const isSpecialProduct = false;
  // Set card width based on whether it's a special product
  const cardWidth = isSpecialProduct ? 200 : 250;

  // Set image height based on whether it's a special product
  const imageHeight = isSpecialProduct ? 140 : 180;

  const fallbackImage = "https://via.placeholder.com/400?text=No+Image";

  // Set the exchange rate for NGN (Nigerian Naira) to USD
  const exchangeRateNGN = 1473; // 1 USD = 1,473 NGN

  // Create a formatter for NGN currency to display properly formatted currency string
  const ngnFormatter = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 2,
  });
// console.log("IMAGE:", image);

  return (
    // Wrapper div for styling and responsiveness
    <div
      className={`group relative mx-auto mb-6 ${
        isSpecialProduct ? "w-[200px]" : "w-[250px]"
      }`}
    >
      {/* Material-UI Card component with styling */}
      <ProductCard
        key={_id}
        sx={{ maxWidth: cardWidth, mb: 2 }}
        className="p-3 border border-gray-300 rounded-lg shadow transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-xl"
      >
        {/* Background image container styled with inline styles */}
<img
  src={image || fallbackImage}
  alt={name}
  className="w-full rounded-md mb-2 object-cover"
  style={{ height: imageHeight }}
  onError={(event) => {
    const target = event.currentTarget;
    if (target.src !== fallbackImage) {
      target.onerror = null;
      target.src = fallbackImage;
    }
  }}
/>

        {/* Product details section */}
        <CardContent>
          {/* Product title with truncation if too long */}
          <Typography
            gutterBottom
            variant="subtitle1"
            component="div"
            className="truncate"
          >
      {name}
          </Typography>
          {/* <Typography variant="body2" sx={{ color: "text.secondary" }}>
  {isLoggedIn
    ? product.description
    : "Login to view full product details"}
</Typography> */}
          
          {/* Show both USD and NGN prices */}
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            ${price} &nbsp; | &nbsp; {ngnFormatter.format(price * exchangeRateNGN)}
            {/* Displays USD price and converted NGN price with proper currency formatting */}
          </Typography>
        </CardContent>

        {/* Add to cart button, visible on hover */}
        <CardActions
          className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        >
          <Button
            size="small"
            onClick={() => addToCart(product)} // Call addToCart function on click
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            Add to Cart
          </Button>
        </CardActions>
      </ProductCard>
    </div>
  );
};

export default Card; // Export the component for use in other parts of the app