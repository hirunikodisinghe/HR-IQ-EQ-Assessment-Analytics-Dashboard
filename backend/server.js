const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const reportRoutes = require("./routes/reportRoutes");

const app = express();

/* ==========================================
   MIDDLEWARE
========================================== */

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

/* ==========================================
   HEALTH CHECK
========================================== */

app.get("/", (req, res) => {
  res.send("HR IQ Dashboard API is running");
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Backend is running",
  });
});

/* ==========================================
   ROUTES
========================================== */

app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/reports", reportRoutes);

/* ==========================================
   START SERVER
========================================== */

const PORT = process.env.PORT || 5001;

app.listen(PORT, "0.0.0.0", () => {
  console.log("=================================");
  console.log(`Backend running on port ${PORT}`);
  console.log(`Health: http://localhost:${PORT}/api/health`);
  console.log("=================================");
});