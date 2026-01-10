const db = require("../models/db");

// Reads x-user-id + x-user-role headers set by frontend apiFetch
function requireAuth(req, res, next) {
  const userId = Number(req.headers["x-user-id"]);
  const role = String(req.headers["x-user-role"] || "").toLowerCase();

  if (!userId || !role) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  // Optional: verify user exists in DB (safer)
  db.get("SELECT id, username, role FROM users WHERE id = ?", [userId], (err, user) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (!user) return res.status(401).json({ error: "Not authenticated" });

    req.user = { id: user.id, username: user.username, role: user.role };
    next();
  });
}

function requireAdmin(req, res, next) {
  if (!req.user) return res.status(401).json({ error: "Not authenticated" });
  if (req.user.role !== "admin") return res.status(403).json({ error: "Admin only" });
  next();
}

function requireUser(req, res, next) {
  if (!req.user) return res.status(401).json({ error: "Not authenticated" });
  if (req.user.role !== "user") return res.status(403).json({ error: "Users only" });
  next();
}

module.exports = { requireAuth, requireAdmin, requireUser };
