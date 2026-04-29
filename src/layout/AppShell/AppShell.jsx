import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  BottomNavigation,
  BottomNavigationAction,
  Avatar,
  Menu,
  MenuItem,
  Tooltip,
  useMediaQuery,
  useTheme,
  Divider,
} from "@mui/material";
import {
  Dashboard,
  Checkroom,
  Favorite,
  History,
  Explore,
  LocalLaundryService,
  Settings,
  Menu as MenuIcon,
  Brightness4,
  Brightness7,
  Logout,
  Person,
} from "@mui/icons-material";
import { useAuth } from "../../contexts/AuthContext";
import { useThemeMode } from "../../contexts/ThemeContext";
import BrandLogo from "../../components/BrandLogo";
import "./AppShell.scss";

const NAV_ITEMS = [
  { label: "Dashboard", icon: <Dashboard />, path: "/dashboard" },
  { label: "Wardrobe", icon: <Checkroom />, path: "/wardrobe" },
  { label: "Favorites", icon: <Favorite />, path: "/favorites" },
  { label: "History", icon: <History />, path: "/history" },
  { label: "Explore", icon: <Explore />, path: "/explore" },
  { label: "Laundry", icon: <LocalLaundryService />, path: "/laundry" },
  { label: "Settings", icon: <Settings />, path: "/settings" },
];

const PAGE_META = {
  "/dashboard": {
    title: "Overview",
    subtitle: "Curated outfit insights and daily wardrobe context.",
  },
  "/wardrobe": {
    title: "Wardrobe",
    subtitle: "Organize pieces, favorites, and styling-ready essentials.",
  },
  "/explore": {
    title: "Explore Looks",
    subtitle: "Browse occasion-ready combinations tailored to your closet.",
  },
  "/favorites": {
    title: "Favorite Styles",
    subtitle: "Review your strongest accepted looks by occasion.",
  },
  "/history": {
    title: "Outfit History",
    subtitle: "Track what you wore across the last 14 days.",
  },
  "/laundry": {
    title: "Laundry Flow",
    subtitle: "Track what is out of rotation and what is ready to return.",
  },
  "/settings": {
    title: "Preferences",
    subtitle: "Tune your profile, theme, and wardrobe defaults.",
  },
};

const DRAWER_WIDTH = 240;

