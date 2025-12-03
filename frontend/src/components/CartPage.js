import React from "react";
import { Box, Paper, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useCart } from "./context/CartContext";
import { useNavigate } from "react-router-dom";

export default function CartPage() {
  const { items, updateQty, remove, clear, total } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      alert("Please login to checkout");
      navigate("/login");
      return;
    }
    if (!items.length) {
      alert("Cart is empty");
      return;
    }
    // TODO: Integrate checkout API
    alert("Proceeding to checkout with total: ₹" + total.toFixed(2));
    navigate("/checkout");
  };

  return (
    <Box sx={{ py: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: "bold" }}>
        🛒 Shopping Cart
      </Typography>

      {items.length === 0 ? (
        <Typography variant="body1" color="textSecondary">
          Your cart is empty. <Button onClick={() => navigate("/shop")}>Continue Shopping</Button>
        </Typography>
      ) : (
        <>
          <TableContainer component={Paper} sx={{ mb: 3 }}>
            <Table>
              <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
                <TableRow>
                  <TableCell><strong>Product</strong></TableCell>
                  <TableCell align="right"><strong>Price</strong></TableCell>
                  <TableCell align="center"><strong>Quantity</strong></TableCell>
                  <TableCell align="right"><strong>Subtotal</strong></TableCell>
                  <TableCell align="center"><strong>Action</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.product.id}>
                    <TableCell>{item.product.title}</TableCell>
                    <TableCell align="right">₹{item.product.price}</TableCell>
                    <TableCell align="center">
                      <TextField
                        type="number"
                        size="small"
                        value={item.qty}
                        onChange={(e) => updateQty(item.product.id, parseInt(e.target.value) || 1)}
                        inputProps={{ min: 1, max: item.product.stock }}
                        sx={{ width: 60 }}
                      />
                    </TableCell>
                    <TableCell align="right">₹{(item.product.price * item.qty).toFixed(2)}</TableCell>
                    <TableCell align="center">
                      <Button size="small" color="error" startIcon={<DeleteIcon />} onClick={() => remove(item.product.id)}>
                        Remove
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Paper sx={{ p: 2, mb: 3, backgroundColor: "#f5f5f5" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography variant="h6">
                <strong>Total: ₹{total.toFixed(2)}</strong>
              </Typography>
              <Box sx={{ display: "flex", gap: 2 }}>
                <Button variant="outlined" onClick={() => clear()}>
                  Clear Cart
                </Button>
                <Button variant="contained" color="success" onClick={handleCheckout}>
                  Proceed to Checkout
                </Button>
              </Box>
            </Box>
          </Paper>

          <Button variant="text" onClick={() => navigate("/shop")}>
            ← Continue Shopping
          </Button>
        </>
      )}
    </Box>
  );
}