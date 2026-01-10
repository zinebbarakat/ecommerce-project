const express = require("express");
const cors = require("cors");
const path = require("path");

// Initialize database connection (creates/opens SQLite file)
require("./models/db");

// Route modules
const authRoutes = require("./routes/auth.routes");
const productsRoutes = require("./routes/products.routes");
const ordersRoutes = require("./routes/orders.routes");

const app = express();

// Allow frontend to call this API (CORS)
app.use(cors());

// Parse JSON bodies (so req.body works)
app.use(express.json());

// Disable caching to avoid stale responses during development
app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  next();
});

// Serve product images publicly: http://localhost:3000/images/...
app.use("/images", express.static(path.join(__dirname, "public/images")));

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/orders", ordersRoutes);

// Health check / quick test endpoint
app.get("/", (req, res) => {
  res.json({ ok: true, message: "API is running" });
});

// 404 handler (no route matched)
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Error handler (unexpected server errors)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
