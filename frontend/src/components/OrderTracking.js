import React, { useEffect, useState } from "react";
import { Box, Paper, Typography, Button } from "@mui/material";
import { fetchOrders, invoiceDownload } from "../services/api";

export default function OrderTracking(){
  const uid = localStorage.getItem("user_id") || "buyer-demo";
  const [orders, setOrders] = useState([]);
  useEffect(()=> {
    fetchOrders({ buyer_id: uid }).then(r => setOrders(r.orders || []));
  }, []);
  const download = async (id) => {
    const blob = await invoiceDownload(id);
    const url = window.URL.createObjectURL(new Blob([blob]));
    const a = document.createElement('a');
    a.href = url; a.download = `invoice_${id}.pdf`; document.body.appendChild(a); a.click(); a.remove();
  };
  return (
    <Box sx={{ maxWidth:900, mx:"auto", mt:3 }}>
      <Paper sx={{ p:2 }}>
        <Typography variant="h6">Your Orders</Typography>
        {orders.map(o=> (
          <Box key={o.id} sx={{ borderBottom:"1px solid #eee", py:1 }}>
            <Typography sx={{ fontWeight:700 }}>{o.id} • {o.status}</Typography>
            <Typography variant="caption">Total: ₹{o.total} • {o.created_at}</Typography>
            <Box sx={{ mt:1 }}>
              <Button size="small" onClick={()=> download(o.id)}>Download Invoice</Button>
            </Box>
          </Box>
        ))}
      </Paper>
    </Box>
  );
}