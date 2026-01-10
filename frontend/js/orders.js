import { apiFetch, getSession } from "./api.js";

const ordersDiv = document.getElementById("orders");
const msg = document.getElementById("msg");

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
      <p><b>Total:</b> ${o.total ?? 0} €</p>
      <p><b>Date:</b> ${o.created_at || "-"}</p>
      <button class="detailsBtn" type="button">View Details</button>
    `;

    card.querySelector(".detailsBtn").addEventListener("click", () => {
      window.location.href = `order-details.html?id=${o.id}`;
    });

    ordersDiv.appendChild(card);
  }
}

async function loadOrders() {
  msg.textContent = "";

  const session = getSession();
  if (!session) {
    window.location.href = "login.html";
    return;
  }

  try {
    const orders = await apiFetch("/orders/me/orders");
    renderOrders(orders);
  } catch (err) {
    msg.textContent = err.message;
  }
}

loadOrders();
