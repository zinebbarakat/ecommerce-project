const db = require("../models/db");

// GET /api/products
// Optional filters:
//   ?category=Phones
//   ?categories=Phones,Laptops..
function getAll(req, res) {
  const { category, categories } = req.query;

  let sql = "SELECT * FROM products";
  const params = [];

  // Normalize categories so "Phones" == " phones "
  const normalize = (s) => String(s).trim().toLowerCase();

  // Multi-category filter (categories=Phones,Laptops..)
  if (categories) {
    const list = String(categories)
      .split(",")
      .map(normalize)
      .filter(Boolean);

    if (list.length > 0) {
      const placeholders = list.map(() => "?").join(",");
      sql += ` WHERE LOWER(TRIM(category)) IN (${placeholders})`;
      params.push(...list);
    }
  } else if (category) {
    // Single-category filter (category=Phones)
    sql += " WHERE LOWER(TRIM(category)) = ?";
    params.push(normalize(category));
  }

  sql += " ORDER BY id DESC";

  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json(rows);
  });
}

// GET /api/products/:id
function getById(req, res) {
  const id = Number(req.params.id);

  db.get("SELECT * FROM products WHERE id = ?", [id], (err, row) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (!row) return res.status(404).json({ error: "Product not found" });
    res.json(row);
  });
}

// POST /api/products (admin)
function create(req, res) {
  const { name, category, price, stock, image_url, short_desc, long_desc } = req.body;

  if (!name || !category || price === undefined || stock === undefined || !image_url) {
    return res.status(400).json({
      error: "name, category, price, stock, image_url are required"
    });
  }

  const p = Number(price);
  const s = Number(stock);
  if (!Number.isFinite(p) || p < 0 || !Number.isInteger(s) || s < 0) {
    return res.status(400).json({ error: "price must be >= 0 and stock must be a valid integer >= 0" });
  }

  db.run(
    `INSERT INTO products (name, category, price, stock, image_url, short_desc, long_desc)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [name, category, p, s, image_url, short_desc || null, long_desc || null],
    function (err) {
      if (err) return res.status(500).json({ error: "Database error" });

      res.status(201).json({
        id: this.lastID,
        name,
        category,
        price: p,
        stock: s,
        image_url,
        short_desc: short_desc || null,
        long_desc: long_desc || null
      });
    }
  );
}

// PUT /api/products/:id (admin)
function update(req, res) {
  const id = Number(req.params.id);
  const { name, category, price, stock, image_url, short_desc, long_desc } = req.body;

  // Require all fields (simpler and avoids partial update bugs)
  if (!name || !category || price === undefined || stock === undefined || !image_url) {
    return res.status(400).json({
      error: "name, category, price, stock, image_url are required"
    });
  }

  const p = Number(price);
  const s = Number(stock);
  if (!Number.isFinite(p) || p < 0 || !Number.isInteger(s) || s < 0) {
    return res.status(400).json({ error: "price must be >= 0 and stock must be a valid integer >= 0" });
  }

  db.run(
    `UPDATE products
     SET name=?, category=?, price=?, stock=?, image_url=?, short_desc=?, long_desc=?
     WHERE id=?`,
    [name, category, p, s, image_url, short_desc || null, long_desc || null, id],
    function (err) {
      if (err) return res.status(500).json({ error: "Database error" });
      if (this.changes === 0) return res.status(404).json({ error: "Product not found" });

      res.json({
        id,
        name,
        category,
        price: p,
        stock: s,
        image_url,
        short_desc: short_desc || null,
        long_desc: long_desc || null
      });
    }
  );
}

// DELETE /api/products/:id (admin)
function remove(req, res) {
  const id = Number(req.params.id);

  db.run("DELETE FROM products WHERE id = ?", [id], function (err) {
    if (err) return res.status(500).json({ error: "Database error" });
    if (this.changes === 0) return res.status(404).json({ error: "Product not found" });

    res.json({ ok: true });
  });
}

module.exports = { getAll, getById, create, update, remove };
