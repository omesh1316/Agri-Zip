import React, { useState } from "react";
import axios from "axios";
import { Box, Button, TextField, MenuItem, Typography, Paper } from "@mui/material";

function AddProduct() {
  const [form, setForm] = useState({
    name: "",
    type: "crop",
    price: "",
    description: "",
    image: ""
  });

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:5000/products", form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Product added!");
      setForm({ name: "", type: "crop", price: "", description: "", image: "" });
    } catch (err) {
      alert("Error adding product");
    }
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 400, mx: "auto" }}>
      <Typography variant="h5" gutterBottom>Add Product (Sell Crop/Pesticide)</Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <TextField
          name="name"
          label="Product Name"
          value={form.name}
          onChange={handleChange}
          required
        />
        <TextField
          select
          name="type"
          label="Type"
          value={form.type}
          onChange={handleChange}
        >
          <MenuItem value="crop">Crop</MenuItem>
          <MenuItem value="pesticide">Pesticide</MenuItem>
        </TextField>
        <TextField
          name="price"
          label="Price"
          type="number"
          value={form.price}
          onChange={handleChange}
          required
        />
        <TextField
          name="description"
          label="Description"
          multiline
          value={form.description}
          onChange={handleChange}
        />
        <TextField
          name="image"
          label="Image URL"
          value={form.image}
          onChange={handleChange}
        />
        <Button type="submit" variant="contained">Add Product</Button>
      </Box>
    </Paper>
  );
}

export default AddProduct;