const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Absolute path to the SQLite database file
const dbPath = path.join(__dirname, "..", "database.db");

// Open (or create) the database
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Failed to open database:", err.message);
  } else {
    console.log("Connected to SQLite database:", dbPath);
  }
});

db.serialize(() => {
  // (Optional but recommended) enforce foreign keys in SQLite
  db.run("PRAGMA foreign_keys = ON");

  // USERS: authentication + roles
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin','user')),
      name TEXT,
      address TEXT,
      phone TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // PRODUCTS: product catalog
  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      price REAL NOT NULL CHECK(price >= 0),
      stock INTEGER NOT NULL CHECK(stock >= 0),
      image_url TEXT NOT NULL,
      short_desc TEXT,
      long_desc TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // ORDERS: we store cart + confirmed order using status
  // CART = temporary active cart, ORDER = confirmed order
  db.run(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('CART','ORDER')),
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )
  `);

  // ORDER ITEMS: products inside a cart/order
  // UNIQUE(order_id, product_id) prevents duplicates (we update quantity instead)
  db.run(`
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL CHECK(quantity > 0),
      unit_price REAL NOT NULL CHECK(unit_price >= 0),
      FOREIGN KEY(order_id) REFERENCES orders(id),
      FOREIGN KEY(product_id) REFERENCES products(id),
      UNIQUE(order_id, product_id)
    )
  `);
});

module.exports = db;
