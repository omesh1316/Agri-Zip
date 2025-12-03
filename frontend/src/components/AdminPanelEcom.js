import React, { useEffect, useState } from "react";
import { Box, Paper, Typography, TextField, Button, Grid } from "@mui/material";
import { fetchProducts, checkoutOrder, fetchOrders } from "../services/api";

export default function AdminPanelEcom(){
  const [orders, setOrders] = useState([]);
  useEffect(()=> fetchOrders({}).then(r=> setOrders(r.orders || [])), []);
  return (
    <Box sx={{ maxWidth:1000, mx:"auto", mt:3 }}>
      <Paper sx={{ p:2 }}>
        <Typography variant="h6">Admin — Orders</Typography>
        {orders.map(o=> (
          <Box key={o.id} sx={{ py:1, borderBottom:"1px solid #eee" }}>
            <Typography sx={{ fontWeight:700 }}>{o.id} • {o.status}</Typography>
            <Typography variant="caption">Total: ₹{o.total}</Typography>
          </Box>
        ))}
      </Paper>
    </Box>
  );
}