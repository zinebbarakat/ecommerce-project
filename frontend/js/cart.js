import { apiFetch, getSession, clearSession } from "./api.js";

const msg = document.getElementById("msg");
const cartItemsDiv = document.getElementById("cartItems");
const refreshBtn = document.getElementById("refreshBtn");
const checkoutBtn = document.getElementById("checkoutBtn");
const logoutLink = document.getElementById("logoutLink");

function requireSession() {
  const s = getSession();
  if (!s) {
    window.location.href = "login.html";
    throw new Error("Not logged in");
  }
  return s;
}

function renderCart(cart) {
  if (!cart.items || cart.items.length === 0) {
    cartItemsDiv.innerHTML = `<p>Your cart is empty.</p>`;
    return;
  }

  let html = `
    <h3>Cart Items</h3>
    <table class="table">
      <thead>
        <tr>
          <th>Product</th>
          <th>Unit Price</th>
          <th>Qty</th>
          <th>Subtotal</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
  `;

  for (const item of cart.items) {
    const subtotal = item.quantity * item.unit_price;
    html += `
      <tr>
        <td>${item.name}</td>
        <td>${item.unit_price} €</td>
        <td>
          <input type="number" min="0" value="${item.quantity}" data-product-id="${item.product_id}" class="qtyInput" />
        </td>
        <td>${subtotal} €</td>
        <td><button class="removeBtn" data-product-id="${item.product_id}">Remove</button></td>
      </tr>
    `;
  }

  html += `
      </tbody>
    </table>
    <h3>Total: ${cart.total} €</h3>
    <p><small>Tip: set quantity to 0 to remove an item.</small></p>
  `;

  cartItemsDiv.innerHTML = html;

  // qty change handlers
  document.querySelectorAll(".qtyInput").forEach((input) => {
    input.addEventListener("change", async (e) => {
      msg.textContent = "";
      const productId = e.target.getAttribute("data-product-id");
      const quantity = Number(e.target.value);

      try {
        requireSession();
        await apiFetch(`/orders/me/cart/items/${productId}`, {
          method: "PUT",
          body: JSON.stringify({ quantity })
        });
        await loadCart();
      } catch (err) {
        msg.textContent = err.message;
      }
    });
  });

  // remove button handlers
  document.querySelectorAll(".removeBtn").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      msg.textContent = "";
      const productId = e.target.getAttribute("data-product-id");
      try {
        requireSession();
        await apiFetch(`/orders/me/cart/items/${productId}`, {
          method: "PUT",
          body: JSON.stringify({ quantity: 0 })
        });
        await loadCart();
      } catch (err) {
        msg.textContent = err.message;
      }
    });
  });
}

async function loadCart() {
  msg.textContent = "";
  try {
    requireSession();
    const cart = await apiFetch("/orders/me/cart");
    renderCart(cart);
  } catch (err) {
    msg.textContent = err.message;
  }
}

refreshBtn.addEventListener("click", loadCart);

checkoutBtn.addEventListener("click", async () => {
  msg.textContent = "";
  try {
    requireSession();
    const res = await apiFetch("/orders/me/checkout", { method: "POST" });
    alert(`Checkout successful! Order ID: ${res.order_id}`);
    await loadCart(); // new cart will be created automatically
  } catch (err) {
    msg.textContent = err.message;
  }
});

logoutLink.addEventListener("click", (e) => {
  e.preventDefault();
  clearSession();
  window.location.href = "login.html";
});

// Load cart on page open
loadCart();
