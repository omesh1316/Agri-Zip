import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Avatar,
  useMediaQuery,
  Tooltip,
  Badge,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import HomeIcon from "@mui/icons-material/Home";
import StoreIcon from "@mui/icons-material/Store";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import AgricultureIcon from "@mui/icons-material/Agriculture";
import ScienceIcon from "@mui/icons-material/Science";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import AssignmentIcon from "@mui/icons-material/Assignment";
import CloudIcon from "@mui/icons-material/Cloud";
import PriceChangeIcon from "@mui/icons-material/PriceChange";
import LogoutIcon from "@mui/icons-material/Logout";
import { Link, useLocation } from "react-router-dom";
import { useCart } from "./context/CartContext";

// ...rest of file unchanged...

const navItems = [
  { label: "Home", icon: <HomeIcon />, to: "/" },
  { label: "Shop", icon: <StoreIcon />, to: "/shop" },
  { label: "Cart", icon: <ShoppingCartIcon />, to: "/cart" },
  { label: "My Orders", icon: <AssignmentIcon />, to: "/my-orders" },
  { label: "Crop Prediction", icon: <AgricultureIcon />, to: "/predict" },
  { label: "Disease Detection", icon: <ScienceIcon />, to: "/disease" },
  { label: "NPK Test", icon: <AssignmentIcon />, to: "/npk" },
  { label: "Weather", icon: <CloudIcon />, to: "/weather" },
  { label: "Market Price", icon: <PriceChangeIcon />, to: "/market" },
  { label: "Admin", icon: <AdminPanelSettingsIcon />, to: "/admin" },
];

const iconBgColors = [
  "linear-gradient(135deg, #43cea2 0%, #185a9d 100%)",
  "linear-gradient(135deg, #f7971e 0%, #ffd200 100%)",
  "linear-gradient(135deg, #f857a6 0%, #ff5858 100%)",
  "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
  "linear-gradient(135deg, #c471f5 0%, #fa71cd 100%)",
  "linear-gradient(135deg, #43cea2 0%, #185a9d 100%)",
  "linear-gradient(135deg, #f7971e 0%, #ffd200 100%)",
  "linear-gradient(135deg, #f857a6 0%, #ff5858 100%)",
  "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
  "linear-gradient(135deg, #c471f5 0%, #fa71cd 100%)",
];

export default function Header({ onLogout }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width:900px)");
  const location = useLocation();
  const { items } = useCart();

  const handleDrawerToggle = () => setDrawerOpen(!drawerOpen);

  const menuButtons = navItems.map((item, idx) => {
    const isCart = item.to === "/cart";
    return (
      <Tooltip title={item.label} key={item.label}>
        <IconButton
          component={Link}
          to={item.to}
          sx={{
            mx: 1,
            p: 0.7,
            borderRadius: "50%",
            background: location.pathname === item.to ? iconBgColors[idx % iconBgColors.length] : "#f5f5f5",
            boxShadow: location.pathname === item.to ? 3 : 1,
            transition: "all 0.2s",
            "&:hover": {
              background: iconBgColors[idx % iconBgColors.length],
              boxShadow: 10,
              transform: "scale(1.12)",
            },
          }}
        >
          <Badge badgeContent={isCart ? items.length : 0} color="error">
            <Avatar
              sx={{
                bgcolor: "transparent",
                width: 38,
                height: 38,
                color: location.pathname === item.to ? "#fff" : "#388e3c",
                fontSize: 26,
                boxShadow: "none",
              }}
            >
              {item.icon}
            </Avatar>
          </Badge>
        </IconButton>
      </Tooltip>
    );
  });

  return (
    <AppBar position="static" color="default" elevation={2} sx={{ mb: 3 }}>
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <Typography variant="h6" sx={{ fontWeight: "bold", color: "#388e3c" }}>
          🌱 AI Agri Assistant
        </Typography>
        {isMobile ? (
          <>
            <IconButton edge="end" color="inherit" onClick={handleDrawerToggle}>
              <MenuIcon />
            </IconButton>
            <Drawer anchor="right" open={drawerOpen} onClose={handleDrawerToggle}>
              <Box sx={{ width: 240 }} role="presentation" onClick={handleDrawerToggle}>
                <List>
                  {navItems.map((item) => (
                    <ListItem key={item.label} disablePadding>
                      <ListItemButton component={Link} to={item.to}>
                        <ListItemIcon>{item.icon}</ListItemIcon>
                        <ListItemText primary={item.label} />
                      </ListItemButton>
                    </ListItem>
                  ))}
                  <ListItem disablePadding>
                    <ListItemButton onClick={onLogout}>
                      <ListItemIcon>
                        <LogoutIcon color="error" />
                      </ListItemIcon>
                      <ListItemText primary="Logout" />
                    </ListItemButton>
                  </ListItem>
                </List>
              </Box>
            </Drawer>
          </>
        ) : (
          <Box sx={{ display: "flex", alignItems: "center" }}>
            {menuButtons}
            <Tooltip title="Logout">
              <IconButton
                onClick={onLogout}
                sx={{
                  mx: 1,
                  p: 0.7,
                  borderRadius: "50%",
                  background: "#fff0f0",
                  color: "#d32f2f",
                  transition: "all 0.2s",
                  "&:hover": {
                    background: "#ffebee",
                    color: "#b71c1c",
                    transform: "scale(1.12)",
                  },
                }}
              >
                <Avatar sx={{ bgcolor: "transparent", width: 38, height: 38, color: "#d32f2f", fontSize: 26 }}>
                  <LogoutIcon />
                </Avatar>
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}