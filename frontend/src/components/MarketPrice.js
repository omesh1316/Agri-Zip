import React, { useState } from "react";
import { Box, Button, TextField, Typography, Paper, Table, TableBody, TableCell, TableHead, TableRow, MenuItem, Select, FormControl, InputLabel } from "@mui/material";
import axios from "axios";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";

export default function MarketPrice() {
  const [crop, setCrop] = useState("Wheat");
  const [state, setState] = useState("Maharashtra");
  const [period, setPeriod] = useState("week");
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchPrices = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/market-price", {
        params: { crop, state, period }
      });
      setPrices(res.data.prices || []);
    } catch (err) {
      alert("Failed to fetch prices");
    }
    setLoading(false);
  };

  return (
    <Paper sx={{ p: 3, mt: 3 }}>
      <Typography variant="h5" gutterBottom>Market Price (Mandi Rates)</Typography>
      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <TextField label="Crop" value={crop} onChange={e => setCrop(e.target.value)} />
        <TextField label="State" value={state} onChange={e => setState(e.target.value)} />
        <FormControl>
          <InputLabel>Period</InputLabel>
          <Select value={period} label="Period" onChange={e => setPeriod(e.target.value)}>
            <MenuItem value="week">Last 7 Days</MenuItem>
            <MenuItem value="month">Last 30 Days</MenuItem>
            <MenuItem value="year">Last 1 Year</MenuItem>
          </Select>
        </FormControl>
        <Button variant="contained" onClick={fetchPrices} disabled={loading}>
          Get Prices
        </Button>
      </Box>
      {/* Chart */}
      {prices.length > 0 && (
        <Box sx={{ width: "100%", height: 300, mb: 3 }}>
          <ResponsiveContainer>
            <LineChart data={prices}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis dataKey="modal_price" tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="modal_price" stroke="#1976d2" name="Modal Price" />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      )}
      {/* Table */}
      {prices.length > 0 && (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Market</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Min Price</TableCell>
              <TableCell>Modal Price</TableCell>
              <TableCell>Max Price</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {prices.map((item, idx) => (
              <TableRow key={idx}>
                <TableCell>{item.market}</TableCell>
                <TableCell>{item.date}</TableCell>
                <TableCell>{item.min_price}</TableCell>
                <TableCell>{item.modal_price}</TableCell>
                <TableCell>{item.max_price}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Paper>
  );
}