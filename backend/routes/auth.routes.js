const express = require("express");
const router = express.Router();

// Import authentication controller (logic lives there)
const authController = require("../controllers/auth.controller");

// Register a new user
// POST /api/auth/register
router.post("/register", authController.register);

// Login an existing user
// POST /api/auth/login
router.post("/login", authController.login);

module.exports = router;
