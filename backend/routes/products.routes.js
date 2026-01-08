const express = require("express");
const router = express.Router();

const productsController = require("../controllers/products.controller");
const { requireAuth, requireAdmin } = require("../middlewares/auth");

// Public (no auth)
router.get("/", productsController.getAll);
router.get("/:id", productsController.getById);

// Admin only
router.post("/", requireAuth, requireAdmin, productsController.create);
router.put("/:id", requireAuth, requireAdmin, productsController.update);
router.delete("/:id", requireAuth, requireAdmin, productsController.remove);

module.exports = router;
