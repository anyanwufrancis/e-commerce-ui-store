import { useEffect, useState } from "react";
import {
  Box, Flex, HStack, Text, Button, IconButton, Drawer, Icon, Stack, Avatar,
} from "@chakra-ui/react";
import {
  Menu as MenuIcon, X as CloseIcon, Search, ShoppingBag, LogOut, UserPlus, ChevronRight,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../Component/context/AuthContext"; // adjust path to match your project

const GOLD = "#C9A96E";
const DARK = "#0A0A0B";
const TEXT_MAIN = "#F0EDE6";
const TEXT_MUTED = "#9A9A8A";
const BORDER = "rgba(201,169,110,0.15)";

function getInitials(name?: string) {
  return name
    ? name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { user, accounts, logout, switchAccount, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    navigate("/");
  };

  const handleSwitch = (userId: string) => {
    switchAccount(userId);
    setProfileOpen(false);
  };

  const initials = getInitials(user?.name);

  return (
    <>
      <Box
        position="fixed" top="0" left="0" right="0" zIndex="999"
        transition="all .4s ease"
        bg={scrolled ? "rgba(10,10,11,0.92)" : "transparent"}
        backdropFilter={scrolled ? "blur(18px)" : "none"}
        borderBottom={scrolled ? `1px solid ${BORDER}` : "none"}
      >
        <Flex h="80px" px={{ base: 5, lg: 12 }} align="center" justify="space-between">
          <Link to="/">
            <Text fontSize="30px" fontWeight="300" color={TEXT_MAIN} fontFamily="'Cormorant Garamond', serif">
              Luxe<Box as="span" color={GOLD}>Hub</Box>
            </Text>
          </Link>

          <HStack gap={10} display={{ base: "none", lg: "flex" }}>
            {[["Home", "/"], ["Shop", "/product"], ["Categories", "/categories"], ["About", "/about"]].map(([label, to]) => (
              <Link key={to} to={to}>
                <Text color={TEXT_MAIN} _hover={{ color: GOLD }} transition="color 0.2s">{label}</Text>
              </Link>
            ))}
          </HStack>

          <HStack gap={3}>
            <IconButton aria-label="search" variant="ghost" color={TEXT_MAIN}>
              <Icon size="md"><Search size={18} /></Icon>
            </IconButton>

            {/* <Box position="relative">
              <IconButton aria-label="cart" variant="ghost" color={TEXT_MAIN}>
                <Icon size="md"><ShoppingBag size={18} /></Icon>
              </IconButton>
              <Box position="absolute" top="0" right="0" w="18px" h="18px" borderRadius="full"
                bg={GOLD} color={DARK} fontSize="10px" fontWeight="bold"
                display="flex" alignItems="center" justifyContent="center">
                0
              </Box> */}
            {/* </Box> */}

            {user ? (
              <Box
                as="button"
                display={{ base: "none", lg: "flex" }}
                alignItems="center" gap={2} cursor="pointer"
                onClick={() => setProfileOpen(true)}
                _hover={{ opacity: 0.85 }} transition="opacity 0.2s"
              >
                <Avatar.Root size="sm" style={{ border: `1.5px solid ${GOLD}`, borderRadius: "50%" }}>
                  <Avatar.Fallback style={{ background: "rgba(201,169,110,0.15)", color: GOLD, fontSize: "12px", fontWeight: "600" }}>
                    {initials}
                  </Avatar.Fallback>
                </Avatar.Root>
                <ChevronRight size={14} color={GOLD} />
              </Box>
            ) : (
              <Link to="/auth">
                <Button display={{ base: "none", lg: "flex" }} bg={GOLD} color={DARK} borderRadius="0px" width="5em" _hover={{ opacity: 0.9 }}>
                  Sign In
                </Button>
              </Link>
            )}

            <IconButton display={{ base: "flex", lg: "none" }} aria-label="menu" variant="ghost" color={TEXT_MAIN} onClick={() => setMobileOpen(true)}>
              <Icon size="md"><MenuIcon /></Icon>
            </IconButton>
          </HStack>
        </Flex>
      </Box>

      {/* ── PROFILE SIDEBAR ── */}
      <Drawer.Root open={profileOpen} onOpenChange={(details) => setProfileOpen(details.open)} placement="end">
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content bg={DARK} maxW="300px">
            <Drawer.Body p={0}>

              <Flex justify="flex-end" p={4} borderBottom={`1px solid ${BORDER}`}>
                <IconButton aria-label="close" variant="ghost" color={TEXT_MAIN} onClick={() => setProfileOpen(false)}>
                  <Icon size="md"><CloseIcon /></Icon>
                </IconButton>
              </Flex>

              {/* Active profile info */}
              <Flex direction="column" align="center" py={8} px={6} borderBottom={`1px solid ${BORDER}`} gap={3}>
                <Avatar.Root size="xl" style={{ border: `2px solid ${GOLD}`, borderRadius: "50%" }}>
                  <Avatar.Fallback style={{ background: "rgba(201,169,110,0.15)", color: GOLD, fontSize: "22px", fontWeight: "600" }}>
                    {initials}
                  </Avatar.Fallback>
                </Avatar.Root>
                <Box textAlign="center">
                  <Text color={TEXT_MAIN} fontWeight="500" fontSize="16px">{user?.name || "User"}</Text>
                  <Text color={TEXT_MUTED} fontSize="13px" mt={1}>{user?.email || ""}</Text>
                  {user?.role === "admin" && (
                    <Box mt={2} display="inline-block" px={3} py="2px" fontSize="11px" borderRadius="full" bg="rgba(201,169,110,0.15)" color={GOLD}>
                      Admin
                    </Box>
                  )}
                </Box>
              </Flex>

              {/* ── Other saved accounts ── */}
              {accounts.length > 1 && (
                <Stack gap={0} py={2} borderBottom={`1px solid ${BORDER}`}>
                  {accounts
                    .filter((a) => a.user._id !== user?._id)
                    .map((a) => (
                      <Flex
                        key={a.user._id}
                        as="button"
                        align="center"
                        gap={3}
                        px={6}
                        py={3}
                        color={TEXT_MAIN}
                        _hover={{ bg: "rgba(255,255,255,0.05)" }}
                        transition="background 0.15s"
                        onClick={() => handleSwitch(a.user._id)}
                        cursor="pointer"
                        w="full"
                      >
                        <Avatar.Root size="xs" style={{ border: `1px solid ${GOLD}`, borderRadius: "50%" }}>
                          <Avatar.Fallback style={{ background: "rgba(201,169,110,0.15)", color: GOLD, fontSize: "10px", fontWeight: "600" }}>
                            {getInitials(a.user.name)}
                          </Avatar.Fallback>
                        </Avatar.Root>
                        <Box flex={1} textAlign="left" minW={0}>
                          <Text fontSize="13px" css={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.user.name}</Text>
                          <Text fontSize="11px" color={TEXT_MUTED} css={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.user.email}</Text>
                        </Box>
                      </Flex>
                    ))}
                </Stack>
              )}
              <HStack gap={3}>
  <IconButton aria-label="search" variant="ghost" color={TEXT_MAIN}>
    <Icon size="md"><Search size={18} /></Icon>
  </IconButton>

  <Box position="relative">
    <IconButton aria-label="cart" variant="ghost" color={TEXT_MAIN}>
      <Icon size="md"><ShoppingBag size={18} /></Icon>
    </IconButton>
    <Box position="absolute" top="0" right="0" w="18px" h="18px" borderRadius="full"
      bg={GOLD} color={DARK} fontSize="10px" fontWeight="bold"
      display="flex" alignItems="center" justifyContent="center">
      0
    </Box>
  </Box>

  {isAdmin && (
    <Link to="/AdminDashboard">
      <Button
        display={{ base: "none", lg: "flex" }}
        variant="outline"
        borderColor={GOLD}
        color={GOLD}
        borderRadius="0px"
        h="40px"
        px={5}
        fontSize="13px"
        _hover={{ bg: GOLD, color: DARK }}
      >
        Admin
      </Button>
    </Link>
  )}

</HStack>

            {/* Actions */}
<Stack gap={0} py={4}>
  {isAdmin && (
    <Flex
      as="button" align="center" gap={3} px={6} py={4} color={GOLD}
      _hover={{ bg: "rgba(201,169,110,0.08)" }} transition="background 0.15s"
      onClick={() => { setProfileOpen(false); navigate("/AdminDashboard"); }}
      cursor="pointer" w="full"
    >
      <ChevronRight size={18} />
      <Text fontSize="14px">Go to Admin Dashboard</Text>
    </Flex>
  )}

  <Flex
    as="button" align="center" gap={3} px={6} py={4} color={TEXT_MAIN}
    _hover={{ bg: "rgba(255,255,255,0.05)" }} transition="background 0.15s"
    onClick={() => { setProfileOpen(false); navigate("/auth"); }}
    cursor="pointer" w="full"
  >
    <UserPlus size={18} color={GOLD} />
    <Text fontSize="14px">Add another account</Text>
  </Flex>

                <Flex
                  as="button" align="center" gap={3} px={6} py={4} color="#E24B4A"
                  _hover={{ bg: "rgba(226,75,74,0.08)" }} transition="background 0.15s"
                  onClick={handleLogout}
                  cursor="pointer" w="full"
                >
                  <LogOut size={18} />
                  <Text fontSize="14px">Log out</Text>
                </Flex>
              </Stack>
            </Drawer.Body>
          </Drawer.Content>
        </Drawer.Positioner>
      </Drawer.Root>

      {/* ── MOBILE DRAWER ── */}
      <Drawer.Root open={mobileOpen} onOpenChange={(details) => setMobileOpen(details.open)} placement="end">
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content bg={DARK}>
            <Drawer.Body>
              <Flex justify="flex-end" pt={4}>
                <IconButton aria-label="close" variant="ghost" color={TEXT_MAIN} onClick={() => setMobileOpen(false)}>
                  <Icon size="md"><CloseIcon /></Icon>
                </IconButton>
              </Flex>

              {user && (
                <Flex align="center" gap={3} px={2} py={4} borderBottom={`1px solid ${BORDER}`} mb={4}>
                  <Avatar.Root size="sm" style={{ border: `1.5px solid ${GOLD}`, borderRadius: "50%" }}>
                    <Avatar.Fallback style={{ background: "rgba(201,169,110,0.15)", color: GOLD, fontSize: "12px", fontWeight: "600" }}>
                      {initials}
                    </Avatar.Fallback>
                  </Avatar.Root>
                  <Box>
                    <Text color={TEXT_MAIN} fontSize="14px" fontWeight="500">{user.name}</Text>
                    <Text color={TEXT_MUTED} fontSize="11px">{user.email}</Text>
                  </Box>
                </Flex>
              )}

              {/* Mobile: other saved accounts */}
              {accounts.filter((a) => a.user._id !== user?._id).length > 0 && (
                <Stack gap={2} mb={4} borderBottom={`1px solid ${BORDER}`} pb={4}>
                  {accounts
                    .filter((a) => a.user._id !== user?._id)
                    .map((a) => (
                      <Flex
                        key={a.user._id} as="button" align="center" gap={2} color={TEXT_MAIN}
                        onClick={() => handleSwitch(a.user._id)}
                      >
                        <Avatar.Root size="xs" style={{ border: `1px solid ${GOLD}`, borderRadius: "50%" }}>
                          <Avatar.Fallback style={{ background: "rgba(201,169,110,0.15)", color: GOLD, fontSize: "10px" }}>
                            {getInitials(a.user.name)}
                          </Avatar.Fallback>
                        </Avatar.Root>
                        <Text fontSize="13px">{a.user.name}</Text>
                      </Flex>
                    ))}
                </Stack>
              )}

            <Stack mt={4} align="start" gap={6}>
  {[["Home", "/"], ["Shop", "/product"], ["Categories", "/categories"], ["About", "/about"]].map(([label, to]) => (
    <Link key={to} to={to} onClick={() => setMobileOpen(false)}>
      <Text color={TEXT_MAIN}>{label}</Text>
    </Link>
  ))}

  {isAdmin && (
    <Link to="/AdminDashboard" onClick={() => setMobileOpen(false)}>
      <Text color={GOLD} fontWeight="500">Admin Dashboard</Text>
    </Link>
  )}


                {user ? (
                  <>
                    <Flex as="button" align="center" gap={2} color={TEXT_MAIN} onClick={() => { setMobileOpen(false); navigate("/auth"); }}>
                      <UserPlus size={16} color={GOLD} />
                      <Text fontSize="14px">Add another account</Text>
                    </Flex>
                    <Flex as="button" align="center" gap={2} color="#E24B4A" onClick={handleLogout}>
                      <LogOut size={16} />
                      <Text fontSize="14px">Log out</Text>
                    </Flex>
                  </>
                ) : (
                  <Link to="/auth">
                    <Button mt={4} bg={GOLD} color={DARK} w="full" borderRadius="0px">
                      Sign In
                    </Button>
                  </Link>
                )}
              </Stack>
            </Drawer.Body>
          </Drawer.Content>
        </Drawer.Positioner>
      </Drawer.Root>
    </>
  );
}