const db = require("../models/db");

// Helper: get or create CART for user
function getOrCreateCart(userId, cb) {
  db.get(
    `SELECT * FROM orders WHERE user_id = ? AND status = 'CART'`,
    [userId],
    (err, order) => {
      if (err) return cb(err);

      if (order) return cb(null, order);

      db.run(
        `INSERT INTO orders (user_id, status) VALUES (?, 'CART')`,
        [userId],
        function (err) {
          if (err) return cb(err);
          cb(null, { id: this.lastID, user_id: userId, status: "CART" });
        }
      );
    }
  );
}

// GET /api/orders/me/cart
function getMyCart(req, res) {
  const userId = req.user.id;

  getOrCreateCart(userId, (err, cart) => {
    if (err) return res.status(500).json({ error: "Database error" });

    db.all(
      `SELECT oi.product_id, p.name, p.price, oi.quantity, oi.unit_price
       FROM order_items oi
       JOIN products p ON p.id = oi.product_id
       WHERE oi.order_id = ?`,
      [cart.id],
      (err, items) => {
        if (err) return res.status(500).json({ error: "Database error" });

        const total = items.reduce(
          (sum, i) => sum + i.quantity * i.unit_price,
          0
        );

        res.json({ cart_id: cart.id, items, total });
      }
    );
  });
}

// POST /api/orders/me/cart/items
function addToCart(req, res) {
  const userId = req.user.id;
  const { product_id, quantity } = req.body;

  if (!product_id || !quantity) {
    return res.status(400).json({ error: "product_id and quantity required" });
  }

  getOrCreateCart(userId, (err, cart) => {
    if (err) return res.status(500).json({ error: "Database error" });

    db.get(
      `SELECT price FROM products WHERE id = ?`,
      [product_id],
      (err, product) => {
        if (err) return res.status(500).json({ error: "Database error" });
        if (!product) return res.status(404).json({ error: "Product not found" });

        db.run(
          `INSERT INTO order_items (order_id, product_id, quantity, unit_price)
           VALUES (?, ?, ?, ?)
           ON CONFLICT(order_id, product_id)
           DO UPDATE SET quantity = quantity + excluded.quantity`,
          [cart.id, product_id, Number(quantity), product.price],
          (err) => {
            if (err) return res.status(500).json({ error: "Database error" });
            res.status(201).json({ ok: true });
          }
        );
      }
    );
  });
}

// PUT /api/orders/me/cart/items/:productId
function updateItem(req, res) {
  const userId = req.user.id;
  const productId = Number(req.params.productId);
  const { quantity } = req.body;

  if (quantity === undefined) {
    return res.status(400).json({ error: "quantity required" });
  }

  getOrCreateCart(userId, (err, cart) => {
    if (err) return res.status(500).json({ error: "Database error" });

    if (Number(quantity) <= 0) {
      db.run(
        `DELETE FROM order_items WHERE order_id = ? AND product_id = ?`,
        [cart.id, productId],
        () => res.json({ ok: true })
      );
    } else {
      db.run(
        `UPDATE order_items SET quantity = ? WHERE order_id = ? AND product_id = ?`,
        [Number(quantity), cart.id, productId],
        () => res.json({ ok: true })
      );
    }
  });
}

// POST /api/orders/me/checkout
function checkout(req, res) {
  const userId = req.user.id;

  getOrCreateCart(userId, (err, cart) => {
    if (err) return res.status(500).json({ error: "Database error" });

    db.run(
      `UPDATE orders SET status = 'ORDER' WHERE id = ?`,
      [cart.id],
      (err) => {
        if (err) return res.status(500).json({ error: "Database error" });
        res.json({ ok: true, order_id: cart.id });
      }
    );
  });
}

module.exports = {
  getMyCart,
  addToCart,
  updateItem,
  checkout
};
