const db = require("../models/db");

// Get existing cart ID or create a new CART order for this user
function getCartId(userId, cb) {
  db.get(
    "SELECT id FROM orders WHERE user_id = ? AND status = 'CART'",
    [userId],
    (err, row) => {
      if (err) return cb(err);
      if (row) return cb(null, row.id);

      db.run(
        "INSERT INTO orders (user_id, status) VALUES (?, 'CART')",
        [userId],
        function (err) {
          if (err) return cb(err);
          cb(null, this.lastID);
        }
      );
    }
  );
}

// --------------------
// USER: GET /api/orders/me/cart
// Return cart items for current user
// --------------------
function getMyCart(req, res) {
  const userId = req.user.id;

  const sql = `
    SELECT
      o.id AS order_id,
      o.status,
      p.id AS product_id,
      p.name,
      p.price,
      p.image_url,
      oi.quantity
    FROM orders o
    JOIN order_items oi ON oi.order_id = o.id
    JOIN products p ON p.id = oi.product_id
    WHERE o.user_id = ? AND o.status = 'CART' AND oi.quantity > 0
    ORDER BY oi.id DESC
  `;

  db.all(sql, [userId], (err, rows) => {
    if (err) {
      console.error("getMyCart error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(rows);
  });
}

// --------------------
// USER: POST /api/orders/me/cart/items
// body: { product_id, quantity }
// Add to cart (creates CART if needed)
// --------------------
function addToCart(req, res) {
  const userId = req.user.id;
  const { product_id, quantity } = req.body;

  const pid = Number(product_id);
  const qty = Number(quantity);

  if (!pid || !Number.isFinite(qty) || qty <= 0) {
    return res.status(400).json({
      error: "product_id and quantity (>0) required"
    });
  }

  // We store unit_price in order_items (price at time of adding)
  db.get("SELECT id, price FROM products WHERE id = ?", [pid], (err, prod) => {
    if (err) {
      console.error("addToCart product lookup error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    if (!prod) return res.status(404).json({ error: "Product not found" });

    const unitPrice = Number(prod.price);

    getCartId(userId, (err, cartId) => {
      if (err) {
        console.error("addToCart getCartId error:", err);
        return res.status(500).json({ error: "Database error" });
      }

      // If product already exists in cart, increase quantity
      db.get(
        "SELECT id FROM order_items WHERE order_id = ? AND product_id = ?",
        [cartId, pid],
        (err, item) => {
          if (err) {
            console.error("addToCart select order_items error:", err);
            return res.status(500).json({ error: "Database error" });
          }

          if (item) {
            db.run(
              "UPDATE order_items SET quantity = quantity + ? WHERE id = ?",
              [qty, item.id],
              (err) => {
                if (err) {
                  console.error("addToCart update order_items error:", err);
                  return res.status(500).json({ error: "Database error" });
                }
                res.json({ ok: true });
              }
            );
          } else {
            db.run(
              "INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)",
              [cartId, pid, qty, unitPrice],
              (err) => {
                if (err) {
                  console.error("addToCart insert order_items error:", err);
                  return res.status(500).json({ error: "Database error" });
                }
                res.json({ ok: true });
              }
            );
          }
        }
      );
    });
  });
}

// --------------------
// USER: PUT /api/orders/me/cart/items/:productId
// body: { quantity }
// quantity <= 0 => remove item
// --------------------
function updateItem(req, res) {
  const userId = req.user.id;
  const productId = Number(req.params.productId);
  const qty = Number(req.body.quantity);

  if (!productId || !Number.isFinite(qty)) {
    return res.status(400).json({ error: "Valid quantity required" });
  }

  db.get(
    "SELECT id FROM orders WHERE user_id = ? AND status = 'CART'",
    [userId],
    (err, cart) => {
      if (err) {
        console.error("updateItem find cart error:", err);
        return res.status(500).json({ error: "Database error" });
      }
      if (!cart) return res.status(404).json({ error: "No active cart" });

      // Remove item
      if (qty <= 0) {
        db.run(
          "DELETE FROM order_items WHERE order_id = ? AND product_id = ?",
          [cart.id, productId],
          (err) => {
            if (err) {
              console.error("updateItem delete order_items error:", err);
              return res.status(500).json({ error: "Database error" });
            }
            return res.json({ ok: true });
          }
        );
        return;
      }

      // Update quantity
      db.run(
        "UPDATE order_items SET quantity = ? WHERE order_id = ? AND product_id = ?",
        [qty, cart.id, productId],
        function (err) {
          if (err) {
            console.error("updateItem update order_items error:", err);
            return res.status(500).json({ error: "Database error" });
          }
          if (this.changes === 0) {
            return res.status(404).json({ error: "Item not found in cart" });
          }
          res.json({ ok: true });
        }
      );
    }
  );
}

// --------------------
// USER: POST /api/orders/me/checkout
// In this project, checkout does NOT confirm the order.
// Admin will confirm CART -> ORDER.
// --------------------
function checkout(req, res) {
  const userId = req.user.id;

  db.get(
    "SELECT id FROM orders WHERE user_id = ? AND status = 'CART'",
    [userId],
    (err, cart) => {
      if (err) return res.status(500).json({ error: "Database error" });
      if (!cart) return res.status(400).json({ error: "Cart is empty" });

      db.get(
        "SELECT COUNT(*) AS cnt FROM order_items WHERE order_id = ? AND quantity > 0",
        [cart.id],
        (err, row) => {
          if (err) return res.status(500).json({ error: "Database error" });
          if (!row || row.cnt === 0) return res.status(400).json({ error: "Cart is empty" });

          res.json({
            ok: true,
            message: "Order request sent. Waiting for admin confirmation."
          });
        }
      );
    }
  );
}

// --------------------
// USER: GET /api/orders/me/orders
// List confirmed orders (status = ORDER) with totals
// --------------------
function getMyOrders(req, res) {
  const userId = req.user.id;

  const sql = `
    SELECT
      o.id,
      o.status,
      o.created_at,
      COALESCE(SUM(oi.quantity * oi.unit_price), 0) AS total
    FROM orders o
    LEFT JOIN order_items oi ON oi.order_id = o.id AND oi.quantity > 0
    WHERE o.user_id = ? AND o.status = 'ORDER'
    GROUP BY o.id
    ORDER BY o.id DESC
  `;

  db.all(sql, [userId], (err, rows) => {
    if (err) {
      console.error("getMyOrders error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(rows);
  });
}

// --------------------
// USER: GET /api/orders/me/orders/:orderId
// Details of one confirmed order (items + total)
// --------------------
function getMyOrderDetails(req, res) {
  const userId = req.user.id;
  const orderId = Number(req.params.orderId);

  if (!orderId) return res.status(400).json({ error: "Invalid orderId" });

  db.get(
    "SELECT id, status, created_at FROM orders WHERE id = ? AND user_id = ? AND status = 'ORDER'",
    [orderId, userId],
    (err, order) => {
      if (err) {
        console.error("getMyOrderDetails order lookup error:", err);
        return res.status(500).json({ error: "Database error" });
      }
      if (!order) return res.status(404).json({ error: "Order not found" });

      const itemsSql = `
        SELECT
          p.name,
          oi.quantity,
          oi.unit_price,
          (oi.quantity * oi.unit_price) AS line_total
        FROM order_items oi
        JOIN products p ON p.id = oi.product_id
        WHERE oi.order_id = ?
      `;

      db.all(itemsSql, [orderId], (err, items) => {
        if (err) {
          console.error("getMyOrderDetails items error:", err);
          return res.status(500).json({ error: "Database error" });
        }

        const total = items.reduce((sum, it) => sum + Number(it.line_total || 0), 0);
        res.json({ order, items, total });
      });
    }
  );
}

// --------------------
// ADMIN: GET /api/orders/admin/orders
// Optional: ?status=CART or ?status=ORDER
// --------------------
function adminListOrders(req, res) {
  const status = req.query.status ? String(req.query.status).toUpperCase() : null;

  let sql = `
    SELECT
      o.id,
      o.user_id,
      u.username,
      o.status,
      o.created_at,
      COALESCE(SUM(oi.quantity * oi.unit_price), 0) AS total
    FROM orders o
    LEFT JOIN users u ON u.id = o.user_id
    LEFT JOIN order_items oi ON oi.order_id = o.id AND oi.quantity > 0
    WHERE o.status IN ('CART','ORDER')
  `;
  const params = [];

  if (status) {
    sql += " AND o.status = ?";
    params.push(status);
  }

  sql += `
    GROUP BY o.id
    ORDER BY o.id DESC
  `;

  db.all(sql, params, (err, rows) => {
    if (err) {
      console.error("adminListOrders error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(rows);
  });
}

// --------------------
// ADMIN: GET /api/orders/admin/orders/:orderId
// View order + items (CART or ORDER)
// --------------------
function adminOrderDetails(req, res) {
  const orderId = Number(req.params.orderId);
  if (!orderId) return res.status(400).json({ error: "Invalid orderId" });

  db.get(
    `
    SELECT o.id, o.user_id, u.username, o.status, o.created_at
    FROM orders o
    LEFT JOIN users u ON u.id = o.user_id
    WHERE o.id = ? AND o.status IN ('CART','ORDER')
    `,
    [orderId],
    (err, order) => {
      if (err) {
        console.error("adminOrderDetails order error:", err);
        return res.status(500).json({ error: "Database error" });
      }
      if (!order) return res.status(404).json({ error: "Order not found" });

      db.all(
        `
        SELECT
          oi.product_id,
          p.name,
          oi.quantity,
          oi.unit_price,
          (oi.quantity * oi.unit_price) AS line_total
        FROM order_items oi
        JOIN products p ON p.id = oi.product_id
        WHERE oi.order_id = ?
        ORDER BY oi.id DESC
        `,
        [orderId],
        (err, items) => {
          if (err) {
            console.error("adminOrderDetails items error:", err);
            return res.status(500).json({ error: "Database error" });
          }

          const total = items.reduce((sum, it) => sum + Number(it.line_total || 0), 0);
          res.json({ order, items, total });
        }
      );
    }
  );
}

// --------------------
// ADMIN: PUT /api/orders/admin/orders/:orderId/confirm
// Confirm cart: CART -> ORDER
// --------------------
function adminConfirmOrder(req, res) {
  const orderId = Number(req.params.orderId);
  if (!orderId) return res.status(400).json({ error: "Invalid orderId" });

  db.run(
    "UPDATE orders SET status = 'ORDER' WHERE id = ? AND status = 'CART'",
    [orderId],
    function (err) {
      if (err) {
        console.error("adminConfirmOrder error:", err);
        return res.status(500).json({ error: "Database error" });
      }
      if (this.changes === 0) {
        return res.status(400).json({ error: "Order not found or not in CART state" });
      }
      res.json({ ok: true, orderId, status: "ORDER" });
    }
  );
}

module.exports = {
  getMyCart,
  addToCart,
  updateItem,
  checkout,
  getMyOrders,
  getMyOrderDetails,
  adminListOrders,
  adminOrderDetails,
  adminConfirmOrder
};
