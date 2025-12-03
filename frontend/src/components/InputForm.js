import React, { useState, useEffect } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import { 
  Box, 
  TextField, 
  Button, 
  Alert, 
  Card, 
  CardContent, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableRow, 
  Paper, 
  Grid,
  CircularProgress 
} from "@mui/material";

// --- API Service Stubs ---
// NOTE: You need to implement the actual 'getWeather' and 'getPrediction' 
// functions in your '../services/api' file. 
// For this code to work, they should look something like:
/*
  export const getPrediction = async (data) => {
    const token = localStorage.getItem("token");
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const res = await axios.post("http://127.0.0.1:5000/api/predict-crop", data, { headers });
    return res.data;
  };
  
  export const getWeather = async (city) => {
    const res = await axios.get(`http://127.0.0.1:5000/weather?city=${city}`);
    // Assuming the Flask endpoint returns { temp: X, humidity: Y, ... }
    return res.data; 
  };
*/
// --- END API Service Stubs ---


// Placeholder for API functions (replace with actual imports if needed)
const getPrediction = async (data) => {
    const token = localStorage.getItem("token");
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await axios.post("http://127.0.0.1:5000/api/predict-crop", data, { headers });
    const result = res.data || {};
    if (result.error) {
        throw new Error(result.error);
    }
    return result;
};

const getWeather = async (city) => {
    const res = await axios.get(`http://127.00.0.1:5000/weather?city=${city}`);
    // Assuming the Flask endpoint returns an object like { temp: 25.5, humidity: 75.2, ... }
    if (res.data.error) {
        throw new Error(res.data.error);
    }
    return res.data;
};


