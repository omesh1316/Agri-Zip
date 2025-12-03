import React, { useState } from "react";
import { Box, Paper, Typography, TextField, MenuItem, Button, Card, CardContent, Grid, LinearProgress } from "@mui/material";

const crops = ["rice", "maize", "chickpea", "kidneybeans", "pigeonpeas", "mothbeans", "mungbean", "blackgram", "lentil", "pomegranate", "banana", "mango", "grapes", "watermelon", "muskmelon", "apple", "orange", "papaya", "coconut", "cotton", "jute", "coffee"];

// NPK values for each crop (kg/ha recommended)
const npkDatabase = {
  rice: { N: 120, P: 60, K: 60 },
  maize: { N: 150, P: 75, K: 75 },
  chickpea: { N: 30, P: 70, K: 40 },
  kidneybeans: { N: 20, P: 60, K: 40 },
  pigeonpeas: { N: 20, P: 50, K: 20 },
  mothbeans: { N: 15, P: 40, K: 20 },
  mungbean: { N: 20, P: 50, K: 20 },
  blackgram: { N: 20, P: 50, K: 20 },
  lentil: { N: 25, P: 60, K: 40 },
  pomegranate: { N: 60, P: 30, K: 40 },
  banana: { N: 150, P: 60, K: 200 },
  mango: { N: 100, P: 40, K: 80 },
  grapes: { N: 80, P: 50, K: 120 },
  watermelon: { N: 100, P: 50, K: 100 },
  muskmelon: { N: 100, P: 50, K: 100 },
  apple: { N: 100, P: 50, K: 100 },
  orange: { N: 120, P: 60, K: 100 },
  papaya: { N: 200, P: 60, K: 200 },
  coconut: { N: 140, P: 70, K: 140 },
  cotton: { N: 120, P: 60, K: 60 },
  jute: { N: 100, P: 50, K: 40 },
  coffee: { N: 100, P: 40, K: 150 },
};

const prevCrops = ["None", "rice", "maize", "wheat", "legumes", "fallow","vegetables","fruits","cotton","oilseeds","pulses","other"];
const leafColors = ["Dark Green", "Light Green", "Yellowish", "Purple", "Brown"];
const growthPatterns = ["Healthy", "Stunted", "Tall & Thin", "Short & Bushy"];
const soilTypes = ["Sandy", "Clay", "Loam"];
const irrigationFreq = ["Daily", "2-3 times/week", "Weekly", "Rarely"];

// Reusable TextField styling
const textFieldStyle = {
  "& .MuiOutlinedInput-root": {
    "& fieldset": { borderColor: "#81c784" },
    "&:hover fieldset": { borderColor: "#66bb6a" },
    height: "56px",
  },
  "& .MuiInputBase-input": { fontSize: "0.95rem" },
  "& .MuiInputLabel-root": { 
    fontSize: "1.1rem",
    fontWeight: 700,
    color: "#2e7d32",
  },
  "& .MuiInputLabel-shrink": {
    transform: "translate(14px, -9px) scale(0.85)",
    fontSize: "1.1rem",
    fontWeight: 700,
    color: "#2e7d32",
  },
};

// Helper text styling
const helperTextStyle = {
  fontSize: "0.75rem",
  color: "#1565c0",
  fontWeight: 600,
  mt: 0.5,
  display: "block"
};

