import React, { useState, useRef } from "react";
import axios from "axios";
import {
  Box,
  Button,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Avatar,
} from "@mui/material";

function DiseaseDetect() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    if (file) setPreview(URL.createObjectURL(file));
    else setPreview(null);
    setResult(null);
  };

  const handleChooseFile = () => {
    fileInputRef.current.click();
  };

  const formatConfidence = (val) => {
    if (val == null) return "N/A";
    const num = Number(val);
    if (isNaN(num)) return val;
    const pct = num <= 1 ? num * 100 : num;
    return `${pct.toFixed(2)}%`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) return;

    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append("image", image);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setResult({
          disease: "Error",
          suggestion: "No authentication token found. Please login first.",
          confidence: null,
        });
        setLoading(false);
        return;
      }

      const res = await axios.post("http://127.0.0.1:5000/detect-disease", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      setResult(res.data);
    } catch (err) {
      console.error("Error details:", err.response || err);
      setResult({
        disease: "Error",
        suggestion: err.response?.data?.error || err.message || "Request failed",
        confidence: null,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: { xs: 2, sm: 4 }, mt: 2, maxWidth: 900, mx: "auto" }}>
      <Typography variant="h5" gutterBottom sx={{ textAlign: "center", mb: 2 }}>
        Crop Disease Detection
      </Typography>

      <Box component="form" onSubmit={handleSubmit}>
        <input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleImageChange}
          ref={fileInputRef}
          style={{ display: "none" }}
        />

        <Grid container spacing={2} alignItems="center" justifyContent="center">
          <Grid item>
            <Button variant="outlined" onClick={handleChooseFile}>
              {image ? "Change Image" : "Choose Image"}
            </Button>
          </Grid>

          <Grid item>
            <Button
              type="submit"
              variant="contained"
              color="success"
              disabled={loading || !image}
            >
              {loading ? <CircularProgress size={20} color="inherit" /> : "Detect Disease"}
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Preview + Result area */}
      <Grid container spacing={3} sx={{ mt: 3 }} justifyContent="center" alignItems="flex-start">
        <Grid item xs={12} sm={5} md={4} sx={{ textAlign: "center" }}>
          {preview ? (
            <Box
              sx={{
                mx: "auto",
                width: { xs: 220, sm: 280 },
                height: { xs: 220, sm: 280 },
                borderRadius: 2,
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "6px solid rgba(0,150,136,0.08)",
                position: "relative",
                // subtle pulse animation
                "@keyframes pulse": {
                  "0%": { boxShadow: "0 0 0 0 rgba(56,142,60,0.12)" },
                  "70%": { boxShadow: "0 0 0 14px rgba(56,142,60,0)" },
                  "100%": { boxShadow: "0 0 0 0 rgba(56,142,60,0)" },
                },
                animation: loading ? "pulse 1.8s infinite" : "none",
              }}
            >
              <img
                src={preview}
                alt="Preview"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              {loading && (
                <CircularProgress
                  size={48}
                  sx={{
                    position: "absolute",
                    color: "rgba(255,255,255,0.9)",
                    bgcolor: "rgba(0,0,0,0.25)",
                    borderRadius: "50%",
                    p: 0.5,
                  }}
                />
              )}
            </Box>
          ) : (
            <Avatar
              variant="rounded"
              sx={{
                width: { xs: 220, sm: 280 },
                height: { xs: 220, sm: 280 },
                bgcolor: "grey.100",
                color: "grey.500",
                mx: "auto",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 24,
                border: "1px dashed rgba(0,0,0,0.06)",
              }}
            >
              No Image Selected
            </Avatar>
          )}
        </Grid>

        <Grid item xs={12} sm={7} md={6}>
          <Box sx={{ minHeight: 160, p: 2, borderRadius: 2, border: "1px solid #e0e0e0", bgcolor: "background.paper" }}>
            {loading ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <CircularProgress />
                <Typography>Detecting disease — please wait...</Typography>
              </Box>
            ) : result ? (
              <>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                  Result
                </Typography>

                <Typography sx={{ mb: 1 }}>
                  <strong>Disease:</strong> {result.disease}
                </Typography>

                <Typography sx={{ mb: 1 }}>
                  <strong>Confidence:</strong> {formatConfidence(result.confidence)}
                </Typography>

                <Typography sx={{ mt: 1 }}>
                  <strong>Suggestion:</strong> {result.suggestion}
                </Typography>
              </>
            ) : (
              <Typography color="text.secondary">
                Upload a leaf image and click "Detect Disease" to get results. Make sure you are logged in.
              </Typography>
            )}
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
}

export default DiseaseDetect;