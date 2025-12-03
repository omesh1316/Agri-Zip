import React, { useState, useEffect } from "react";
import InputForm from "./components/InputForm";
import SignupForm from "./components/SignupForm";
import LoginForm from "./components/LoginForm";
import { useTranslation } from "react-i18next";
import { Typography, Container, Paper, Box, Button } from "@mui/material";
import { Routes, Route, Navigate } from "react-router-dom";
import jsPDF from "jspdf";
import Lottie from "lottie-react";
import plantAnimation from "./assets/plant.json";
import "./App.css";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { teal } from "@mui/material/colors";
import { GoogleOAuthProvider } from "@react-oauth/google";

import HomePage from "./components/HomePage";
import NPKQuestionnaire from "./components/NPKQuestionnaire";
import AdminPanel from "./components/AdminPanel";
import DiseaseDetect from "./components/DiseaseDetect";
import ProductsList from "./components/ProductsList";
import AddProduct from "./components/AddProducts";
import MyOrders from "./components/MyOrders";
import WeatherForecast from "./components/WeatherForecast";
import MarketPrice from "./components/MarketPrice";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ShopAdvanced from "./components/ShopAdvanced";
import CartPage from "./components/CartPage";
import CheckoutForm from "./components/CheckoutForm";

const theme = createTheme({
  palette: {
    primary: { main: teal[500] },
    secondary: { main: teal[200] },
  },
});

const pageWrapper = {
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
};

function App() {
  const [result, setResult] = useState(null);
  const [authMode, setAuthMode] = useState("login");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const accessToken = localStorage.getItem("access_token");
    setIsLoggedIn(!!(token || accessToken));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("access_token");
    localStorage.removeItem("username");
    localStorage.removeItem("cart_items");
    setIsLoggedIn(false);
    setResult(null);
  };

  const handleDownloadPDF = () => {
    if (!result) return;
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Prediction Report", 14, 20);
    doc.setFontSize(12);
    doc.text(`Crop: ${result.suggested_crop}`, 14, 40);
    doc.text(`Water Needs: ${result.water_needs}`, 14, 50);
    doc.text(`Pest Warning: ${result.pest_warning}`, 14, 60);
    doc.save("prediction_report.pdf");
  };

  const handleDownloadCSV = () => {
    if (!result) return;
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [
        "Field,Value",
        `Crop,${result.suggested_crop}`,
        `Water Needs,${result.water_needs}`,
        `Pest Warning,${result.pest_warning}`,
      ].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "prediction_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID"}>
      <ThemeProvider theme={theme}>
        <Box
          sx={{
            minHeight: "100vh",
            backgroundImage:
              "url('https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=1500&q=80')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            py: 4,
          }}
        >
          {!isLoggedIn ? (
            <Container
              maxWidth="sm"
              sx={{
                mt: 8,
                background: "rgba(255,255,255,0.92)",
                borderRadius: 3,
                py: 4,
              }}
            >
              {authMode === "signup" ? (
                <>
                  <SignupForm />
                  <Box sx={{ textAlign: "center", mt: 2 }}>
                    <Button onClick={() => setAuthMode("login")}>
                      Already have an account? Login
                    </Button>
                  </Box>
                </>
              ) : (
                <LoginForm
                  onLogin={() => setIsLoggedIn(true)}
                  onSwitch={() => setAuthMode("signup")}
                />
              )}
            </Container>
          ) : (
            <div style={pageWrapper}>
              <Header onLogout={handleLogout} />

              <Box sx={{ width: 120, mx: "auto", mb: 2, mt: 2 }}>
                <Lottie animationData={plantAnimation} loop={true} />
              </Box>

              <div style={{ flex: 1 }}>
                <Container
                  maxWidth="lg"
                  sx={{
                    background: "rgba(255,255,255,0.92)",
                    borderRadius: 3,
                    py: 4,
                  }}
                >
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route
                      path="/predict"
                      element={
                        <>
                          <Typography variant="h4" align="center" gutterBottom>
                            {t("Crop Prediction")}
                          </Typography>
                          <InputForm onResult={setResult} />
                          {result && (
                            <Paper elevation={2} sx={{ p: 3, mt: 3 }}>
                              <Typography variant="h5" gutterBottom>
                                {t("Prediction Result:")}
                              </Typography>
                              <Typography>
                                <strong>{t("Crop:")}</strong> {result.suggested_crop}
                              </Typography>
                              <Typography>
                                <strong>{t("Water Needs:")}</strong> {result.water_needs}
                              </Typography>
                              <Typography>
                                <strong>{t("Pest Warning:")}</strong> {result.pest_warning}
                              </Typography>
                              <Box sx={{ mt: 2 }}>
                                <Button variant="contained" onClick={handleDownloadPDF} sx={{ mr: 1 }}>
                                  Download PDF
                                </Button>
                                <Button variant="contained" onClick={handleDownloadCSV}>
                                  Download CSV
                                </Button>
                              </Box>
                            </Paper>
                          )}
                        </>
                      }
                    />
                    <Route path="/products" element={<ProductsList />} />
                    <Route path="/add-product" element={<AddProduct />} />
                    <Route path="/disease" element={<DiseaseDetect />} />
                    <Route path="/npk" element={<NPKQuestionnaire />} />
                    <Route path="/admin" element={<AdminPanel />} />
                    <Route path="/weather" element={<WeatherForecast />} />
                    <Route path="/market" element={<MarketPrice />} />
                    <Route path="/shop" element={<ShopAdvanced />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/checkout" element={<CheckoutForm />} />
                    <Route path="/my-orders" element={<MyOrders />} />
                    <Route path="*" element={<Navigate to="/" />} />
                  </Routes>
                </Container>
              </div>

              <Footer />
            </div>
          )}
        </Box>
      </ThemeProvider>
    </GoogleOAuthProvider>
  );
}

export default App;