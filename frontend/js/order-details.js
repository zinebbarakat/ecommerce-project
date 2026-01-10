import { apiFetch, getSession } from "./api.js";

const msg = document.getElementById("msg");
const orderIdEl = document.getElementById("orderId");
const orderDateEl = document.getElementById("orderDate");
const orderTotalEl = document.getElementById("orderTotal");
const itemsDiv = document.getElementById("items");

function getOrderIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return Number(params.get("id"));
}

function renderItems(items) {
  if (!items.length) {
    itemsDiv.innerHTML = "<p>No items found for this order.</p>";
    return;
  }

  const rows = items
    .map(
      (it) => `
      <div style="display:flex; justify-content:space-between; gap:12px; padding:10px 0; border-bottom:1px solid #eee;">
        <div style="flex:1;">
          <b>${it.name}</b><br/>
          Qty: ${it.quantity}
        </div>
        <div style="min-width:160px; text-align:right;">
          Unit: ${it.unit_price} €<br/>
          <b>Line:</b> ${it.line_total} €
        </div>
      </div>
    `
    )
    .join("");

  itemsDiv.innerHTML = rows;
}

async function loadDetails() {
  msg.textContent = "";

  const session = getSession();
  if (!session) {
    window.location.href = "login.html";
    return;
  }

  const id = getOrderIdFromUrl();
  if (!id) {
    msg.textContent = "Missing order id in URL.";
    return;
  }

  try {
    const data = await apiFetch(`/orders/me/orders/${id}`);

    orderIdEl.textContent = data.order?.id ?? id;
    orderDateEl.textContent = data.order?.created_at ?? "-";
    orderTotalEl.textContent = `${data.total ?? 0} €`;

    renderItems(data.items || []);
  } catch (err) {
    msg.textContent = err.message;
  }
}

loadDetails();
