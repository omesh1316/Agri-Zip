import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Button,
  TextField,
  Grid,
  Typography,
  CircularProgress,
  Alert,
  Rating,
} from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { fetchProducts } from "../services/api";
import { useCart } from "./context/CartContext";

// ...rest of file unchanged...

export default function ShopAdvanced() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const { addToCart } = useCart();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await fetchProducts({ q: searchQuery });
      setProducts(res.products || []);
      setError("");
    } catch (e) {
      setError("Failed to load products");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadProducts();
  };

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    alert("Added to cart!");
  };

  return (
    <Box sx={{ py: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: "bold" }}>
        🛍️ Shop Products
      </Typography>

      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <TextField
          label="Search products..."
          variant="outlined"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ flex: 1 }}
        />
        <Button variant="contained" onClick={handleSearch}>
          Search
        </Button>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}
      {loading && <CircularProgress />}

      <Grid container spacing={2}>
        {products.map((product) => (
          <Grid item xs={12} sm={6} md={4} key={product.id}>
            <Card sx={{ boxShadow: 3, transition: "0.3s", "&:hover": { boxShadow: 6 } }}>
              <CardMedia
                sx={{
                  height: 200,
                  backgroundColor: "#f5f5f5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography variant="h6" color="textSecondary">
                  {product.title}
                </Typography>
              </CardMedia>
              <CardContent>
                <Typography variant="h6">{product.title}</Typography>
                <Typography variant="body2" color="textSecondary">
                  {product.description}
                </Typography>
                <Typography variant="h5" sx={{ mt: 1, color: "#388e3c", fontWeight: "bold" }}>
                  ₹{product.price}
                </Typography>
                <Typography variant="caption">
                  Stock: {product.stock}
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={<ShoppingCartIcon />}
                    onClick={() => handleAddToCart(product)}
                    disabled={product.stock < 1}
                    fullWidth
                  >
                    Add to Cart
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}