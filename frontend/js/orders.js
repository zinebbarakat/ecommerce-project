import { apiFetch, getSession } from "./api.js";

const ordersDiv = document.getElementById("orders");
const msgEl = document.getElementById("msg");

function formatMoney(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "0.00";
  return n.toFixed(2);
}

function formatDate(value) {
  if (!value) return "-";
  // Keep it simple: show the raw value if Date parsing fails
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  return d.toLocaleString();
}

function renderOrders(list) {
  ordersDiv.innerHTML = "";

  if (!list.length) {
    ordersDiv.innerHTML = `<p>No past orders yet.</p>`;
    return;
  }

  for (const o of list) {
    const card = document.createElement("div");
    card.className = "product";

    card.innerHTML = `
      <h3>Order #${o.id}</h3>
      <p><b>Status:</b> ${o.status}</p>
      <p><b>Total:</b> ${formatMoney(o.total)} €</p>
      <p><b>Date:</b> ${formatDate(o.created_at)}</p>
      <button class="detailsBtn" type="button">View Details</button>
    `;

    // Open order details page
    card.querySelector(".detailsBtn").addEventListener("click", () => {
      window.location.href = `order-details.html?id=${o.id}`;
    });

    ordersDiv.appendChild(card);
  }
}

async function loadOrders() {
  msgEl.textContent = "";

  const session = getSession();

  // Must be logged in
  if (!session) {
    window.location.href = "login.html";
    return;
  }

  // Users only (admin should not use this page)
  if (session.role !== "user") {
    alert("This page is for users only.");
    window.location.href = "index.html";
    return;
  }

  try {
    const orders = await apiFetch("/orders/me/orders");
    renderOrders(orders);
  } catch (err) {
    msgEl.textContent = err.message;
  }
}

// Load on page open
loadOrders();
