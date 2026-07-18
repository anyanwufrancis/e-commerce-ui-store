import { useState, useEffect } from "react";
import API from "@/services/api";
import {
  Box, Button, Container, Flex, Grid,
  Heading, HStack, VStack, Text, Image,
} from "@chakra-ui/react";
import { keyframes } from "@emotion/react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/Component/nav";
import { IProduct } from "@/interface/iproducts";
import { Search } from "lucide-react";

// ─── Design Tokens ───────────────────────────────────────────────────────────
const GOLD       = "#C9A96E";
const GOLD_LIGHT = "#E8D5A3";
const DARK       = "#0A0A0B";
const DARK2      = "#111113";
const SURFACE    = "#16161A";
const TEXT_MAIN  = "#F0EDE6";
const TEXT_MUTED = "rgba(232,230,224,0.55)";
const TEXT_DIM   = "rgba(232,230,224,0.35)";
const BORDER     = "rgba(201,169,110,0.15)";

// ─── Keyframe Animations ─────────────────────────────────────────────────────
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(32px); }
  to   { opacity: 1; transform: translateY(0); }
`;
const shimmer = keyframes`
  0%   { background-position: -200% center; }
  100% { background-position:  200% center; }
`;

// ─── Global Styles ────────────────────────────────────────────────────────────
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
    .category-hero-img {
      width: 100%; height: 100%; object-fit: cover;
      transition: transform 0.7s cubic-bezier(0.16,1,0.3,1), filter 0.5s;
      filter: brightness(0.55);
    }
    .category-hero-card:hover .category-hero-img {
      transform: scale(1.08); filter: brightness(0.35);
    }
    .category-hero-card::after {
      content: ''; position: absolute; inset: 0;
      border: 1px solid rgba(201,169,110,0);
      transition: border-color 0.4s; pointer-events: none;
    }
    .category-hero-card:hover::after { border-color: rgba(201,169,110,0.5); }
    .product-card-img {
      width: 100%; aspect-ratio: 1; object-fit: cover;
      filter: brightness(0.85); transition: filter 0.4s;
    }
    .product-card:hover .product-card-img { filter: brightness(1); }
  `}</style>
);

// ─── Category Definitions ────────────────────────────────────────────────────
const CATEGORIES = [
  {
    id: "fashion",
    name: "Fashion",
    label: "Haute Couture",
    description: "Curated luxury apparel, designer pieces, and timeless wardrobe essentials.",
    img: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80",
    keywords: ["fashion", "apparel", "clothing", "dress", "shirt", "jacket", "coat", "suit", "blouse", "trouser", "pant", "skirt", "top", "wear", "outfit"],
  },
  {
    id: "electronics",
    name: "Electronics",
    label: "Tech & Gadgets",
    description: "Premium electronics, smart devices, and cutting-edge technology.",
    img: "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?auto=format&fit=crop&w=800&q=80",
    keywords: ["electronic", "tech", "gadget", "phone", "laptop", "computer", "tablet", "headphone", "speaker", "camera", "watch", "device", "smart", "charger"],
  },
  {
    id: "footwear",
    name: "Footwear",
    label: "Luxury Shoes",
    description: "Exquisite footwear from premium brands, from casual to formal elegance.",
    img: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80",
    keywords: ["shoe", "footwear", "sneaker", "boot", "loafer", "heel", "sandals", "slipper", "trainer", "pump"],
  },
  {
    id: "accessories",
    name: "Accessories",
    label: "Fine Accents",
    description: "Refined accessories to elevate every look — bags, jewelry, watches, and more.",
    img: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80",
    keywords: ["accessory", "bag", "jewelry", "watch", "belt", "wallet", "sunglass", "hat", "scarf", "glove", "perfume", "fragrance", "bracelet", "necklace", "ring"],
  },
  {
    id: "home-living",
    name: "Home & Living",
    label: "Luxury Interiors",
    description: "Sophisticated home decor, furniture, and lifestyle pieces for refined living.",
    img: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=800&q=80",
    keywords: ["home", "decor", "furniture", "living", "lamp", "candle", "vase", "frame", "rug", "cushion", "bedding", "kitchen", "dining", "interior"],
  },
  {
    id: "beauty",
    name: "Beauty",
    label: "Premium Cosmetics",
    description: "High-end skincare, makeup, and fragrance collections from around the world.",
    img: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80",
    keywords: ["beauty", "cosmetic", "skincare", "makeup", "fragrance", "perfume", "cream", "serum", "lipstick", "foundation", "moisturizer", "cleanser"],
  },
];