export default function AppShell() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useThemeMode();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const activeIndex = NAV_ITEMS.findIndex((n) =>
    location.pathname.startsWith(n.path),
  );
  const activeIdx = activeIndex === -1 ? 0 : activeIndex;
  const pageMeta =
    PAGE_META[
      NAV_ITEMS.find((item) => location.pathname.startsWith(item.path))?.path ||
        "/dashboard"
    ];

  const handleNav = (path) => {
    navigate(path);
    setDrawerOpen(false);
  };

  const drawerContent = (
    <Box className="app-drawer">
      <Box className="app-drawer__brand">
        <Typography variant="overline" className="app-drawer__eyebrow">
          Personal Stylist OS
        </Typography>
        <BrandLogo subtitle="AI wardrobe studio" />
        <Typography variant="caption" color="text.secondary">
          Style intelligence for the clothes you already own.
        </Typography>
      </Box>
      <Divider />
      <List sx={{ mt: 1, flex: 1 }}>
        {NAV_ITEMS.map((item) => (
          <ListItemButton
            key={item.path}
            selected={location.pathname.startsWith(item.path)}
            onClick={() => handleNav(item.path)}
            sx={{ borderRadius: 2, mx: 1, mb: 0.5 }}
          >
            <ListItemIcon
              sx={{
                minWidth: 40,
                color: location.pathname.startsWith(item.path)
                  ? "primary.main"
                  : "inherit",
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
      <Divider />
      <Box sx={{ p: 2 }}>
        <ListItemButton onClick={logout} sx={{ borderRadius: 2 }}>
          <ListItemIcon sx={{ minWidth: 40 }}>
            <Logout />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Box className="app-shell">
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          zIndex: theme.zIndex.drawer + 1,
          borderBottom: `1px solid ${theme.palette.divider}`,
          bgcolor: isDark
            ? "rgba(20, 32, 51, 0.82)"
            : "rgba(255, 255, 255, 0.78)",
          backdropFilter: "blur(22px)",
          color: "text.primary",
        }}
      >
        <Toolbar className="app-shell__toolbar">
          {isMobile && (
            <IconButton
              edge="start"
              onClick={() => setDrawerOpen(true)}
              sx={{ mr: 1 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Box className="app-shell__title-block" sx={{ flexGrow: 1 }}>
            {isMobile ? (
              <BrandLogo compact showSubtitle={false} titleVariant="h6" />
            ) : (
              <Typography variant="body2" className="app-shell__eyebrow">
                {pageMeta.title}
              </Typography>
            )}
            {!isMobile && (
              <Typography variant="body2" color="text.secondary">
                {pageMeta.subtitle}
              </Typography>
            )}
          </Box>
          <Tooltip title={isDark ? "Light mode" : "Dark mode"}>
            <IconButton onClick={toggleTheme} size="small" sx={{ mr: 1 }}>
              {isDark ? <Brightness7 /> : <Brightness4 />}
            </IconButton>
          </Tooltip>
          <Tooltip title={user?.name || "Account"}>
            <IconButton
              onClick={(e) => setAnchorEl(e.currentTarget)}
              size="small"
            >
              <Avatar
                src={user?.avatar}
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: "primary.main",
                  fontSize: 14,
                  "& img": {
                    objectFit: "contain",
                    objectPosition: "center",
                    backgroundColor: "rgba(255,255,255,0.75)",
                    padding: "1px",
                  },
                }}
              >
                {user?.name?.[0]}
              </Avatar>
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          >
            <MenuItem disabled>
              <Typography variant="body2" color="text.secondary">
                {user?.email}
              </Typography>
            </MenuItem>
            <Divider />
            <MenuItem
              onClick={() => {
                setAnchorEl(null);
                navigate("/settings");
              }}
            >
              <Person fontSize="small" sx={{ mr: 1 }} /> Settings
            </MenuItem>
            <MenuItem
              onClick={() => {
                setAnchorEl(null);
                logout();
              }}
            >
              <Logout fontSize="small" sx={{ mr: 1 }} /> Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Side drawer - desktop */}
      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={{
            width: DRAWER_WIDTH,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: DRAWER_WIDTH,
              boxSizing: "border-box",
              borderRight: `1px solid ${theme.palette.divider}`,
              bgcolor: isDark
                ? "rgba(20, 32, 51, 0.86)"
                : "rgba(255, 250, 243, 0.78)",
              top: 72,
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      {/* Mobile drawer */}
      {isMobile && (
        <Drawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          sx={{
            "& .MuiDrawer-paper": {
              width: DRAWER_WIDTH,
              bgcolor: isDark
                ? "rgba(20, 32, 51, 0.92)"
                : "rgba(255, 250, 243, 0.92)",
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      {/* Main content */}
      <Box component="main" className="app-shell__main">
        <Toolbar />
        <Box className="app-shell__content" sx={{ pb: isMobile ? 8 : 3 }}>
          <Outlet />
        </Box>
      </Box>

      {/* Bottom nav - mobile */}
      {isMobile && (
        <BottomNavigation
          value={activeIdx}
          onChange={(_, newVal) => handleNav(NAV_ITEMS[newVal].path)}
          sx={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            borderTop: `1px solid ${theme.palette.divider}`,
            zIndex: theme.zIndex.appBar,
          }}
        >
          {NAV_ITEMS.map((item) => (
            <BottomNavigationAction
              key={item.path}
              label={item.label}
              icon={item.icon}
            />
          ))}
        </BottomNavigation>
      )}
    </Box>
  );
}
