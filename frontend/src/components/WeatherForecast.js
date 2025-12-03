import React, { useState } from "react";
import { Box, Button, TextField, Typography, Paper, Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import axios from "axios";

export default function WeatherForecast() {
  const [city, setCity] = useState("");
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(false);

  const getForecastByCity = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/weather-forecast", { params: { city } });
      setForecast(res.data.forecast);
    } catch (err) {
      alert("Failed to fetch forecast");
    }
    setLoading(false);
  };

  const getForecastByLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const { latitude, longitude } = pos.coords;
        const res = await axios.get("http://localhost:5000/weather-forecast", {
          params: { lat: latitude, lon: longitude }
        });
        setForecast(res.data.forecast);
      } catch (err) {
        alert("Failed to fetch forecast");
      }
      setLoading(false);
    });
  };

  return (
    <Paper sx={{ p: 3, mt: 3 }}>
      <Typography variant="h5" gutterBottom>7-Day Weather Forecast</Typography>
      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <TextField
          label="Enter City"
          value={city}
          onChange={e => setCity(e.target.value)}
        />
        <Button variant="contained" onClick={getForecastByCity} disabled={loading}>
          Get by City
        </Button>
        <Button variant="outlined" onClick={getForecastByLocation} disabled={loading}>
          Use Current Location
        </Button>
      </Box>
      {forecast.length > 0 && (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Temperature (°C)</TableCell>
              <TableCell>Humidity (%)</TableCell>
              <TableCell>Weather</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {forecast.map((day, idx) => (
              <TableRow key={idx}>
                <TableCell>{new Date(day.date * 1000).toLocaleDateString()}</TableCell>
                <TableCell>{day.temp}</TableCell>
                <TableCell>{day.humidity}</TableCell>
                <TableCell>{day.weather}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Paper>
  );
}