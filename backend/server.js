const express = require("express");
const cors = require("cors");
require("./models/db");

const authRoutes = require("./routes/auth.routes");
const productsRoutes = require("./routes/products.routes");
const ordersRoutes = require("./routes/orders.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/images", express.static("public/images"));

app.use("/api/auth", authRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/orders", ordersRoutes);

app.get("/", (req, res) => res.json({ ok: true, message: "API is running" }));

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

const PORT = 3000;

// IMPORTANT: this keeps the server alive
app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
