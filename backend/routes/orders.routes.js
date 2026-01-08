const express = require("express");
const router = express.Router();

const ordersController = require("../controllers/orders.controller");
const { requireAuth } = require("../middlewares/auth");

// ✅ keep this for debugging (optional, you can remove later)
router.get("/ping", (req, res) => res.json({ ok: true, route: "orders" }));

// ✅ CART endpoints (required)
router.get("/me/cart", requireAuth, ordersController.getMyCart);
router.post("/me/cart/items", requireAuth, ordersController.addToCart);
router.put("/me/cart/items/:productId", requireAuth, ordersController.updateItem);

// ✅ checkout = CART -> ORDER (required)
router.post("/me/checkout", requireAuth, ordersController.checkout);

module.exports = router;
