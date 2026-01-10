import { apiFetch, getSession } from "./api.js";

const loadBtn = document.getElementById("loadOrdersBtn");
const statusSel = document.getElementById("orderStatus");
const msg = document.getElementById("ordersMsg");
const wrap = document.getElementById("ordersAdmin");

function ensureAdmin() {
  const session = getSession();
  if (!session) {
    window.location.href = "login.html";
    return null;
  }
  if (session.role !== "admin") {
    alert("Admin only.");
    window.location.href = "index.html";
    return null;
  }
  return session;
}

function render(items) {
  wrap.innerHTML = "";

  if (!items.length) {
    wrap.innerHTML = "<p>No orders found.</p>";
    return;
  }

  for (const o of items) {
    const div = document.createElement("div");
    div.style.padding = "12px 0";
    div.style.borderBottom = "1px solid #eee";

    div.innerHTML = `
      <div style="display:flex; justify-content:space-between; gap:12px;">
        <div>
          <b>Order #${o.id}</b><br/>
          User: ${o.username || ("User #" + o.user_id)}<br/>
          Status: <b>${o.status}</b><br/>
          Date: ${o.created_at || "-"}
        </div>
        <div style="text-align:right;">
          <b>Total:</b> ${o.total ?? 0} €<br/>
          <button class="detailsBtn" type="button">Details</button>
          ${
            o.status === "CART"
              ? `<button class="confirmBtn" type="button">Confirm</button>`
              : ""
          }
        </div>
      </div>
      <div class="detailsBox" style="margin-top:10px; display:none;"></div>
    `;

    const detailsBtn = div.querySelector(".detailsBtn");
    const confirmBtn = div.querySelector(".confirmBtn");
    const detailsBox = div.querySelector(".detailsBox");

    // View order items
    detailsBtn.addEventListener("click", async () => {
      try {
        if (detailsBox.style.display === "block") {
          detailsBox.style.display = "none";
          detailsBox.innerHTML = "";
          return;
        }

        const data = await apiFetch(`/orders/admin/orders/${o.id}`);
        const rows = (data.items || [])
          .map(
            (it) =>
              `<div style="display:flex; justify-content:space-between; padding:6px 0;">
                <div>${it.name} (x${it.quantity})</div>
                <div>${it.line_total} €</div>
              </div>`
          )
          .join("");

        detailsBox.innerHTML = `
          <div class="card" style="margin-top:8px;">
            ${rows || "<p>No items.</p>"}
            <hr/>
            <p style="text-align:right;"><b>Total:</b> ${data.total ?? 0} €</p>
          </div>
        `;
        detailsBox.style.display = "block";
      } catch (err) {
        alert(err.message);
      }
    });

    // Confirm CART → ORDER
    if (confirmBtn) {
      confirmBtn.addEventListener("click", async () => {
        try {
          await apiFetch(`/orders/admin/orders/${o.id}/confirm`, {
            method: "PUT"
          });
          alert(`Order #${o.id} confirmed`);
          await loadOrders();
        } catch (err) {
          alert(err.message);
        }
      });
    }

    wrap.appendChild(div);
  }
}

async function loadOrders() {
  msg.textContent = "";
  ensureAdmin();

  try {
    const status = statusSel.value;
    const path = status
      ? `/orders/admin/orders?status=${encodeURIComponent(status)}`
      : "/orders/admin/orders";

    const orders = await apiFetch(path);
    render(orders);
  } catch (err) {
    msg.textContent = err.message;
  }
}

if (loadBtn) loadBtn.addEventListener("click", loadOrders);
if (statusSel) statusSel.addEventListener("change", loadOrders);

// auto-load
ensureAdmin();
loadOrders();
