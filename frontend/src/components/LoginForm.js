import React, { useState } from "react";
import { Button, TextField, Box, Typography, Paper, Divider, CircularProgress, Alert } from "@mui/material";
import GoogleLoginButton from "./GoogleLoginButton";
import FacebookLoginButton from "./FacebookLoginButton";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:5000";

export default function LoginForm({ onLogin, onSwitch }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("error"); // "error" or "success"
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setMsg("");
    setLoading(true);

    if (!username || !password) {
      setMsg("Please enter username and password");
      setMsgType("error");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (data.access_token) {
        // ✅ Store token AND user info for checkout
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("access_token", data.access_token);
        localStorage.setItem("username", username);
        localStorage.setItem("email", username + "@agriassistant.com"); // or get from backend if available

        setMsg("✅ Login successful!");
        setMsgType("success");

        // Call onLogin callback
        if (onLogin) onLogin();

        // Redirect after 1 second
        setTimeout(() => {
          navigate("/");
        }, 1000);
      } else {
        setMsg(data.msg || "Login failed");
        setMsgType("error");
      }
    } catch (error) {
      console.error("Login error:", error);
      setMsg("Network error. Please try again.");
      setMsgType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "70vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "transparent",
      }}
    >
      <Paper
        elevation={6}
        sx={{
          p: 4,
          maxWidth: 400,
          width: "100%",
          borderRadius: 3,
          boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.25)",
          background: "rgba(255,255,255,0.95)",
        }}
      >
        <Typography
          variant="h4"
          align="center"
          gutterBottom
          sx={{ fontWeight: 700, color: "#388e3c", mb: 1 }}
        >
          🌱 Welcome Back
        </Typography>
        <Typography variant="subtitle1" align="center" sx={{ mb: 3, color: "#666" }}>
          Login to your AI Agri Assistant account
        </Typography>

        {msg && (
          <Alert severity={msgType} sx={{ mb: 2 }}>
            {msg}
          </Alert>
        )}

        <Box component="form" onSubmit={handleLogin}>
          <TextField
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            fullWidth
            required
            disabled={loading}
            placeholder="Enter your username"
            sx={{ mb: 2 }}
            variant="outlined"
          />

          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            required
            disabled={loading}
            placeholder="Enter your password"
            sx={{ mb: 3 }}
            variant="outlined"
          />

          <Button
            type="submit"
            variant="contained"
            color="success"
            fullWidth
            disabled={loading}
            sx={{ py: 1.2, fontWeight: 600, fontSize: 16 }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Login"}
          </Button>

          <Button
            onClick={onSwitch}
            sx={{ mt: 2, fontWeight: 500 }}
            fullWidth
          >
            New user? Create account
          </Button>
        </Box>

        <Divider sx={{ my: 3 }}>Or continue with</Divider>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <GoogleLoginButton />
          <FacebookLoginButton />
        </Box>

        <Typography variant="caption" align="center" sx={{ display: "block", mt: 3, color: "#999" }}>
          By logging in, you agree to our Terms & Conditions
        </Typography>
      </Paper>
    </Box>
  );
}