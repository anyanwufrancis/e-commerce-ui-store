import {
  Box,
  Button,
  Container,
  Flex,
  Grid,
  Heading,
  Image,
  SimpleGrid,
  Text,
  VStack,
} from "@chakra-ui/react";
import Navbar from "../Component/nav";

const GOLD = "#C9A96E";
const DARK = "#0A0A0B";
const DARK2 = "#111113";
const TEXT = "#F0EDE6";

export default function About() {
  return (
    <Box bg={DARK} color={TEXT} minH="100vh">
<Navbar/>
      {/* HERO */}
      <Box
        h="70vh"
        position="relative"
        overflow="hidden"
      >
        <Image
          src="https://images.unsplash.com/photo-1441986300917-64674bd600d8"
          w="100%"
          h="100%"
          objectFit="cover"
          filter="brightness(.35)"
        />

        <Flex
          position="absolute"
          inset="0"
          justify="center"
          align="center"
          direction="column"
          textAlign="center"
          px={4}
        >
          <Text
            color={GOLD}
            letterSpacing="4px"
            textTransform="uppercase"
            mb={4}
          >
            About LuxeHub
          </Text>

          <Heading
            fontSize={{
              base: "4xl",
              md: "6xl",
            }}
            fontWeight="300"
          >
            Luxury Shopping
            <br />
            Reimagined
          </Heading>
        </Flex>
      </Box>

      {/* OUR STORY */}
      <Container maxW="1200px" py={24}>
        <Grid
          templateColumns={{
            base: "1fr",
            lg: "1fr 1fr",
          }}
          gap={14}
          alignItems="center"
        >
          <Image
            src="https://images.unsplash.com/photo-1483985988355-763728e1935b"
            borderRadius="md"
          />

          <Box>
            <Text
              color={GOLD}
              textTransform="uppercase"
              letterSpacing="3px"
              mb={4}
            >
              Our Story
            </Text>

            <Heading mb={6}>
              Building a Better Shopping Experience
            </Heading>

            <Text
              color="gray.400"
              lineHeight="1.9"
              mb={4}
            >
              LuxeHub was created with a simple mission:
              make premium shopping accessible,
              enjoyable, and trustworthy.
            </Text>

            <Text
              color="gray.400"
              lineHeight="1.9"
            >
              We carefully curate products from
              multiple categories including fashion,
              electronics, accessories, and lifestyle
              essentials while ensuring quality and
              customer satisfaction remain our top
              priorities.
            </Text>
          </Box>
        </Grid>
      </Container>

      {/* STATS */}
      <Box bg={DARK2} py={20}>
        <Container maxW="1200px">
          <SimpleGrid columns={{ base: 2, md: 4 }} gap={10}>
            {[
              ["12K+", "Products"],
              ["25K+", "Customers"],
              ["98%", "Satisfaction"],
              ["24/7", "Support"],
            ].map(([value, label]) => (
              <VStack key={label}>
                <Heading color={GOLD}>
                  {value}
                </Heading>

                <Text color="gray.400">
                  {label}
                </Text>
              </VStack>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* WHY CHOOSE US */}
      <Container maxW="1200px" py={24}>
        <VStack mb={14}>
          <Text
            color={GOLD}
            letterSpacing="3px"
            textTransform="uppercase"
          >
            Why Choose Us
          </Text>

          <Heading textAlign="center">
            More Than Just Another Store
          </Heading>
        </VStack>

        <SimpleGrid
          columns={{
            base: 1,
            md: 3,
          }}
          gap={8}
        >
          {[
            {
              title: "Premium Quality",
              text: "Every product is carefully selected to meet our quality standards.",
            },
            {
              title: "Fast Delivery",
              text: "Reliable shipping and secure delivery across the country.",
            },
            {
              title: "Secure Payments",
              text: "Protected transactions with trusted payment gateways.",
            },
          ].map((item) => (
            <Box
              key={item.title}
              bg={DARK2}
              p={8}
              border="1px solid"
              borderColor="whiteAlpha.100"
            >
              <Heading
                size="md"
                mb={4}
                color={GOLD}
              >
                {item.title}
              </Heading>

              <Text color="gray.400">
                {item.text}
              </Text>
            </Box>
          ))}
        </SimpleGrid>
      </Container>

      {/* MISSION */}
      <Box bg={DARK2} py={24}>
        <Container maxW="900px">
          <VStack textAlign="center">
            <Text
              color={GOLD}
              textTransform="uppercase"
              letterSpacing="3px"
            >
              Our Mission
            </Text>

            <Heading mb={6}>
              Creating Confidence
              Through Shopping
            </Heading>

            <Text
              color="gray.400"
              lineHeight="2"
              fontSize="lg"
            >
              Our mission is to connect customers
              with products they genuinely love,
              while delivering a seamless, secure,
              and enjoyable online shopping
              experience.
            </Text>
          </VStack>
        </Container>
      </Box>

      {/* CTA */}
      <Container
        maxW="1200px"
        py={24}
      >
        <VStack gap={6}>
          <Heading textAlign="center">
            Ready To Start Shopping?
          </Heading>

          <Text
            color="gray.400"
            textAlign="center"
          >
            Explore our collection and discover
            products tailored for your lifestyle.
          </Text>

          <Button
            bg={GOLD}
            color={DARK}
            size="lg"
            _hover={{
              opacity: 0.9,
            }}
          >
            Explore Products
          </Button>
        </VStack>
      </Container>
    </Box>
  );
}