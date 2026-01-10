const bcrypt = require("bcryptjs");
const db = require("../models/db");

// REGISTER a new user
function register(req, res) {
  const { username, password, role, name, address, phone } = req.body;

  // Basic validation
  if (!username || !password || !role) {
    return res.status(400).json({ error: "username, password, role are required" });
  }

  // Only allow valid roles
  if (!["admin", "user"].includes(role)) {
    return res.status(400).json({ error: "role must be 'admin' or 'user'" });
  }

  // Hash the password before storing it
  const password_hash = bcrypt.hashSync(password, 10);

  // Insert new user into database
  db.run(
    `INSERT INTO users (username, password_hash, role, name, address, phone)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [username, password_hash, role, name || null, address || null, phone || null],
    function (err) {
      if (err) {
        // Username already exists
        if (String(err).includes("UNIQUE")) {
          return res.status(409).json({ error: "Username already exists" });
        }
        return res.status(500).json({ error: "Database error" });
      }

      // Send minimal session info back to frontend
      res.status(201).json({
        id: this.lastID,
        username,
        role
      });
    }
  );
}

// LOGIN an existing user
function login(req, res) {
  const { username, password } = req.body;

  // Basic validation
  if (!username || !password) {
    return res.status(400).json({ error: "username and password are required" });
  }

  // Look up user by username
  db.get(
    `SELECT id, username, password_hash, role FROM users WHERE username = ?`,
    [username],
    (err, user) => {
      if (err) return res.status(500).json({ error: "Database error" });
      if (!user) return res.status(401).json({ error: "Invalid credentials" });

      // Compare entered password with stored hash
      const ok = bcrypt.compareSync(password, user.password_hash);
      if (!ok) return res.status(401).json({ error: "Invalid credentials" });

      // Return session data to frontend
      res.json({
        id: user.id,
        username: user.username,
        role: user.role
      });
    }
  );
}

module.exports = { register, login };