const FALLBACK_IMG = "https://via.placeholder.com/400?text=No+Image";

// ─── Helper: match product to category by name/description keywords ──────────
function matchCategory(product: IProduct): string {
  const name = product.name.toLowerCase();
  const desc = product.description?.toLowerCase() ?? "";
  const text = `${name} ${desc}`;
  for (const cat of CATEGORIES) {
    if (cat.keywords.some((kw) => text.includes(kw))) {
      return cat.id;
    }
  }
  return "fashion";
}

// ─── Small Reusable Bits ──────────────────────────────────────────────────────

type SectionTagProps = { children: React.ReactNode; centered?: boolean };

function SectionTag({ children, centered = false }: SectionTagProps) {
  return (
    <HStack gap={3} justify={centered ? "center" : "flex-start"} mb={5}>
      <Box w="40px" h="1px" bg={GOLD} />
      <Text fontSize="11px" letterSpacing="0.2em" textTransform="uppercase" color={GOLD} fontFamily="'DM Sans', sans-serif" fontWeight={400}>
        {children}
      </Text>
    </HStack>
  );
}

type SectionHeadingProps = { children: React.ReactNode; italic?: string };

function SectionHeading({ children, italic }: SectionHeadingProps) {
  return (
    <Heading className="serif" fontSize={{ base: "36px", lg: "clamp(36px, 4vw, 56px)" }} fontWeight={300} color={TEXT_MAIN} lineHeight={1.1}>
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

function Arrow() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.5" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CategoriesPage() {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await API.get<{ products: IProduct[] }>("/products");
        setProducts(res.data.products ?? []);
      } catch (err) {
        console.error("Failed to fetch products:", err);
      } finally {
        setLoading(false);
      }
    };
    void fetchProducts();
  }, []);

  const isSearching = searchQuery.trim().length > 0;
  const query = searchQuery.trim().toLowerCase();

  const matchesQuery = (p: IProduct) =>
    p.name.toLowerCase().includes(query) ||
    (p.description?.toLowerCase().includes(query) ?? false);

  // Group products by category, applying the search filter within each group
  const grouped = CATEGORIES.map((cat) => {
    const inCategory = products.filter((p) => matchCategory(p) === cat.id);
    return {
      ...cat,
      products: isSearching ? inCategory.filter(matchesQuery) : inCategory,
      totalInCategory: inCategory.length,
    };
  });

  // Filter by active category tab
  const filteredGrouped = activeCategory
    ? grouped.filter((g) => g.id === activeCategory)
    : grouped;

  // While searching, only show categories that actually have a match
  const displayGrouped = isSearching
    ? filteredGrouped.filter((g) => g.products.length > 0)
    : filteredGrouped;

  const totalSearchMatches = isSearching
    ? grouped.reduce((sum, g) => sum + g.products.length, 0)
    : 0;

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

  // Shared onError handler for images
  const handleImgError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.currentTarget;
    if (target.src !== FALLBACK_IMG) {
      target.onerror = null;
      target.src = FALLBACK_IMG;
    }
  };

  return (
    <Box bg={DARK} fontFamily="'DM Sans', sans-serif" fontWeight={300} color={TEXT_MAIN} minH="100vh">
      <GlobalStyles />
      <Box className="noise-overlay" aria-hidden />
      <Navbar />

      {/* ── HERO SECTION ── */}
      <Box position="relative" h={{ base: "420px", lg: "520px" }} overflow="hidden">
        <Image
          src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=1800&q=80"
          alt="Categories"
          w="100%" h="100%" objectFit="cover" filter="brightness(0.3)"
        />
        <Box position="absolute" inset={0} bgGradient={`linear(to-t, ${DARK}, transparent 60%)`} />

        <Flex position="absolute" inset={0} direction="column" align="center" justify="center" textAlign="center" px={6}>
          <Box animation={`${fadeUp} 0.8s cubic-bezier(0.16,1,0.3,1) 0.1s both`}>
            <SectionTag centered>Browse Collections</SectionTag>
          </Box>
          <Heading
            className="serif"
            fontSize={{ base: "48px", lg: "clamp(48px, 6vw, 80px)" }}
            fontWeight={300} color={TEXT_MAIN} lineHeight={1.1} mb={6}
            animation={`${fadeUp} 0.8s cubic-bezier(0.16,1,0.3,1) 0.25s both`}
          >
            Shop by <Box as="span" className="shimmer-text">Category</Box>
          </Heading>
          <Text
            color={TEXT_MUTED} mb={9} fontSize="15px" maxW="500px"
            animation={`${fadeUp} 0.8s cubic-bezier(0.16,1,0.3,1) 0.4s both`}
          >
            Explore our curated collections — from luxury fashion to cutting-edge tech, find everything you need in one place.
          </Text>

          {/* Search Bar - using native input inside chakra Flex */}
          <Box w="100%" maxW="500px" animation={`${fadeUp} 0.8s cubic-bezier(0.16,1,0.3,1) 0.55s both`}>
            <Flex align="center" bg="rgba(255,255,255,0.06)" border="1px solid rgba(201,169,110,0.3)" px={5} py={3} gap={3}>
              <Search size={18} color={GOLD} />
              <input
                type="text"
                placeholder="Search products across all categories..."
                defaultValue={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                style={{
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: TEXT_MAIN,
                  fontSize: "14px",
                  width: "100%",
                  fontFamily: "'DM Sans', sans-serif",
                }}
                onFocus={(e) => { e.target.style.outline = "none"; }}
              />
              {searchQuery && (
                <Box as="button" onClick={() => setSearchQuery("")} color={TEXT_MUTED} fontSize="12px" _hover={{ color: TEXT_MAIN }} cursor="pointer">
                  Clear
                </Box>
              )}
            </Flex>
          </Box>
        </Flex>
      </Box>

      {/* ── SEARCH STATUS BAR ── */}
      {isSearching && (
        <Box bg={DARK2} borderBottom={`1px solid ${BORDER}`} py={4} px={12}>
          <Container maxW="1400px">
            <Flex justify="space-between" align="center">
              <Text fontSize="13px" color={TEXT_MUTED} letterSpacing="0.02em">
                {totalSearchMatches > 0
                  ? `${totalSearchMatches} ${totalSearchMatches === 1 ? "result" : "results"} for "${searchQuery.trim()}"`
                  : `No results for "${searchQuery.trim()}"`}
              </Text>
              <Box as="button" onClick={() => setSearchQuery("")} color={GOLD} fontSize="12px" letterSpacing="0.1em" textTransform="uppercase" cursor="pointer" _hover={{ color: GOLD_LIGHT }}>
                Clear Search
              </Box>
            </Flex>
          </Container>
        </Box>
      )}

      {/* ── CATEGORY FILTER TABS ── */}
      <>
          <Box bg={DARK2} borderBottom={`1px solid ${BORDER}`}>
            <Container maxW="1400px" px={12}>
              <Flex gap={0} overflowX="auto" css={{ "&::-webkit-scrollbar": { height: "0px" }, scrollbarWidth: "none" }}>
                <Box
                  as="button" px={8} py={5} fontSize="12px" letterSpacing="0.15em" textTransform="uppercase"
                  color={activeCategory === null ? GOLD : TEXT_MUTED}
                  borderBottom={activeCategory === null ? `2px solid ${GOLD}` : "2px solid transparent"}
                  transition="all 0.3s" _hover={{ color: GOLD }}
                  onClick={() => setActiveCategory(null)} cursor="pointer" whiteSpace="nowrap"
                  fontFamily="'DM Sans', sans-serif"
                >
                  All Collections
                </Box>
                {CATEGORIES.map((cat) => (
                  <Box
                    key={cat.id}
                    as="button" px={8} py={5} fontSize="12px" letterSpacing="0.15em" textTransform="uppercase"
                    color={activeCategory === cat.id ? GOLD : TEXT_MUTED}
                    borderBottom={activeCategory === cat.id ? `2px solid ${GOLD}` : "2px solid transparent"}
                    transition="all 0.3s" _hover={{ color: GOLD }}
                    onClick={() => setActiveCategory(cat.id)} cursor="pointer" whiteSpace="nowrap"
                    fontFamily="'DM Sans', sans-serif"
                  >
                    {cat.name}
                  </Box>
                ))}
              </Flex>
            </Container>
          </Box>

          {/* ── CATEGORY SECTIONS ── */}
          {loading ? (
            <Flex justify="center" py={32}>
              <Box w="40px" h="40px" borderRadius="full" border="2px solid" borderColor={GOLD} borderTopColor="transparent" animation="spin 1s linear infinite" />
            </Flex>
          ) : isSearching && displayGrouped.length === 0 ? (
            <VStack py={28} gap={4}>
              <Text className="serif" fontSize="26px" color={TEXT_MUTED}>No products found</Text>
              <Text fontSize="14px" color={TEXT_DIM}>Try a different search term</Text>
            </VStack>
          ) : (
            displayGrouped.map((category, idx) => (
              <Box key={category.id} bg={idx % 2 === 0 ? DARK : DARK2} py={20} px={12}>
                <Container maxW="1400px">
                  {/* Category Header */}
                  <Flex direction={{ base: "column", md: "row" }} justify="space-between" align={{ base: "flex-start", md: "flex-end" }} mb={12} gap={6}>
                    <Box maxW="500px">
                      <SectionTag>{category.label}</SectionTag>
                      <SectionHeading italic="Collection">{category.name}</SectionHeading>
                      <Text fontSize="14px" color={TEXT_MUTED} lineHeight={1.8} mt={5}>
                        {category.description}
                      </Text>
                    </Box>
                    <Link to="/product">
                      <Button {...btnOutline} flexShrink={0}>View All</Button>
                    </Link>
                  </Flex>

                  {/* Category Hero Image */}
                  <Box
                    className="category-hero-card"
                    position="relative" overflow="hidden" mb={12}
                    h={{ base: "240px", md: "360px" }} cursor="pointer"
                    onClick={() => navigate("/product")}
                  >
                    <img className="category-hero-img" src={category.img} alt={category.name} onError={handleImgError} />
                    <Box position="absolute" bottom={0} left={0} right={0} p={8} bgGradient="linear(to-t, rgba(0,0,0,0.85), transparent)">
                      <HStack gap={2} color="rgba(232,230,224,0.6)">
                        <Text fontSize="12px" letterSpacing="0.1em" textTransform="uppercase">Explore {category.name}</Text>
                        <Arrow />
                      </HStack>
                    </Box>
                  </Box>

                  {/* Products Grid */}
                  {category.products.length > 0 ? (
                    <>
                      <Grid templateColumns={{ base: "1fr", sm: "repeat(2,1fr)", md: "repeat(3,1fr)", lg: "repeat(4,1fr)" }} gap={4}>
                        {category.products.slice(0, isSearching ? 8 : 4).map((product) => (
                          <Box
                            key={product._id}
                            className="product-card"
                            bg={SURFACE} border="1px solid rgba(255,255,255,0.05)"
                            overflow="hidden" cursor="pointer"
                            transition="all 0.4s cubic-bezier(0.16,1,0.3,1)"
                            _hover={{ borderColor: "rgba(201,169,110,0.3)", transform: "translateY(-8px)", boxShadow: "0 32px 64px rgba(0,0,0,0.5)" }}
                            onClick={() => navigate("/product")}
                          >
                            <Box position="relative" overflow="hidden">
                              <img className="product-card-img" src={product.image || FALLBACK_IMG} alt={product.name} onError={handleImgError} />
                            </Box>
                            <Box p={6}>
                              <Text fontSize="11px" letterSpacing="0.15em" textTransform="uppercase" color={TEXT_DIM} mb={2}>LuxeHub Original</Text>
                              <Text className="serif" fontSize="20px" fontWeight={300} color={TEXT_MAIN} mb={4}>{product.name}</Text>
                              <Flex justify="space-between" align="center">
                                <Text color={GOLD} fontSize="18px" fontWeight={400}>₦{product.price.toLocaleString()}</Text>
                                <Box as="button" bg="transparent" border="1px solid rgba(201,169,110,0.3)" color={GOLD} px={4} py={2} fontSize="11px" letterSpacing="0.1em" textTransform="uppercase" cursor="pointer" transition="all 0.3s" _hover={{ bg: GOLD, color: DARK }}>View</Box>
                              </Flex>
                            </Box>
                          </Box>
                        ))}
                      </Grid>
                      <Flex justify="center" mt={10}>
                        <Link to="/product">
                          <Button {...btnOutline}>{category.products.length} {category.products.length === 1 ? "Product" : "Products"} Available</Button>
                        </Link>
                      </Flex>
                    </>
                  ) : (
                    <VStack py={16} gap={3} border="1px dashed rgba(201,169,110,0.2)" borderRadius="md">
                      <Text className="serif" fontSize="22px" color={TEXT_MUTED}>Coming Soon</Text>
                      <Text fontSize="13px" color={TEXT_DIM}>New {category.name.toLowerCase()} products are on their way</Text>
                    </VStack>
                  )}
                </Container>
              </Box>
            ))
          )}
        </>

      {/* ── FOOTER ── */}
      <Box as="footer" bg={DARK} pt={16} pb={10} px={12} borderTop={`1px solid ${BORDER}`}>
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
              { title: "Shop", links: ["New Arrivals", "Best Sellers", "Sale", "Gift Cards"] },
              { title: "Company", links: ["About Us", "Careers", "Press", "Partners"] },
              { title: "Support", links: ["FAQ", "Returns", "Track Order", "Contact"] },
            ].map((col) => (
              <Box key={col.title}>
                <Text fontSize="11px" letterSpacing="0.2em" textTransform="uppercase" color={GOLD} mb={6}>{col.title}</Text>
                {col.links.map((l) => (
                  <Box key={l} className="footer-link" fontSize="13px" color="rgba(232,230,224,0.4)" cursor="pointer" transition="color 0.2s" mb={3} _hover={{ color: TEXT_MAIN }}>{l}</Box>
                ))}
              </Box>
            ))}
          </Grid>
          <Flex borderTop="1px solid rgba(255,255,255,0.07)" pt={8} justify="space-between" align="center">
            <Text fontSize="12px" color="rgba(232,230,224,0.25)" letterSpacing="0.05em">© 2026 LuxeHub. All Rights Reserved.</Text>
            <Text fontSize="12px" color="rgba(232,230,224,0.25)" letterSpacing="0.05em">Privacy · Terms · Cookies</Text>
          </Flex>
        </Container>
      </Box>
    </Box>
  );
}