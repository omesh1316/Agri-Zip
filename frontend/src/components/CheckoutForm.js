import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Grid,
  RadioGroup,
  FormControlLabel,
  Radio,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useCart } from "./context/CartContext";
import axios from "axios";

const API_BASE = "http://127.0.0.1:5000";

export default function CheckoutForm() {
  const navigate = useNavigate();
  const { items, total, clear } = useCart(); // ✅ Get from CartContext instead of location.state

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    paymentMethod: "cod",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Get logged-in user from localStorage
  useEffect(() => {
    const username = localStorage.getItem("username") || "";
    const email = localStorage.getItem("email") || "";

    if (!username) {
      setError("Please login first");
      setTimeout(() => navigate("/login"), 2000);
      return;
    }

    if (!items || items.length === 0) {
      setError("Cart is empty");
      setTimeout(() => navigate("/cart"), 2000);
      return;
    }

    setFormData((prev) => ({
      ...prev,
      fullName: username,
      email: email,
    }));
  }, [navigate, items]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.fullName || !formData.phone || !formData.address || !formData.city || !formData.state || !formData.pincode) {
      setError("All fields are required");
      return false;
    }
    if (!/^\d{10}$/.test(formData.phone)) {
      setError("Phone must be 10 digits");
      return false;
    }
    if (!/^\d{6}$/.test(formData.pincode)) {
      setError("Pincode must be 6 digits");
      return false;
    }
    return true;
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("access_token");
      const username = localStorage.getItem("username");

      if (!token) {
        setError("Session expired. Please login again");
        navigate("/login");
        return;
      }

      const orderPayload = {
        buyer_id: username || "guest",
        items: items.map((i) => ({
          product_id: i.product.id,
          qty: i.qty,
        })),
        shipping: {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
        },
        payment_method: formData.paymentMethod,
      };

      console.log("Order payload:", orderPayload);

      const res = await axios.post(`${API_BASE}/api/checkout`, orderPayload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert(`✅ Order placed successfully!\nOrder ID: ${res.data.order.id}\nTotal: ₹${res.data.order.total}`);
      clear(); // Clear cart after successful order
      localStorage.removeItem("cart_items");
      navigate("/my-orders");
    } catch (e) {
      console.error("Checkout error:", e);
      setError(e.response?.data?.error || e.response?.data?.msg || e.message || "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  if (!items || items.length === 0) {
    return (
      <Box sx={{ py: 3 }}>
        <Alert severity="warning">Cart is empty. Redirecting to shop...</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ py: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: "bold" }}>
        📋 Checkout
      </Typography>

      <Grid container spacing={3}>
        {/* Order Summary */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 2, backgroundColor: "#f5f5f5" }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
              📦 Order Summary
            </Typography>
            {items.map((item) => (
              <Box key={item.product.id} sx={{ mb: 2, display: "flex", justifyContent: "space-between" }}>
                <Typography>
                  {item.product.title} x {item.qty}
                </Typography>
                <Typography>₹{(item.product.price * item.qty).toFixed(2)}</Typography>
              </Box>
            ))}
            <Box sx={{ borderTop: "1px solid #ddd", pt: 2, mt: 2 }}>
              <Typography variant="h6">
                <strong>Total: ₹{total.toFixed(2)}</strong>
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Checkout Form */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3 }}>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
              👤 Delivery Details
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Full Name"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  disabled
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="10 digit number"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  multiline
                  rows={3}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="City"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="State"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Pincode"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  placeholder="6 digit"
                />
              </Grid>
            </Grid>

            <Typography variant="h6" sx={{ mb: 2, mt: 3, fontWeight: "bold" }}>
              💳 Payment Method
            </Typography>

            <RadioGroup
              value={formData.paymentMethod}
              onChange={(e) => setFormData((prev) => ({ ...prev, paymentMethod: e.target.value }))}
            >
              <FormControlLabel value="cod" control={<Radio />} label="💰 Cash on Delivery (COD)" />
              <FormControlLabel value="upi" control={<Radio />} label="📱 UPI (Coming Soon)" disabled />
              <FormControlLabel value="card" control={<Radio />} label="💳 Credit/Debit Card (Coming Soon)" disabled />
            </RadioGroup>

            <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
              <Button variant="outlined" onClick={() => navigate("/cart")}>
                Back to Cart
              </Button>
              <Button variant="contained" color="success" onClick={handlePlaceOrder} disabled={loading} fullWidth>
                {loading ? <CircularProgress size={24} /> : `Place Order - ₹${total.toFixed(2)}`}
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}