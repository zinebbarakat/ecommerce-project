const express = require("express");
const router = express.Router();

const productsController = require("../controllers/products.controller");
const { requireAuth, requireAdmin } = require("../middlewares/auth");

// Public routes (anyone can view products)

// Get all products (with optional filters)
router.get("/", productsController.getAll);

// Get a single product by ID
router.get("/:id", productsController.getById);

// Admin-only routes (product management)

// Create a new product
router.post("/", requireAuth, requireAdmin, productsController.create);

// Update an existing product
router.put("/:id", requireAuth, requireAdmin, productsController.update);

// Delete a product
router.delete("/:id", requireAuth, requireAdmin, productsController.remove);

module.exports = router;