export default function InputForm({ onResult }) {
    // Input states
    const [N, setN] = useState("");
    const [P, setP] = useState("");
    const [K, setK] = useState("");
    const [temperature, setTemperature] = useState("");
    const [humidity, setHumidity] = useState("");
    const [ph, setPh] = useState("");
    const [rainfall, setRainfall] = useState("");
    const [city, setCity] = useState("");

    // UI states
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [result, setResult] = useState(null); // Local result state for display/download

    // Example values for testing
    const exampleValues = {
        rice: { N: 90, P: 42, K: 43, temperature: 20.88, humidity: 82, ph: 6.5, rainfall: 202.94 },
        maize: { N: 60, P: 55, K: 44, temperature: 23, humidity: 82.32, ph: 7.84, rainfall: 263.64 },
        wheat: { N: 85, P: 58, K: 41, temperature: 21.77, humidity: 80.32, ph: 7.04, rainfall: 226.56 }
    };

    // --- Utility Functions ---

    const validate = () => {
        if ([N, P, K, temperature, humidity, ph, rainfall].some(v => v === "")) {
            setError("Please fill all fields");
            return false;
        }
        return true;
    };

    const handleReset = () => {
        setN(""); setP(""); setK(""); setTemperature(""); setHumidity(""); setPh(""); setRainfall(""); setCity("");
        setError(null); setSuccess(false); setResult(null);
        // Optionally, reset parent result via onResult(null)
        onResult(null); 
    };

    const handleFillExample = (cropType) => {
        const values = exampleValues[cropType];
        setN(values.N.toString());
        setP(values.P.toString());
        setK(values.K.toString());
        setTemperature(values.temperature.toString());
        setHumidity(values.humidity.toString());
        setPh(values.ph.toString());
        setRainfall(values.rainfall.toString());
        setError(null);
    };

    const downloadPDF = () => {
        if (!result) return;
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text("Crop Prediction Report", 14, 20);
        doc.setFontSize(12);
        doc.text(`Recommended Crop: ${result.suggested_crop}`, 14, 35);
        doc.text(`Confidence: ${result.confidence}%`, 14, 45);
        doc.text("Top 5 Recommendations:", 14, 60);
        let yPos = 70;
        (result.recommendations || []).forEach((rec, idx) => {
            doc.text(`${idx + 1}. ${rec.crop} - ${rec.confidence}%`, 20, yPos);
            yPos += 8;
        });
        doc.text(`Input Parameters:`, 14, yPos + 10);
        doc.text(`N: ${N}, P: ${P}, K: ${K}`, 20, yPos + 18);
        doc.text(`Temperature: ${temperature}°C, Humidity: ${humidity}%`, 20, yPos + 26);
        doc.text(`pH: ${ph}, Rainfall: ${rainfall}mm`, 20, yPos + 34);
        doc.save("crop_prediction_report.pdf");
    };

    const downloadCSV = () => {
        if (!result) return;
        let csvContent = "Crop Prediction Report\n\n";
        csvContent += `Recommended Crop,${result.suggested_crop}\n`;
        csvContent += `Confidence,${result.confidence}%\n\n`;
        csvContent += "Top Recommendations\n";
        csvContent += "Rank,Crop,Confidence\n";
        (result.recommendations || []).forEach((rec, idx) => {
            csvContent += `${idx + 1},${rec.crop},${rec.confidence}%\n`;
        });
        csvContent += "\nInput Parameters\n";
        csvContent += `N,${N}\nP,${P}\nK,${K}\n`;
        csvContent += `Temperature,${temperature}\nHumidity,${humidity}\n`;
        csvContent += `pH,${ph}\nRainfall,${rainfall}\n`;

        const encodedUri = encodeURI("data:text/csv;charset=utf-8," + csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "crop_prediction_report.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // --- Core Handlers ---

    const handleSubmit = async (e) => {
        e && e.preventDefault();
        setError(null);
        setSuccess(false);
        setResult(null); 
        if (!validate()) return;

        const payload = {
            N: Number(N),
            P: Number(P),
            K: Number(K),
            temperature: Number(temperature),
            humidity: Number(humidity),
            ph: Number(ph),
            rainfall: Number(rainfall),
            city: city || ""
        };

        setLoading(true);
        try {
            const data = await getPrediction(payload);

            setResult(data);
            onResult(data);
            setSuccess(true);
            
            // Clear form after success
            setTimeout(() => {
                setN(""); setP(""); setK(""); setTemperature(""); setHumidity(""); setPh(""); setRainfall(""); setCity("");
                setSuccess(false);
            }, 2000);

        } catch (err) {
            setError(err.message || "Request failed");
        } finally {
            setLoading(false);
        }
    };

    const handleAutoFill = async () => {
        if (!city) {
            setError("Please enter a city name first");
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const weather = await getWeather(city);
            setTemperature(weather.temp.toString());
            setHumidity(weather.humidity.toString());
            setError(null);
            alert(`Weather fetched for ${city}! Temp: ${weather.temp}°C, Humidity: ${weather.humidity}%`);
        } catch (err) {
            setError(`Failed to fetch weather data for ${city}. Please enter manually.`);
            console.error("Weather error:", err);
        } finally {
            setLoading(false);
        }
    };
    
    // --- Render Component ---

    return (
        <Paper 
            elevation={3} 
            className="fade-in"
            sx={{ 
                p: 3, 
                mb: 4,
                maxWidth: 1000,
                mx: "auto",
                background: "rgba(255,255,255,0.75)",
                backdropFilter: "blur(6px)",
                boxShadow: "0 4px 24px 0 rgba(0,150,136,0.05)",
                border: "1.5px solid #b2dfdb",
                borderRadius: 2,
                "&:hover": {
                    boxShadow: "0 8px 32px 0 rgba(0,150,136,0.1)",
                },
            }}
        >
            <Typography sx={{ color: "primary.main", fontWeight: 700, mb: 3, fontSize: "1.5rem" }}>
                🌾 Crop Prediction Form
            </Typography>

            {/* Example Values Section */}
            <Box sx={{ mb: 3, p: 2, bgcolor: "background.default", borderRadius: 1, border: "1px dashed #cfd8dc" }}>
                <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
                    Quick Fill Examples:
                </Typography>
                <Grid container spacing={1}>
                    {Object.keys(exampleValues).map((crop) => (
                        <Grid item xs={12} sm={4} key={crop}>
                            <Button
                                variant="outlined"
                                size="small"
                                onClick={() => handleFillExample(crop)}
                                fullWidth
                                sx={{ textTransform: "capitalize", fontSize: "0.75rem" }}
                            >
                                {crop} Example
                            </Button>
                        </Grid>
                    ))}
                </Grid>
            </Box>

            {/* Main Form */}
            <Box component="form" onSubmit={handleSubmit} noValidate>
                <Grid container spacing={2}>
                {/* Soil Nutrients Section */}
                    <Grid item xs={12}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "primary.main", mb: 2 }}>
                            🌱 Soil Nutrients (kg/ha)
                        </Typography>

                        {/* ensure these three are in one row */}
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={4}>
                                <TextField
                                    label="Nitrogen (N)"
                                    type="number"
                                    value={N}
                                    onChange={(e) => setN(e.target.value)}
                                    fullWidth
                                    required
                                    inputProps={{ step: "0.1", min: "0" }}
                                    helperText="0-150"
                                />
                            </Grid>

                            <Grid item xs={12} sm={4}>
                                <TextField
                                    label="Phosphorus (P)"
                                    type="number"
                                    value={P}
                                    onChange={(e) => setP(e.target.value)}
                                    fullWidth
                                    required
                                    inputProps={{ step: "0.1", min: "0" }}
                                    helperText="0-100"
                                />
                            </Grid>

                            <Grid item xs={12} sm={4}>
                                <TextField
                                    label="Potassium (K)"
                                    type="number"
                                    value={K}
                                    onChange={(e) => setK(e.target.value)}
                                    fullWidth
                                    required
                                    inputProps={{ step: "0.1", min: "0" }}
                                    helperText="0-200"
                                />
                            </Grid>
                        </Grid>
                    </Grid>
                                 {/* Weather Section */}
                    <Grid item xs={12}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "primary.main", mb: 2 }}>
                            🌤️ Weather Conditions
                        </Typography>

                        {/* put weather fields side-by-side */}
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Temperature (°C)"
                                    type="number"
                                    value={temperature}
                                    onChange={(e) => setTemperature(e.target.value)}
                                    fullWidth
                                    required
                                    inputProps={{ step: "0.1", min: "0", max: "50" }}
                                    helperText="5-40°C"
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Humidity (%)"
                                    type="number"
                                    value={humidity}
                                    onChange={(e) => setHumidity(e.target.value)}
                                    fullWidth
                                    required
                                    inputProps={{ step: "0.1", min: "0", max: "100" }}
                                    helperText="0-100%"
                                />
                            </Grid>
                        </Grid>
                    </Grid>

                    {/* Soil Properties Section */}
                    <Grid item xs={12}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "primary.main", mb: 2 }}>
                            🪨 Soil Properties
                        </Typography>

                        {/* side-by-side pH and Rainfall */}
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Soil pH"
                                    type="number"
                                    value={ph}
                                    onChange={(e) => setPh(e.target.value)}
                                    fullWidth
                                    required
                                    inputProps={{ step: "0.1", min: "3", max: "9" }}
                                    helperText="3-9"
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Rainfall (mm)"
                                    type="number"
                                    value={rainfall}
                                    onChange={(e) => setRainfall(e.target.value)}
                                    fullWidth
                                    required
                                    inputProps={{ step: "0.1", min: "0" }}
                                    helperText="0-1000mm"
                                />
                            </Grid>
                        </Grid>
                    </Grid>

                    {/* city input + fetch button aligned in one row */}
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} sm={8}>
                                <TextField
                                    label="City Name"
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    fullWidth
                                    placeholder="e.g., Delhi, Mumbai, Bangalore"
                                    helperText="Enter city to auto-fill temperature and humidity"
                                />
                            </Grid>

                            <Grid item xs={12} sm={4}>
                                <Button 
                                    onClick={handleAutoFill} 
                                    variant="contained"
                                    fullWidth
                                    disabled={loading || !city}
                                    sx={{ py: 1.5, background: "#81c784", "&:hover": { background: "#66bb6a" } }}
                                >
                                    {loading ? <CircularProgress size={20} color="inherit" /> : "Fetch Weather"}
                                </Button>
                            </Grid>
                        </Grid>

                    {/* Submit Button */}
                    <Grid item xs={12}>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            fullWidth
                            disabled={loading}
                            sx={{ mt: 2, py: 1.5, fontSize: "1rem", fontWeight: 600 }}
                        >
                            {loading ? (
                                <>
                                    <CircularProgress size={20} sx={{ mr: 1 }} />
                                    Processing...
                                </>
                            ) : (
                                "🎯 Get Crop Recommendation"
                            )}
                        </Button>
                    </Grid>

                    {/* Reset Button */}
                    <Grid item xs={12}>
                         <Button variant="outlined" color="secondary" onClick={handleReset} fullWidth disabled={loading}>
                            Reset Form
                        </Button>
                    </Grid>


                    {/* Status Messages */}
                    {error && (
                        <Grid item xs={12}>
                            <Card sx={{ bgcolor: "#ffebee", border: "1px solid #ef5350" }}>
                                <CardContent sx={{ py: 1, "&:last-child": { pb: 1 } }}>
                                    <Typography color="error" sx={{ fontWeight: 500, display: "flex", alignItems: "center" }}>
                                        ❌ {error}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    )}

                    {success && (
                        <Grid item xs={12}>
                            <Card sx={{ bgcolor: "#e8f5e9", border: "1px solid #66bb6a" }}>
                                <CardContent sx={{ py: 1, "&:last-child": { pb: 1 } }}>
                                    <Typography sx={{ color: "#2e7d32", fontWeight: 500, display: "flex", alignItems: "center" }}>
                                        ✅ Prediction successful! Showing results...
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    )}
                </Grid>
            </Box>

            {/* Helper Text */}
            <Typography variant="caption" sx={{ display: "block", mt: 3, color: "text.secondary" }}>
                💡 Tip: Fill in all fields with realistic values for accurate crop recommendations. 
                Use the "Fetch Weather" button to auto-fill temperature and humidity from your city's current weather.
            </Typography>
            
            {/* Prediction Result Section (AS IS) */}
            {result && (
                <Card sx={{ mt: 3, background: "#f0f7f0" }}>
                    <CardContent>
                        <Typography variant="h6" sx={{ fontWeight: "bold", color: "#2e7d32", mb: 2 }}>
                            🌾 Prediction Result
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 1 }}>
                            <strong>Best Recommendation:</strong> {result.suggested_crop}
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 2, color: "#1565c0", fontWeight: "bold" }}>
                            Confidence: {result.confidence}%
                        </Typography>

                        <Typography variant="subtitle2" sx={{ fontWeight: "bold", color: "#2e7d32", mt: 2, mb: 1 }}>
                            Top 5 Crop Recommendations:
                        </Typography>
                        <Table size="small" sx={{ mb: 2 }}>
                            <TableHead>
                                <TableRow sx={{ background: "#c8e6c9" }}>
                                    <TableCell><strong>Rank</strong></TableCell>
                                    <TableCell><strong>Crop</strong></TableCell>
                                    <TableCell align="right"><strong>Confidence</strong></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {(result.recommendations || []).map((rec, idx) => (
                                    <TableRow key={idx}>
                                        <TableCell>{idx + 1}</TableCell>
                                        <TableCell>{rec.crop}</TableCell>
                                        <TableCell align="right">{rec.confidence}%</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>

                        <Box sx={{ display: "flex", gap: 1 }}>
                            <Button variant="contained" color="success" onClick={downloadPDF} size="small">
                                📄 Download PDF
                            </Button>
                            <Button variant="outlined" color="success" onClick={downloadCSV} size="small">
                                📊 Download CSV
                            </Button>
                        </Box>
                    </CardContent>
                </Card>
            )}
        </Paper>
    );
}