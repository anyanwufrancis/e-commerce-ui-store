import { useState, useEffect } from "react";
import axios from "axios";
import {
  Box, Button, Container, Flex, Grid, 
  Heading, HStack, VStack, Text, Image,
  Input, Icon,
} from "@chakra-ui/react";
import { keyframes } from "@emotion/react";
import { Link } from "react-router-dom";
import Navbar from "@/Component/nav";
import { useAuth } from "@/Component/context/AuthContext";

// ─── Design Tokens ───────────────────────────────────────────────────────────
const GOLD       = "#C9A96E";
const GOLD_LIGHT = "#E8D5A3";
const DARK       = "#0A0A0B";
const DARK2      = "#111113";
const DARK3      = "#1A1A1E";
const SURFACE    = "#16161A";
const TEXT_MAIN  = "#F0EDE6";
const TEXT_MUTED = "rgba(232,230,224,0.55)";
const TEXT_DIM   = "rgba(232,230,224,0.35)";

// ─── Keyframe Animations ─────────────────────────────────────────────────────
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(32px); }
  to   { opacity: 1; transform: translateY(0); }
`;
const shimmer = keyframes`
  0%   { background-position: -200% center; }
  100% { background-position:  200% center; }
`;
const floatAnim = keyframes`
  0%,100% { transform: translateY(0px); }
  50%      { transform: translateY(-12px); }
`;
const pulse = keyframes`
  0%,100% { opacity: 1; }
  50%      { opacity: 0.4; }
`;
const marqueeAnim = keyframes`
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
`;

// ─── Global font injection (Chakra doesn't auto-load Google Fonts) ────────────
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    html, body { background: ${DARK}; scroll-behavior: smooth; }

    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: ${DARK2}; }
    ::-webkit-scrollbar-thumb { background: rgba(201,169,110,0.3); border-radius: 3px; }

    .noise-overlay {
      position: fixed; inset: 0; pointer-events: none; z-index: 9999;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
      opacity: 0.03;
    }

    .serif { font-family: 'Cormorant Garamond', serif !important; }
    .sans  { font-family: 'DM Sans', sans-serif !important; }

    .shimmer-text {
      font-style: italic;
      background: linear-gradient(90deg, ${GOLD} 0%, ${GOLD_LIGHT} 40%, ${GOLD} 60%, #A07840 100%);
      background-size: 200% auto;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      animation: ${shimmer} 4s linear infinite;
    }

    .marquee-track {
      display: flex; gap: 60px; white-space: nowrap; width: max-content;
      animation: ${marqueeAnim} 22s linear infinite;
    }

    .category-card-img {
      width: 100%; height: 100%; object-fit: cover;
      transition: transform 0.7s cubic-bezier(0.16,1,0.3,1), filter 0.5s;
      filter: brightness(0.6);
    }
    .category-card:hover .category-card-img {
      transform: scale(1.08); filter: brightness(0.4);
    }
    .category-card::after {
      content: ''; position: absolute; inset: 0;
      border: 1px solid rgba(201,169,110,0);
      transition: border-color 0.4s; pointer-events: none;
    }
    .category-card:hover::after { border-color: rgba(201,169,110,0.5); }

    .product-card-img {
      width: 100%; aspect-ratio: 1; object-fit: cover;
      filter: brightness(0.85); transition: filter 0.4s;
    }
    .product-card:hover .product-card-img { filter: brightness(1); }

    .footer-link {
      font-size: 13px; color: rgba(232,230,224,0.4); cursor: pointer;
      transition: color 0.2s; margin-bottom: 12px; display: block;
    }
    .footer-link:hover { color: ${TEXT_MAIN}; }
  `}</style>
);

type TrendingProduct = {
  image: string | undefined;
  trendingScore: number;
  description: string;
  price: number;
  _id: string;
  name: string;
  tag: string;
  sub: string;
  title: string;
  desc: string;
};

// ─── Small Reusable Bits ──────────────────────────────────────────────────────

