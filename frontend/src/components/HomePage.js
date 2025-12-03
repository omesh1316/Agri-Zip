// ...existing code...
import { Link } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { Box, Button, Typography, Grid, Paper, Card, CardContent } from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import farmerAnim from "../assets/farmer.json";
import Lottie from "lottie-react";

export default function HomePage() {
  const navigate = useNavigate();
  const [news, setNews] = useState([]);

  // Static suggestions for farmers
  const suggestions = [
    "मिट्टी की जांच हर सीजन में जरूर कराएं।",
    "फसल चक्र अपनाएँ — मिट्टी की उर्वरता बनी रहती है।",
    "समय पर सिंचाई और उर्वरक का प्रयोग करें।",
    "सरकारी योजनाओं का लाभ उठाने के लिए किसान पोर्टल पर पंजीकरण करें।",
    "कीट/रोग दिखे तो तुरंत कृषि अधिकारी से संपर्क करें।",
    "मौसम पूर्वानुमान के अनुसार बुवाई और कटाई करें।"
  ];

  useEffect(() => {
    const fetchNews = () => {
      axios.get("http://127.0.0.1:5000/news")
        .then(res => {
          setNews(res.data.news || []);
        })
        .catch(() => setNews([]));
    };
    fetchNews();
    const interval = setInterval(fetchNews, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Box sx={{ py: 4, background: "linear-gradient(180deg,#f3f7f3 0%, #eef7ee 100%)", minHeight: "100vh" }}>
      <Typography variant="h4" align="center" gutterBottom sx={{ mb: 3, fontWeight: "bold", color: "#2e7d32" }}>
        🌱 AI Agri Assistant
      </Typography>

      {/* Central card - matches Crop prediction / NPK theme */}
      <Box sx={{ maxWidth: 1000, mx: "auto", px: 2 }}>
        <Paper sx={{
          p: { xs: 2, sm: 3 },
          borderRadius: 3,
          background: "rgba(255,255,255,0.9)",
          border: "2px solid #81c784",
          boxShadow: "0 6px 30px rgba(0,0,0,0.06)",
        }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={5} sx={{ textAlign: "center" }}>
              <Box sx={{ maxWidth: 360, mx: "auto" }}>
                <Lottie animationData={farmerAnim} loop={true} />
              </Box>
            </Grid>

            <Grid item xs={12} md={7}>
              <Typography variant="h5" sx={{ color: "#2e7d32", fontWeight: 800, mb: 1 }}>
                🌾 Quick Tools for Farmers
              </Typography>
              <Typography variant="body1" sx={{ color: "text.secondary", mb: 2 }}>
                Use the Crop Prediction and NPK Recommendation tools to optimise fertiliser use and increase yield.
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Card sx={{ border: "1px solid #c8e6c9", bgcolor: "#e8f5e9" }}>
                    <CardContent>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#2e7d32", mb: 1 }}>
                        🌾 Crop Prediction
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
                        Enter soil & weather inputs to get best crop suggestions with confidence scores.
                      </Typography>
                      <Button
                        component={Link}
                        to="/predict"
                        variant="contained"
                        sx={{ background: "#2e7d32", "&:hover": { background: "#1b5e20" }, fontWeight: 700 }}
                        fullWidth
                      >
                        Open Crop Predictor
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Card sx={{ border: "1px solid #d1c4e9", bgcolor: "#f3e5f5" }}>
                    <CardContent>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#6a1b9a", mb: 1 }}>
                        🧪 NPK Recommendation
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
                        Quick NPK guidance and adjustments for selected crops based on visible symptoms.
                      </Typography>
                      <Button
                        component={Link}
                        to="/npk"
                        variant="contained"
                        sx={{ background: "#6a1b9a", "&:hover": { background: "#4a148c" }, fontWeight: 700 }}
                        fullWidth
                      >
                        Open NPK Tool
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* quick action buttons */}
              <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
                <Button component={Link} to="/weather-forecast" variant="outlined" sx={{ borderColor: "#81c784", color: "#2e7d32", fontWeight: 700 }}>
                  ☁️ Weather Forecast
                </Button>
                <Button component={Link} to="/market-price" variant="outlined" sx={{ borderColor: "#81c784", color: "#2e7d32", fontWeight: 700 }}>
                  💹 Market Price
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Suggestions + News */}
        <Grid container spacing={2} sx={{ mt: 3 }}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, borderLeft: "6px solid #388e3c", bgcolor: "#fff", boxShadow: 1 }}>
              <Typography variant="h6" sx={{ color: "#388e3c", fontWeight: "bold", mb: 1 }}>
                किसान के लिए सुझाव
              </Typography>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                {suggestions.map((tip, idx) => (
                  <li key={idx} style={{ marginBottom: 6, fontSize: 15 }}>{tip}</li>
                ))}
              </ul>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, bgcolor: "#fff", boxShadow: 1 }}>
              <Typography variant="h6" sx={{ color: "#2e7d32", fontWeight: "bold", mb: 1 }}>
                ताज़ा खबरें
              </Typography>
              {news.length === 0 ? (
                <Typography color="text.secondary">कोई नवीनतम अपडेट नहीं।</Typography>
              ) : (
                <Box component="div" sx={{ maxHeight: 140, overflowY: "auto" }}>
                  {news.map((item, idx) => (
                    <Box key={idx} sx={{ mb: 1 }}>
                      <Typography sx={{ fontWeight: 700 }}>{item.title}</Typography>
                      <Typography variant="body2" color="text.secondary">{item.description}</Typography>
                      {item.link && <a href={item.link} target="_blank" rel="noreferrer" style={{ color: "#2e7d32", fontWeight: 700 }}>More</a>}
                    </Box>
                  ))}
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}