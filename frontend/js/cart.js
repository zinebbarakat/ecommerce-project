import { apiFetch, getSession } from "./api.js";

const msg = document.getElementById("msg");
const cartDiv = document.getElementById("cart");
const totalEl = document.getElementById("total");
const checkoutBtn = document.getElementById("checkoutBtn");

function computeTotal(items) {
  let total = 0;
  for (const it of items) {
    total += (Number(it.price) || 0) * (Number(it.quantity) || 0);
  }
  return total;
}

function renderCart(items) {
  cartDiv.innerHTML = "";

  if (!items.length) {
    cartDiv.innerHTML = `<p>Your cart is empty.</p>`;
    totalEl.textContent = "Total: 0 €";
    return;
  }

  for (const it of items) {
    const card = document.createElement("div");
    card.className = "product";

    card.innerHTML = `
      <img src="http://localhost:3000${it.image_url}" alt="${it.name}" />
      <h3>${it.name}</h3>
      <p><b>Price:</b> ${it.price} €</p>

      <div style="display:flex; gap:10px; align-items:center;">
        <label>
          Qty:
          <input type="number" min="0" value="${it.quantity}" style="width:80px;" />
        </label>
        <button class="removeBtn" type="button">Remove</button>
      </div>
    `;

    const qtyInput = card.querySelector("input");
    const removeBtn = card.querySelector(".removeBtn");

    qtyInput.addEventListener("change", async () => {
      const q = Number(qtyInput.value);

      try {
        await apiFetch(`/orders/me/cart/items/${it.product_id}`, {
          method: "PUT",
          body: JSON.stringify({ quantity: q })
        });
        await loadCart();
      } catch (err) {
        alert(err.message);
      }
    });

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

  totalEl.textContent = `Total: ${computeTotal(items)} €`;
}

async function loadCart() {
  msg.textContent = "";

  const session = getSession();
  if (!session) {
    window.location.href = "login.html";
    return;
  }

  try {
    const rows = await apiFetch("/orders/me/cart");

    // Your backend uses LEFT JOIN so sometimes rows can have null product_id
    const items = rows.filter(
      (r) => r.product_id != null && Number(r.quantity) > 0
    );

    renderCart(items);
  } catch (err) {
    msg.textContent = err.message;
  }
}



checkoutBtn.addEventListener("click", async () => {
  msg.textContent = "";
  try {
    const result = await apiFetch("/orders/me/checkout", { method: "POST" });
    alert(result.message || "Sent to admin for confirmation.");

    await loadCart();
  } catch (err) {
    msg.textContent = err.message;
  }
});

loadCart();