type SectionTagProps = {
  children: React.ReactNode;
  centered?: boolean;
};

function SectionTag({ children, centered = false }: SectionTagProps) {
  return (
    <HStack
      gap={3}
      justify={centered ? "center" : "flex-start"}
      mb={5}
    >
      <Box w="40px" h="1px" bg={GOLD} />
      <Text
        fontSize="11px"
        letterSpacing="0.2em"
        textTransform="uppercase"
        color={GOLD}
        fontFamily="'DM Sans', sans-serif"
        fontWeight={400}
      >
        {children}
      </Text>
    </HStack>
  );
}

type SectionHeadingProps = {
  children: React.ReactNode;
  italic?: string;
};

function SectionHeading({ children, italic }: SectionHeadingProps) {
  return (
    <Heading
      className="serif"
      fontSize={{ base: "36px", lg: "clamp(36px, 4vw, 56px)" }}
      fontWeight={300}
      color={TEXT_MAIN}
      lineHeight={1.1}
    >
      {children}
      {italic && (
        <>
          <br />
          <Box as="em" color={GOLD} fontStyle="italic">{italic}</Box>
        </>
      )}
    </Heading>
  );
}

function StarRating() {
  return (
    <HStack gap={1} mb={5}>
      {[1,2,3,4,5].map(i => (
        <Icon key={i} w="14px" h="14px" viewBox="0 0 24 24" fill={GOLD}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </Icon>
      ))}
    </HStack>
  );
}

