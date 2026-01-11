import { apiFetch, getSession } from "./api.js";

const msgEl = document.getElementById("msg");
const orderIdEl = document.getElementById("orderId");
const orderDateEl = document.getElementById("orderDate");
const orderTotalEl = document.getElementById("orderTotal");
const itemsDiv = document.getElementById("items");

function getOrderIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const id = Number(params.get("id"));
  return Number.isFinite(id) ? id : null;
}

function formatMoney(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "0.00";
  return n.toFixed(2);
}

function formatDate(value) {
  if (!value) return "-";
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  return d.toLocaleString();
}

function renderItems(items) {
  if (!items.length) {
    itemsDiv.innerHTML = "<p>No items found for this order.</p>";
    return;
  }

  itemsDiv.innerHTML = items
    .map(
      (it) => `
        <div class="orderItemRow">
          <div class="orderItemLeft">
            <b>${it.name}</b><br/>
            Qty: ${it.quantity}
          </div>
          <div class="orderItemRight">
            Unit: ${formatMoney(it.unit_price)} €<br/>
            <b>Line:</b> ${formatMoney(it.line_total)} €
          </div>
        </div>
      `
    )
    .join("");
}

async function loadDetails() {
  msgEl.textContent = "";

  const session = getSession();

  // Must be logged in
  if (!session) {
    window.location.href = "login.html";
    return;
  }

  // Users only
  if (session.role !== "user") {
    alert("This page is for users only.");
    window.location.href = "index.html";
    return;
  }

  const id = getOrderIdFromUrl();
  if (!id) {
    msgEl.textContent = "Missing order id in URL.";
    return;
  }

  try {
    const data = await apiFetch(`/orders/me/orders/${id}`);

    // Header info
    orderIdEl.textContent = data.order?.id ?? id;
    orderDateEl.textContent = formatDate(data.order?.created_at);
    orderTotalEl.textContent = `${formatMoney(data.total)} €`;

    // Items list
    renderItems(data.items || []);
  } catch (err) {
    msgEl.textContent = err.message;
  }
}

// Load on page open
loadDetails();
