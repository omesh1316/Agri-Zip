import React, { useEffect, useState } from "react";
import axios from "axios";
import { Box, Button, Typography, Paper } from "@mui/material";

function ProductsList() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const currentUsername = localStorage.getItem("username");

  useEffect(() => {
    axios.get("http://localhost:5000/products")
      .then(res => setProducts(res.data))
      .catch(() => alert("Error loading products"));
  }, []);

  // Add product to cart
  const addToCart = (product) => {
    const found = cart.find(item => item.product_id === product.id);
    if (found) {
      setCart(cart.map(item =>
        item.product_id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { product_id: product.id, quantity: 1 }]);
    }
  };

  // Remove product from cart
  const removeFromCart = (product_id) => {
    setCart(cart.filter(item => item.product_id !== product_id));
  };

  // Place order
  const placeOrder = async () => {
    if (cart.length === 0) {
      alert("Cart is empty!");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:5000/orders", { items: cart }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Order placed successfully!");
      setCart([]);
    } catch (err) {
      alert("Order failed! Please login and try again.");
    }
  };

  // Delete product
  const handleDeleteProduct = async (productId) => {
    const token = localStorage.getItem("token");
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await axios.delete(`http://localhost:5000/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(products.filter(p => p.id !== productId));
    } catch (err) {
      alert("Delete failed!");
    }
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>Available Products (Crops & Pesticides)</Typography>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
        {products.map(prod => (
          <Paper key={prod.id} sx={{ p: 2, width: 250 }}>
            <Typography variant="h6">{prod.name}</Typography>
            <Typography>Type: {prod.type}</Typography>
            <Typography>Price: ₹{prod.price}</Typography>
            <Typography>{prod.description}</Typography>
            {prod.image && <img src={prod.image} alt={prod.name} style={{ width: "100%", marginBottom: 8 }} />}
            <Button
              variant="contained"
              color="success"
              onClick={() => addToCart(prod)}
              sx={{ mt: 1 }}
            >
              Add to Cart
            </Button>
            {/* Delete button sirf seller ya admin ko dikhe */}
            {(prod.seller_username === currentUsername || currentUsername === "admin") && (
              <Button
                variant="outlined"
                color="error"
                sx={{ mt: 1, ml: 1 }}
                onClick={() => handleDeleteProduct(prod.id)}
              >
                Delete
              </Button>
            )}
          </Paper>
        ))}
      </Box>

      {/* Cart Section */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6">Your Cart</Typography>
        {cart.length === 0 ? (
          <Typography>No items in cart.</Typography>
        ) : (
          <Box>
            {cart.map(item => {
              const prod = products.find(p => p.id === item.product_id);
              return (
                <Box key={item.product_id} sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <Typography sx={{ flex: 1 }}>
                    {prod ? prod.name : "Product"} x {item.quantity}
                  </Typography>
                  <Button color="error" onClick={() => removeFromCart(item.product_id)}>Remove</Button>
                </Box>
              );
            })}
            <Button variant="contained" color="primary" onClick={placeOrder} sx={{ mt: 2 }}>
              Place Order
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default ProductsList;