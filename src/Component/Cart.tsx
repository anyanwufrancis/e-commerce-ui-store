import {
  Box,
  Button,
  Flex,
  Image,
  Text,
  VStack,
  HStack,
  IconButton,
  Icon,
} from "@chakra-ui/react";
import { X as CloseIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { IProduct } from "@/interface/iproducts";

type IProductWithQuantity = IProduct & { quantity: number };

type ICartItemsProps = {
  cartItems: IProductWithQuantity[];
  closeCart: () => void;
};

const Cart: React.FC<ICartItemsProps> = ({ cartItems, closeCart }) => {
  const navigate = useNavigate();

  const handleCheckout = () => {
    const user = localStorage.getItem("user");

    if (!user) {
      navigate("/signin");
      return;
    }

    navigate("/checkout", {
      state: { cartItems },
    });

    closeCart();
  };

  return (
    <Flex
      position="fixed"
      top="0"
      left="0"
      w="100vw"
      h="100vh"
      bg="blackAlpha.700"
      justify="center"
      align="center"
      zIndex="9999"
      px={4}
    >
      {/* Modal Box */}
      <Box
        w={{ base: "95%", md: "600px" }}
        maxH="85vh"
        bg="white"
        borderRadius="lg"
        boxShadow="2xl"
        overflowY="auto"
        p={6}
        position="relative"
      >
        {/* Close Button */}
        <IconButton
          aria-label="Close cart"
          size="sm"
          position="absolute"
          top="10px"
          right="10px"
          onClick={closeCart}
        >
          <Icon>
            <CloseIcon />
          </Icon>
        </IconButton>

        {/* Title */}
        <Text fontSize="xl" fontWeight="bold" mb={4}>
          Your Cart
        </Text>

        {/* Items */}
        {cartItems.length > 0 ? (
          <VStack gap={4} align="stretch">
            {cartItems.map((item) => (
              <HStack
                key={item._id}
                gap={4}
                borderBottom="1px solid #eee"
                pb={3}
              >
                <Image
                  src={item.image}
                  boxSize="60px"
                  objectFit="contain"
                />

                <Box flex="1">
                  <Text fontWeight="semibold" lineClamp={1}>
                    {item.name}
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    ${item.price}
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    Qty: {item.quantity}
                  </Text>
                </Box>
              </HStack>
            ))}
          </VStack>
        ) : (
          <Text textAlign="center" color="gray.500" py={10}>
            No items in the cart
          </Text>
        )}

        {/* Checkout Button */}
        <Flex justify="center" mt={6}>
          <Button
            colorScheme="blackAlpha"
            bg="black"
            color="white"
            _hover={{ bg: "gray.800" }}
            onClick={handleCheckout}
            w="full"
          >
            Checkout
          </Button>
        </Flex>
      </Box>
    </Flex>
  );
};

export default Cart;