export default function NPKQuestionnaire() {
  const [answers, setAnswers] = useState({
    crop: "",
    prevCrop: "",
    leafColor: "",
    growth: "",
    soil: "",
    irrigation: "",
  });
  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    setAnswers({ ...answers, [e.target.name]: e.target.value });
    setResult(null);
  };

  const estimateNPK = () => {
    if (!answers.crop) {
      alert("Please select a crop");
      return;
    }

    const baseNPK = npkDatabase[answers.crop] || { N: 100, P: 50, K: 50 };
    let adjustedNPK = { ...baseNPK };

    // Apply deficiency adjustments based on answers
    let deficiencies = [];

    if (answers.leafColor === "Yellowish") {
      adjustedNPK.N = Math.max(adjustedNPK.N * 0.7, 20);
      deficiencies.push("Nitrogen");
    }
    if (answers.leafColor === "Purple") {
      adjustedNPK.P = Math.max(adjustedNPK.P * 0.7, 15);
      deficiencies.push("Phosphorus");
    }
    if (answers.growth === "Stunted") {
      adjustedNPK.P = Math.max(adjustedNPK.P * 0.8, 15);
      deficiencies.push("Phosphorus");
    }
    if (answers.soil === "Sandy") {
      adjustedNPK.K = Math.max(adjustedNPK.K * 0.6, 20);
      deficiencies.push("Potassium");
    }
    if (answers.irrigation === "Rarely") {
      adjustedNPK.K = Math.max(adjustedNPK.K * 0.7, 20);
      adjustedNPK.N = Math.max(adjustedNPK.N * 0.8, 20);
      deficiencies.push("Nitrogen & Potassium");
    }

    setResult({
      crop: answers.crop,
      baseNPK,
      adjustedNPK: {
        N: Math.round(adjustedNPK.N),
        P: Math.round(adjustedNPK.P),
        K: Math.round(adjustedNPK.K),
      },
      deficiencies: deficiencies.length > 0 ? deficiencies : ["None - Nutrients are sufficient"],
      recommendation: generateRecommendation(answers, deficiencies),
    });
  };

  const generateRecommendation = (answers, deficiencies) => {
    let rec = "Apply ";
    if (deficiencies.includes("Nitrogen")) rec += "Urea or Ammonium Nitrate. ";
    if (deficiencies.includes("Phosphorus")) rec += "Superphosphate or DAP. ";
    if (deficiencies.includes("Potassium")) rec += "Potassium Chloride or Potassium Sulphate. ";
    if (deficiencies.length === 0) rec = "No additional fertilizer needed. Maintain current NPK levels.";
    return rec;
  };

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", mt: 4, mb: 4 }}>
      <Paper sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3, background: "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(200,230,201,0.1) 100%)", border: "2px solid #81c784" }}>
        <Typography variant="h5" gutterBottom sx={{ color: "#2e7d32", fontWeight: 700, textAlign: "center", mb: 3 }}>
          🌾 NPK Deficiency & Recommendation System
        </Typography>

        <Typography variant="body2" sx={{ color: "text.secondary", mb: 3, textAlign: "center" }}>
          Answer the questions below to get NPK recommendations for your crop
        </Typography>

        <Grid container spacing={2.5}>
          {/* Crop Selection */}
          <Grid item xs={12} sm={6}>
            <Box>
              <Typography variant="caption" sx={{ display: "block", mb: 1, fontWeight: 700, color: "#2e7d32" }}>
                What crop are you growing?
              </Typography>
              <TextField
                select
                label="🌾 Type of Crop"
                name="crop"
                value={answers.crop}
                onChange={handleChange}
                fullWidth
                required
                variant="outlined"
                sx={textFieldStyle}
              >
                <MenuItem value="">Select a crop</MenuItem>
                {crops.map((c) => (
                  <MenuItem key={c} value={c}>
                    {c.charAt(0).toUpperCase() + c.slice(1)}
                  </MenuItem>
                ))}
              </TextField>
              <Typography sx={helperTextStyle}>
                💡 Choose your main crop from the list
              </Typography>
            </Box>
          </Grid>

          {/* Previous Crop */}
          <Grid item xs={12} sm={6}>
            <Box>
              <Typography variant="caption" sx={{ display: "block", mb: 1, fontWeight: 700, color: "#2e7d32" }}>
                What was grown last season?
              </Typography>
              <TextField
                select
                label="📋 Previous Crop"
                name="prevCrop"
                value={answers.prevCrop}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                sx={textFieldStyle}
              >
                <MenuItem value="">Select crop</MenuItem>
                {prevCrops.map((c) => (
                  <MenuItem key={c} value={c}>
                    {c}
                  </MenuItem>
                ))}
              </TextField>
              <Typography sx={helperTextStyle}>
                💡 Helps determine nutrient depletion
              </Typography>
            </Box>
          </Grid>

          {/* Leaf Color */}
          <Grid item xs={12} sm={6}>
            <Box>
              <Typography variant="caption" sx={{ display: "block", mb: 1, fontWeight: 700, color: "#2e7d32" }}>
                What is the leaf color of your plants?
              </Typography>
              <TextField
                select
                label="🍃 Leaf Color"
                name="leafColor"
                value={answers.leafColor}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                sx={textFieldStyle}
              >
                <MenuItem value="">Select color</MenuItem>
                {leafColors.map((c) => (
                  <MenuItem key={c} value={c}>
                    {c}
                  </MenuItem>
                ))}
              </TextField>
              <Typography sx={helperTextStyle}>
                💡 Yellow = N deficiency, Purple = P deficiency
              </Typography>
            </Box>
          </Grid>

          {/* Growth Pattern */}
          <Grid item xs={12} sm={6}>
            <Box>
              <Typography variant="caption" sx={{ display: "block", mb: 1, fontWeight: 700, color: "#2e7d32" }}>
                How is your plant growing?
              </Typography>
              <TextField
                select
                label="📈 Growth Pattern"
                name="growth"
                value={answers.growth}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                sx={textFieldStyle}
              >
                <MenuItem value="">Select pattern</MenuItem>
                {growthPatterns.map((c) => (
                  <MenuItem key={c} value={c}>
                    {c}
                  </MenuItem>
                ))}
              </TextField>
              <Typography sx={helperTextStyle}>
                💡 Stunted growth = nutrient deficiency
              </Typography>
            </Box>
          </Grid>

          {/* Soil Type */}
          <Grid item xs={12} sm={6}>
            <Box>
              <Typography variant="caption" sx={{ display: "block", mb: 1, fontWeight: 700, color: "#2e7d32" }}>
                What type of soil do you have?
              </Typography>
              <TextField
                select
                label="🪨 Soil Type"
                name="soil"
                value={answers.soil}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                sx={textFieldStyle}
              >
                <MenuItem value="">Select type</MenuItem>
                {soilTypes.map((c) => (
                  <MenuItem key={c} value={c}>
                    {c}
                  </MenuItem>
                ))}
              </TextField>
              <Typography sx={helperTextStyle}>
                💡 Sandy soil loses K faster than clay
              </Typography>
            </Box>
          </Grid>

          {/* Irrigation Frequency */}
          <Grid item xs={12} sm={6}>
            <Box>
              <Typography variant="caption" sx={{ display: "block", mb: 1, fontWeight: 700, color: "#2e7d32" }}>
                How often do you irrigate?
              </Typography>
              <TextField
                select
                label="💧 Irrigation Frequency"
                name="irrigation"
                value={answers.irrigation}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                sx={textFieldStyle}
              >
                <MenuItem value="">Select frequency</MenuItem>
                {irrigationFreq.map((c) => (
                  <MenuItem key={c} value={c}>
                    {c}
                  </MenuItem>
                ))}
              </TextField>
              <Typography sx={helperTextStyle}>
                💡 Low irrigation = higher K deficiency risk
              </Typography>
            </Box>
          </Grid>

          {/* Submit Button */}
          <Grid item xs={12}>
            <Button
              variant="contained"
              color="success"
              fullWidth
              onClick={estimateNPK}
              sx={{ py: 1.5, fontSize: "1rem", fontWeight: 600, mt: 2 }}
            >
              🎯 Estimate NPK Recommendation
            </Button>
          </Grid>
        </Grid>
        
        {/* Results */}
        {result && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" sx={{ color: "#2e7d32", fontWeight: 700, mb: 2 }}>
              📊 NPK Analysis for {result.crop.toUpperCase()}
            </Typography>

            <Grid container spacing={2} sx={{ mb: 3 }}>
              {/* Base NPK Card */}
              <Grid item xs={12}>
                <Card sx={{ background: "#e8f5e9", border: "1px solid #81c784" }}>
                  <CardContent>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#2e7d32", mb: 2 }}>
                      📋 Standard NPK Values (kg/ha)
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={4}>
                        <Box sx={{ p: 1.5, bgcolor: "white", borderRadius: 1, border: "1px solid #81c784" }}>
                          <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
                            Nitrogen (N)
                          </Typography>
                          <Typography variant="h6" sx={{ color: "#2e7d32", fontWeight: 700 }}>
                            {result.baseNPK.N} kg/ha
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Box sx={{ p: 1.5, bgcolor: "white", borderRadius: 1, border: "1px solid #81c784" }}>
                          <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
                            Phosphorus (P)
                          </Typography>
                          <Typography variant="h6" sx={{ color: "#2e7d32", fontWeight: 700 }}>
                            {result.baseNPK.P} kg/ha
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Box sx={{ p: 1.5, bgcolor: "white", borderRadius: 1, border: "1px solid #81c784" }}>
                          <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
                            Potassium (K)
                          </Typography>
                          <Typography variant="h6" sx={{ color: "#2e7d32", fontWeight: 700 }}>
                            {result.baseNPK.K} kg/ha
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Adjusted NPK Card */}
              <Grid item xs={12}>
                <Card sx={{ background: "#fff3e0", border: "1px solid #ffb74d" }}>
                  <CardContent>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#e65100", mb: 2 }}>
                      ⚠️ Adjusted NPK Based on Conditions
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={4}>
                        <Box sx={{ p: 1.5, bgcolor: "white", borderRadius: 1, border: "1px solid #ffb74d" }}>
                          <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
                            Nitrogen (N)
                          </Typography>
                          <Typography variant="h6" sx={{ color: "#e65100", fontWeight: 700 }}>
                            {result.adjustedNPK.N} kg/ha
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={(result.adjustedNPK.N / result.baseNPK.N) * 100}
                            sx={{ mt: 0.5, background: "#ffe0b2" }}
                          />
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Box sx={{ p: 1.5, bgcolor: "white", borderRadius: 1, border: "1px solid #ffb74d" }}>
                          <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
                            Phosphorus (P)
                          </Typography>
                          <Typography variant="h6" sx={{ color: "#e65100", fontWeight: 700 }}>
                            {result.adjustedNPK.P} kg/ha
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={(result.adjustedNPK.P / result.baseNPK.P) * 100}
                            sx={{ mt: 0.5, background: "#ffe0b2" }}
                          />
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Box sx={{ p: 1.5, bgcolor: "white", borderRadius: 1, border: "1px solid #ffb74d" }}>
                          <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
                            Potassium (K)
                          </Typography>
                          <Typography variant="h6" sx={{ color: "#e65100", fontWeight: 700 }}>
                            {result.adjustedNPK.K} kg/ha
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={(result.adjustedNPK.K / result.baseNPK.K) * 100}
                            sx={{ mt: 0.5, background: "#ffe0b2" }}
                          />
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Deficiencies */}
              <Grid item xs={12}>
                <Card sx={{ background: result.deficiencies[0] === "None - Nutrients are sufficient" ? "#e8f5e9" : "#ffebee", border: `1px solid ${result.deficiencies[0] === "None - Nutrients are sufficient" ? "#81c784" : "#ef5350"}` }}>
                  <CardContent>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: result.deficiencies[0] === "None - Nutrients are sufficient" ? "#2e7d32" : "#c62828" }}>
                      {result.deficiencies[0] === "None - Nutrients are sufficient" ? "✅ Nutrient Status" : "⚠️ Detected Deficiencies"}
                    </Typography>
                    {result.deficiencies.map((def, idx) => (
                      <Typography key={idx} variant="body2" sx={{ mb: 0.5 }}>
                        • {def}
                      </Typography>
                    ))}
                  </CardContent>
                </Card>
              </Grid>

              {/* Recommendation */}
              <Grid item xs={12}>
                <Card sx={{ background: "#f3e5f5", border: "1px solid #ce93d8" }}>
                  <CardContent>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#6a1b9a", mb: 1 }}>
                      💡 Fertilizer Recommendation
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#6a1b9a" }}>
                      {result.recommendation}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>
    </Box>
  );
}