function Arrow() {
  return (
    <Icon w="14px" h="14px" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.5">
      <path d="M5 12h14M12 5l7 7-7 7"/>
    </Icon>
  );
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const categories = [
  { name: "Fashion",      label: "Haute Couture", img: "fashion.avif" },
  { name: "Electronics",  label: "Tech & Gadgets", img: "cam and lap.avif" },
  { name: "Footwear",     label: "Luxury Shoes",  img: "snickers.avif" },
  { name: "Accessories",  label: "Fine Accents",  img: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=600&q=80" },
];

const featured = [
  { name: "Cashmere Overcoat",  price: "₦289,000", tag: "New Arrival", img: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=600&q=80" },
  { name: "Silk Evening Dress", price: "₦195,000", tag: "Bestseller",  img: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=600&q=80" },
  { name: "Leather Weekender",  price: "₦142,000", tag: "Editor's Pick",img: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=600&q=80" },
  { name: "Gold Timepiece",     price: "₦410,000", tag: "Limited",     img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80" },
];

const reviews = [
  { name: "Amara O.", role: "Lagos",        text: "The quality exceeded every expectation. Packaging alone felt like an event." },
  { name: "Chidi N.", role: "Abuja",        text: "Delivered same week. Everything was exactly as described — truly premium." },
  { name: "Sade K.",  role: "Port Harcourt",text: "LuxeHub has completely changed how I shop online. No going back." },
];

const marqueeItems = ["Premium Quality","Fast Nationwide Delivery","Secure Checkout","Easy Returns","Authentic Products","24/7 Support"];

const benefits = [
  { label: "Fast Delivery",    sub: "Nationwide within 3 days",     path: "M5 12h14M12 5l7 7-7 7" },
  { label: "Secure Payment",   sub: "256-bit encrypted transactions", path: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" },
  { label: "Easy Returns",     sub: "Hassle-free 30-day returns",    path: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" },
  { label: "Genuine Products", sub: "Authenticity guaranteed",       path: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" },
];

// ─── Main Component ───────────────────────────────────────────────────────────

export default function HomePage() {
  const { isLoggedIn } = useAuth();
  const [trendingProducts, setTrendingProducts] = useState<TrendingProduct[]>([]);
  const [email, setEmail]           = useState("");
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const res = await axios.get<{ products: TrendingProduct[] }>("http://localhost:5000/api/products/trending");
        setTrendingProducts(res.data.products);
      } catch (err) {
        console.log(err);
      }
    };

    void fetchTrending();
  }, []);

  // Shared button styles
  const btnPrimary = {
    bg: GOLD, color: DARK,
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "13px", fontWeight: 500,
    letterSpacing: "0.12em", textTransform: "uppercase",
    rounded: "none", px: 9, h: "48px",
    _hover: { bg: GOLD_LIGHT, transform: "translateY(-2px)" },
    transition: "all 0.3s",
  };

  const btnOutline = {
    bg: "transparent", color: TEXT_MAIN,
    border: "1px solid", borderColor: "rgba(201,169,110,0.4)",
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "13px", fontWeight: 400,
    letterSpacing: "0.12em", textTransform: "uppercase",
    rounded: "none", px: 9, h: "48px",
    _hover: { borderColor: GOLD, color: GOLD, transform: "translateY(-2px)" },
    transition: "all 0.3s",
  };

  return (
    <Box bg={DARK} fontFamily="'DM Sans', sans-serif" fontWeight={300} color={TEXT_MAIN} minH="100vh">
      <GlobalStyles />
      <Box className="noise-overlay" aria-hidden />

      {/* ── NAVBAR ── */}
      <Navbar />

      {/* ── HERO ── */}
      <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} minH="100vh">
        {/* Left */}
        <Flex
          direction="column" justify="center"
          px={{ base: 8, lg: 20 }} pt="120px" pb="80px"
          bg={DARK} position="relative" zIndex={2}
        >
          {/* Ghost number */}
          <Text
            className="serif"
            fontSize="clamp(100px,18vw,260px)" fontWeight={300} lineHeight={1}
            color="rgba(201,169,110,0.06)"
            position="absolute" top="60px" left="-20px"
            userSelect="none" pointerEvents="none"
          >1</Text>

          <Box animation={`${fadeUp} 0.8s cubic-bezier(0.16,1,0.3,1) 0.1s both`}>
            <SectionTag>Premium Shopping Experience</SectionTag>
          </Box>

          <Heading
            className="serif"
            fontSize={{ base: "52px", lg: "clamp(52px,5vw,80px)" }}
            fontWeight={300} lineHeight={1.05} letterSpacing="-0.01em"
            mb={7} color={TEXT_MAIN}
            animation={`${fadeUp} 0.8s cubic-bezier(0.16,1,0.3,1) 0.25s both`}
          >
            Discover<br />Products<br />
            <Box as="span" className="shimmer-text">You'll Love</Box>
          </Heading>

          <Text
            fontSize="15px" lineHeight={1.8} color={TEXT_MUTED} maxW="380px" mb={11}
            animation={`${fadeUp} 0.8s cubic-bezier(0.16,1,0.3,1) 0.4s both`}
          >
            Shop thousands of premium products from trusted sellers with secure checkout and lightning-fast nationwide delivery.
          </Text>

         <HStack
  gap={4}
  mb={16}
  animation={`${fadeUp} 0.8s cubic-bezier(0.16,1,0.3,1) 0.55s both`}
>
  {!isLoggedIn && (
    <Link to="/product">
      <Button {...btnPrimary}>Shop Now</Button>
    </Link>
  )}

  <Button {...btnOutline}>Explore All</Button>
</HStack>

          <HStack gap={10}>
            {[["12K+","Products"],["98%","Satisfaction"],["3-Day","Delivery"]].map(([n,l]) => (
              <Box key={l}>
                <Text className="serif" fontSize="28px" fontWeight={300} color={GOLD}>{n}</Text>
                <Text fontSize="11px" letterSpacing="0.15em" textTransform="uppercase" color="rgba(232,230,224,0.4)" mt={1}>{l}</Text>
              </Box>
            ))}
          </HStack>
        </Flex>

        {/* Right — hero image */}
        <Box position="relative" overflow="hidden" bg={DARK2}>
          <Image
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=900&q=80"
            alt="Hero" w="100%" h="100%" objectFit="cover" filter="brightness(0.6)"
          />
          {/* Gradients */}
          <Box position="absolute" inset={0} bgGradient={`linear(to-r, ${DARK}, transparent 30%)`} />
          <Box position="absolute" inset={0} bg="linear-gradient(to top, rgba(10,10,11,0.7) 0%, transparent 50%)" />

          {/* Floating badge */}
          <Box
            position="absolute" bottom="100px" left="40px"
            bg={DARK} border="1px solid rgba(201,169,110,0.4)" p={5}
            animation={`${floatAnim} 4s ease-in-out infinite`}
          >
            <Text fontSize="11px" letterSpacing="0.15em" textTransform="uppercase" color={GOLD} mb={1}>Today's Offer</Text>
            <Text className="serif" fontSize="22px" fontWeight={300} color={TEXT_MAIN}>Up to 40% Off</Text>
            <Text fontSize="12px" color="rgba(232,230,224,0.5)" mt={1}>Flash Sale · Ends Tonight</Text>
          </Box>

          {/* Scroll indicator */}
        <VStack position="absolute" bottom="40px" right="40px" gap={3} align="center">
            <Text fontSize="10px" letterSpacing="0.2em" textTransform="uppercase" color="rgba(232,230,224,0.4)" style={{ writingMode: "vertical-rl" }}>Scroll</Text>
            <Box w="1px" h="60px" bgGradient={`linear(to-b, ${GOLD}, transparent)`} animation={`${pulse} 2s ease-in-out infinite`} />
          </VStack>
        </Box>
      </Grid>

      {/* ── MARQUEE ── */}
      <Box
        overflow="hidden"
        borderTop="1px solid rgba(201,169,110,0.15)"
        borderBottom="1px solid rgba(201,169,110,0.15)"
        py={4}
      >
        <Box className="marquee-track">
          {[...marqueeItems, ...marqueeItems].map((item, i) => (
            <HStack key={i} gap={5} flexShrink={0}>
              <Box w="4px" h="4px" borderRadius="full" bg={GOLD} opacity={0.4} />
              <Text fontSize="12px" letterSpacing="0.2em" textTransform="uppercase" color="rgba(201,169,110,0.5)">{item}</Text>
            </HStack>
          ))}
        </Box>
      </Box>

      {/* ── CATEGORIES ── */}
      <Box bg={DARK2} py={32} px={12}>
        <Container maxW="1400px">
          <Flex justify="space-between" align="flex-end" mb={16}>
            <Box>
              <SectionTag>Curated for you</SectionTag>
              <SectionHeading italic="Category">Shop by</SectionHeading>
            </Box>
            <Button {...btnOutline} flexShrink={0}>View All</Button>
          </Flex>

          <Grid templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }} gap="2px">
            {categories.map((cat) => (
              <Box
                key={cat.name}
                className="category-card"
                position="relative" overflow="hidden" cursor="pointer"
                aspectRatio="3/4"
              >
                <Image className="category-card-img" src={cat.img} alt={cat.name} />
                <Box
                  position="absolute" bottom={0} left={0} right={0} p={8}
                  bgGradient="linear(to-t, rgba(0,0,0,0.85), transparent)"
                >
                  <Text fontSize="11px" letterSpacing="0.2em" textTransform="uppercase" color={GOLD} mb={2}>{cat.label}</Text>
                  <Text className="serif" fontSize="28px" fontWeight={300} color={TEXT_MAIN}>{cat.name}</Text>
                  <HStack mt={4} gap={2} color="rgba(232,230,224,0.6)">
                    <Text fontSize="12px" letterSpacing="0.1em" textTransform="uppercase">Explore</Text>
                    <Arrow />
                  </HStack>
                </Box>
              </Box>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ── FEATURED PRODUCTS ── */}
      <Box bg={DARK} py={32} px={12}>
        <Container maxW="1400px">
          <Flex justify="space-between" align="flex-end" mb={16}>
            <Box>
              <SectionTag>Hand-picked selection</SectionTag>
              <SectionHeading italic="Pieces">Featured</SectionHeading>
            </Box>
            <Button {...btnOutline}>All Products</Button>
          </Flex>

          <Grid templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }} gap={4}>
            {featured.map((p) => (
              <Box
                key={p.name}
                className="product-card"
                bg={SURFACE} border="1px solid rgba(255,255,255,0.05)"
                overflow="hidden" cursor="pointer"
                transition="all 0.4s cubic-bezier(0.16,1,0.3,1)"
                _hover={{ borderColor: "rgba(201,169,110,0.3)", transform: "translateY(-8px)", boxShadow: "0 32px 64px rgba(0,0,0,0.5)" }}
              >
                <Box position="relative" overflow="hidden">
                  <Image className="product-card-img" src={p.img} alt={p.name} />
                  <Box
                    position="absolute" top={4} left={4}
                    bg={GOLD} color={DARK} fontSize="10px"
                    letterSpacing="0.15em" textTransform="uppercase"
                    px={3} py="5px" fontWeight={500}
                  >{p.tag}</Box>
                </Box>
                <Box p={6}>
                  <Text fontSize="11px" letterSpacing="0.15em" textTransform="uppercase" color={TEXT_DIM} mb={2}>LuxeHub Original</Text>
                  <Text className="serif" fontSize="20px" fontWeight={300} color={TEXT_MAIN} mb={4}>{p.name}</Text>
                  <Flex justify="space-between" align="center">
                    <Text color={GOLD} fontSize="18px" fontWeight={400}>{p.price}</Text>
                    <Box
                      as="button"
                      bg="transparent" border="1px solid rgba(201,169,110,0.3)"
                      color={GOLD} px={4} py={2} fontSize="11px"
                      letterSpacing="0.1em" textTransform="uppercase" cursor="pointer"
                      transition="all 0.3s"
                      _hover={{ bg: GOLD, color: DARK }}
                    >Add to Bag</Box>
                  </Flex>
                </Box>
              </Box>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ── FULL-WIDTH SALE BANNER ── */}
      <Box position="relative" h="480px" overflow="hidden">
        <Image
          src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=1800&q=80"
          alt="" w="100%" h="100%" objectFit="cover" filter="brightness(0.35)"
        />
        <Flex
          position="absolute" inset={0}
          direction="column" align="center" justify="center" textAlign="center"
        >
          <SectionTag centered>Limited Time</SectionTag>
          <Heading
            className="serif"
            fontSize={{ base: "40px", lg: "clamp(40px,6vw,80px)" }}
            fontWeight={300} color={TEXT_MAIN} lineHeight={1.1} mb={6}
          >
            The Season's<br />
            <Box as="span" className="shimmer-text">Grand Sale</Box>
          </Heading>
          <Text color={TEXT_MUTED} mb={9} fontSize="15px">Up to 60% off on selected premium collections</Text>
          <Button {...btnPrimary}>Shop the Sale</Button>
        </Flex>
      </Box>

     {/* ── TRENDING PRODUCTS ── */}
<Box bg={DARK2} py={32} px={12}>
  <Container maxW="1400px">

    <SectionTag>Live Offers</SectionTag>

    <SectionHeading italic="Products">
      Trending
    </SectionHeading>

    <Box mb={16} />


    <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap="2px">

      {trendingProducts.map((product, index) => (

        <Box
          key={product._id}
          border="1px solid rgba(201,169,110,0.2)"
          bg={DARK3}
          overflow="hidden"
          transition="all 0.4s"
          cursor="pointer"
          _hover={{
            borderColor:GOLD,
            bg:SURFACE,
            transform:"translateY(-5px)"
          }}
        >

          {/* Product Image */}
          <Box
            position="relative"
            h="260px"
            overflow="hidden"
          >

            <Image
              src={product.image}
              alt={product.name}
              w="100%"
              h="100%"
              objectFit="cover"
            />


            <Box
              position="absolute"
              top={4}
              left={4}
              bg={GOLD}
              color={DARK}
              fontSize="10px"
              px={3}
              py="5px"
              letterSpacing="0.15em"
              textTransform="uppercase"
            >
              {product.tag}
            </Box>

          </Box>


          <Box p={8}>

            <Flex
              justify="space-between"
              align="center"
              mb={4}
            >

              <Text
                fontSize="11px"
                color={GOLD}
                letterSpacing="0.15em"
                textTransform="uppercase"
              >
                #{index + 1} Trending
              </Text>


              <Text
                fontSize="12px"
                color={TEXT_DIM}
              >
                Score {product.trendingScore}
              </Text>

            </Flex>


            <Text
              className="serif"
              fontSize="28px"
              color={TEXT_MAIN}
              mb={3}
            >
              {product.name}
            </Text>


            <Text
              fontSize="14px"
              color={TEXT_MUTED}
              lineHeight={1.7}
              mb={5}
            >
              {product.description}
            </Text>


            <Flex
              justify="space-between"
              align="center"
            >

              <Text
                color={GOLD}
                fontSize="20px"
              >
                ₦{product.price.toLocaleString()}
              </Text>


              <Box
                as="button"
                border="1px solid rgba(201,169,110,0.3)"
                color={GOLD}
                px={4}
                py={2}
                fontSize="11px"
                letterSpacing="0.1em"
                textTransform="uppercase"
                _hover={{
                  bg:GOLD,
                  color:DARK
                }}
              >
                View
              </Box>


            </Flex>

          </Box>


        </Box>

      ))}

    </Grid>

  </Container>
</Box>
      {/* ── BENEFITS ── */}
      <Box bg={DARK} py={24} px={12}>
        <Container maxW="1400px">
          <Grid templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }} gap="2px">
            {benefits.map((b) => (
              <VStack
                key={b.label}
                p={10} gap={4} textAlign="center"
                border="1px solid rgba(255,255,255,0.05)"
                transition="border-color 0.3s"
                _hover={{ borderColor: "rgba(201,169,110,0.3)" }}
              >
                <Icon w="32px" h="32px" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1">
                  <path d={b.path} strokeLinecap="round" strokeLinejoin="round" />
                </Icon>
                <Text fontSize="11px" letterSpacing="0.15em" textTransform="uppercase" color={TEXT_MAIN}>{b.label}</Text>
                <Text fontSize="13px" color="rgba(232,230,224,0.4)" lineHeight={1.6}>{b.sub}</Text>
              </VStack>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ── TESTIMONIALS ── */}
      <Box bg={DARK2} py={32} px={12}>
        <Container maxW="1400px">
          <VStack mb={20} gap={0}>
            <SectionTag centered>Verified Buyers</SectionTag>
            <SectionHeading italic="Say">What Customers</SectionHeading>
          </VStack>

          <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap="2px">
            {reviews.map((r) => (
              <Box key={r.name} bg={DARK3} border="1px solid rgba(255,255,255,0.05)" p={10}>
                <StarRating />
                <Text
                  className="serif" fontSize="20px" fontWeight={300} fontStyle="italic"
                  color={TEXT_MAIN} lineHeight={1.6} mb={7}
                >
                  "{r.text}"
                </Text>
                <HStack gap={4}>
                  <Flex
                    w="40px" h="40px" borderRadius="full" align="center" justify="center"
                    bgGradient={`linear(135deg, ${GOLD}, #8B6B3D)`}
                    fontSize="13px" fontWeight={500} color={DARK} flexShrink={0}
                  >{r.name[0]}</Flex>
                  <Box>
                    <Text fontSize="14px" color={TEXT_MAIN} fontWeight={400}>{r.name}</Text>
                    <Text fontSize="12px" color="rgba(232,230,224,0.4)" letterSpacing="0.1em">{r.role}</Text>
                  </Box>
                </HStack>
              </Box>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ── NEWSLETTER ── */}
      <Box
        bg={DARK3}
        borderTop="1px solid rgba(201,169,110,0.2)"
        borderBottom="1px solid rgba(201,169,110,0.2)"
        py={32} px={12}
      >
        <VStack maxW="700px" mx="auto" textAlign="center" gap={0}>
          <SectionTag centered>Exclusive Access</SectionTag>
          <Heading
            className="serif" fontSize={{ base: "36px", lg: "52px" }}
            fontWeight={300} color={TEXT_MAIN} lineHeight={1.2} mb={4}
          >
            Get Exclusive <Box as="em" color={GOLD} fontStyle="italic">Offers</Box>
          </Heading>
          <Text color="rgba(232,230,224,0.45)" fontSize="15px" lineHeight={1.7} mb={12}>
            Join our curated members list for early access to sales, new arrivals, and private events.
          </Text>

          {!subscribed ? (
            <HStack w="100%" maxW="500px" gap={0}>
              <Input
                type="email" placeholder="Your email address"
                value={email} onChange={e => setEmail(e.target.value)}
                bg="rgba(255,255,255,0.05)"
                border="1px solid rgba(201,169,110,0.3)"
                color={TEXT_MAIN} fontSize="14px"
                fontFamily="'DM Sans', sans-serif"
                rounded="none" h="48px" px={5}
                _placeholder={{ color: "rgba(232,230,224,0.3)" }}
                _focus={{ borderColor: GOLD, boxShadow: "none" }}
                _hover={{ borderColor: "rgba(201,169,110,0.5)" }}
                flex={1}
              />
              <Button
                {...btnPrimary}
                onClick={() => email && setSubscribed(true)}
                whiteSpace="nowrap" flexShrink={0}
              >Subscribe</Button>
            </HStack>
          ) : (
            <Box
              border="1px solid rgba(201,169,110,0.3)" color={GOLD}
              fontSize="14px" letterSpacing="0.1em" px={8} py={5}
            >
              ✓ Welcome to LuxeHub — check your inbox for a gift.
            </Box>
          )}

          <Text mt={5} fontSize="12px" color="rgba(232,230,224,0.25)" letterSpacing="0.05em">
            No spam. Unsubscribe anytime.
          </Text>
        </VStack>
      </Box>

      {/* ── FOOTER ── */}
      <Box as="footer" bg={DARK} pt={16} pb={10} px={12}>
        <Container maxW="1400px">
          <Grid templateColumns={{ base: "1fr", md: "2fr 1fr 1fr 1fr" }} gap={16} mb={16}>
            <Box>
              <Text className="serif" fontSize="28px" fontWeight={300} color={TEXT_MAIN} mb={5}>
                Luxe<Box as="span" color={GOLD}>Hub</Box>
              </Text>
              <Text fontSize="13px" lineHeight={1.8} color="rgba(232,230,224,0.4)" maxW="280px">
                Nigeria's premier destination for curated luxury goods, fashion, and lifestyle essentials.
              </Text>
            </Box>
            {[
              { title: "Shop",    links: ["New Arrivals","Best Sellers","Sale","Gift Cards"] },
              { title: "Company", links: ["About Us","Careers","Press","Partners"] },
              { title: "Support", links: ["FAQ","Returns","Track Order","Contact"] },
            ].map(col => (
              <Box key={col.title}>
                <Text fontSize="11px" letterSpacing="0.2em" textTransform="uppercase" color={GOLD} mb={6}>{col.title}</Text>
                {col.links.map(l => (
                  <Box key={l} className="footer-link">{l}</Box>
                ))}
              </Box>
            ))}
          </Grid>

          <Flex
            borderTop="1px solid rgba(255,255,255,0.07)" pt={8}
            justify="space-between" align="center"
          >
            <Text fontSize="12px" color="rgba(232,230,224,0.25)" letterSpacing="0.05em">
              © 2026 LuxeHub. All Rights Reserved.
            </Text>
            <Text fontSize="12px" color="rgba(232,230,224,0.25)" letterSpacing="0.05em">
              Privacy · Terms · Cookies
            </Text>
          </Flex>
        </Container>
      </Box>
    </Box>
  );
}