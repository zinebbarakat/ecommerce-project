import { apiFetch, getSession } from "./api.js";

const msgEl = document.getElementById("msg");
const cartDiv = document.getElementById("cart");
const totalEl = document.getElementById("total");
const checkoutBtn = document.getElementById("checkoutBtn");

function formatMoney(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "0.00";
  return n.toFixed(2);
}

function computeTotal(items) {
  let total = 0;
  for (const it of items) {
    total += (Number(it.price) || 0) * (Number(it.quantity) || 0);
  }
  return total;
}

function setTotal(items) {
  const total = computeTotal(items);
  totalEl.textContent = `Total: ${formatMoney(total)} €`;
}

function renderEmptyCart() {
  cartDiv.innerHTML = `<p>Your cart is empty.</p>`;
  totalEl.textContent = "Total: 0.00 €";
}

function renderCart(items) {
  cartDiv.innerHTML = "";

  if (!items.length) {
    renderEmptyCart();
    return;
  }

  for (const it of items) {
    const card = document.createElement("div");
    card.className = "product";

    card.innerHTML = `
      <img src="http://localhost:3000${it.image_url}" alt="${it.name}" />
      <h3>${it.name}</h3>
      <p><b>Price:</b> ${formatMoney(it.price)} €</p>

      <div class="cartRow">
        <label class="cartQtyLabel">
          Qty:
          <input class="cartQtyInput" type="number" min="0" value="${it.quantity}" />
        </label>
        <button class="removeBtn btnDanger" type="button">Remove</button>
      </div>
    `;

    const qtyInput = card.querySelector(".cartQtyInput");
    const removeBtn = card.querySelector(".removeBtn");

    // Update quantity
    qtyInput.addEventListener("change", async () => {
      let q = Number(qtyInput.value);
      if (!Number.isFinite(q) || q < 0) q = 0;

      try {
        await apiFetch(`/orders/me/cart/items/${it.product_id}`, {
          method: "PUT",
          body: JSON.stringify({ quantity: q })
        });
        await loadCart();
      } catch (err) {
        alert(err.message);
        await loadCart(); // reset UI to real value
      }
    });

    // Remove item (quantity = 0)
    removeBtn.addEventListener("click", async () => {
      try {
        await apiFetch(`/orders/me/cart/items/${it.product_id}`, {
          method: "PUT",
          body: JSON.stringify({ quantity: 0 })
        });
        await loadCart();
      } catch (err) {
        alert(err.message);
      }
    });

    cartDiv.appendChild(card);
  }

  setTotal(items);
}

async function loadCart() {
  msgEl.textContent = "";

  const session = getSession();

  // Must be logged in
  if (!session) {
    window.location.href = "login.html";
    return;
  }

  // Users only (admin shouldn't buy)
  if (session.role !== "user") {
    alert("Admins cannot use the cart.");
    window.location.href = "index.html";
    return;
  }

  try {
    const rows = await apiFetch("/orders/me/cart");

    // Safety: ignore null rows or invalid quantities
    const items = (rows || []).filter(
      (r) => r.product_id != null && Number(r.quantity) > 0
    );

    renderCart(items);
  } catch (err) {
    msgEl.textContent = err.message;
  }
}

// Checkout (request admin confirmation)
if (checkoutBtn) {
  checkoutBtn.addEventListener("click", async () => {
    msgEl.textContent = "";

    try {
      const result = await apiFetch("/orders/me/checkout", { method: "POST" });
      alert(result.message || "Order request sent to admin.");

      await loadCart();
    } catch (err) {
      msgEl.textContent = err.message;
    }
  });
}

// Load cart on page open
loadCart();
