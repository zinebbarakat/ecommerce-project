const express = require("express");
const router = express.Router();

const ordersController = require("../controllers/orders.controller");
const { requireAuth, requireUser, requireAdmin } = require("../middlewares/auth");

// ✅ debug (optional)
router.get("/ping", (req, res) => res.json({ ok: true, route: "orders" }));

// --------------------
// USER-only cart & checkout
// --------------------
router.get("/me/cart", requireAuth, requireUser, ordersController.getMyCart);
router.post("/me/cart/items", requireAuth, requireUser, ordersController.addToCart);
router.put("/me/cart/items/:productId", requireAuth, requireUser, ordersController.updateItem);
router.post("/me/checkout", requireAuth, requireUser, ordersController.checkout);

// --------------------
// USER-only past orders + details
// --------------------
router.get("/me/orders", requireAuth, requireUser, ordersController.getMyOrders);
router.get("/me/orders/:orderId", requireAuth, requireUser, ordersController.getMyOrderDetails);

// --------------------
// ADMIN: manage user orders + confirm
// --------------------
router.get("/admin/orders", requireAuth, requireAdmin, ordersController.adminListOrders);
router.get("/admin/orders/:orderId", requireAuth, requireAdmin, ordersController.adminOrderDetails);
router.put("/admin/orders/:orderId/confirm", requireAuth, requireAdmin, ordersController.adminConfirmOrder);

module.exports = router;
