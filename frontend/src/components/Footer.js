import React from "react";
import { Box, Typography, IconButton, Stack } from "@mui/material";
import FacebookIcon from "@mui/icons-material/Facebook";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import YouTubeIcon from "@mui/icons-material/YouTube";
import EmailIcon from "@mui/icons-material/Email";

export default function Footer() {
  return (
    <Box
      sx={{
        background: "linear-gradient(90deg,  #e0f7fa 0%, #f5f5f5 100%)",
        py: 2,
        mt: 4,
        borderTop: "1px solid #e0e0e0",
        textAlign: "center",
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        justifyContent="center"
        alignItems="center"
        sx={{ mb: 1 }}
      >
        <Typography variant="body2" sx={{ fontWeight: "bold", color: "#388e3c" }}>
          © 2025 AI Agri Assistant. All rights reserved.
        </Typography>
        <Typography variant="body2" sx={{ color: "#1976d2" }}>
          Contact: info@agri-assistant.com
        </Typography>
        <Stack direction="row" spacing={1}>
          <IconButton href="https://facebook.com" target="_blank" color="primary">
            <FacebookIcon />
          </IconButton>
          <IconButton href="https://wa.me/7559494178" target="+917559494178" sx={{ color: "#25D366" }}>
            <WhatsAppIcon />
          </IconButton>
          <IconButton href="https://youtube.com" target="_blank" sx={{ color: "#FF0000" }}>
            <YouTubeIcon />
          </IconButton>
          <IconButton href="mailto:info@agri-assistant.com" color="secondary">
            <EmailIcon />
          </IconButton>
        </Stack>
      </Stack>
    </Box>
  );
}