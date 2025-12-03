// ...existing code...
import React, { useEffect, useState } from "react";
import { Box, Paper, Typography } from "@mui/material";
import { fetchOrders } from "../services/api";

export default function AdminPanel() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const res = await fetchOrders({});
        if (!mounted) return;
        setOrders(res.orders || []);
      } catch (err) {
        console.error("Failed to load orders:", err);
      }
    }

    load();

    return () => {
      mounted = false; // cleanup flag — function returned (not a Promise)
    };
  }, []);
  
  return (
    <Box> 
      <Paper sx={{ p:2 }}>
        <Typography variant="h6">Admin — Orders</Typography>
        {orders.map(o => (
          <Box key={o.id} sx={{ py:1, borderBottom:"1px solid #eee" }}>
            <Typography sx={{ fontWeight:700 }}>{o.id} • {o.status}</Typography>
            <Typography variant="caption">Total: ₹{o.total}</Typography>
          </Box>
        ))}
      </Paper>
    </Box>
  );
}
// ...existing code...