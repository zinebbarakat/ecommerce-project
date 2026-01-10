const express = require("express");
const router = express.Router();

const ordersController = require("../controllers/orders.controller");
const { requireAuth, requireUser, requireAdmin } = require("../middlewares/auth");

// Debug endpoint (optional, useful during development)
router.get("/ping", (req, res) => res.json({ ok: true, route: "orders" }));

// --------------------
// USER: cart & checkout
// --------------------

// Get current user's cart (status = CART)
router.get("/me/cart", requireAuth, requireUser, ordersController.getMyCart);

// Add a product to cart
router.post("/me/cart/items", requireAuth, requireUser, ordersController.addToCart);

// Update quantity / remove item from cart
router.put("/me/cart/items/:productId", requireAuth, requireUser, ordersController.updateItem);

// Checkout (user finishes cart and requests confirmation)
router.post("/me/checkout", requireAuth, requireUser, ordersController.checkout);

// --------------------
// USER: past orders
// --------------------

// List user's confirmed orders
router.get("/me/orders", requireAuth, requireUser, ordersController.getMyOrders);

// Get details of a specific order
router.get("/me/orders/:orderId", requireAuth, requireUser, ordersController.getMyOrderDetails);

// --------------------
// ADMIN: manage user orders
// --------------------

// List all user orders
router.get("/admin/orders", requireAuth, requireAdmin, ordersController.adminListOrders);

// View details of a specific order
router.get("/admin/orders/:orderId", requireAuth, requireAdmin, ordersController.adminOrderDetails);

// Confirm an order (ORDER → confirmed)
router.put(
  "/admin/orders/:orderId/confirm",
  requireAuth,
  requireAdmin,
  ordersController.adminConfirmOrder
);

module.exports = router;
