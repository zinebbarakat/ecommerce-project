const db = require("../models/db");

// Auth middleware: checks if the request belongs to a real logged-in user
// Our frontend sends x-user-id in every API call after login
function requireAuth(req, res, next) {
  const userId = Number(req.headers["x-user-id"]);

  if (!userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  // Always verify the user from the database (don’t trust client data)
  db.get(
    "SELECT id, username, role FROM users WHERE id = ?",
    [userId],
    (err, user) => {
      if (err) return res.status(500).json({ error: "Database error" });
      if (!user) return res.status(401).json({ error: "Not authenticated" });

      // Attach user info to the request so routes/controllers can use it
      req.user = { id: user.id, username: user.username, role: user.role };
      next();
    }
  );
}

// Role middleware: admin-only access
function requireAdmin(req, res, next) {
  if (!req.user) return res.status(401).json({ error: "Not authenticated" });
  if (req.user.role !== "admin") return res.status(403).json({ error: "Admin only" });
  next();
}

// Role middleware: user-only access
function requireUser(req, res, next) {
  if (!req.user) return res.status(401).json({ error: "Not authenticated" });
  if (req.user.role !== "user") return res.status(403).json({ error: "Users only" });
  next();
}

module.exports = { requireAuth, requireAdmin, requireUser };
