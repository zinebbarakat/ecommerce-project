import { apiFetch, getSession } from "./api.js";

const loadBtn = document.getElementById("loadOrdersBtn");
const statusSel = document.getElementById("orderStatus");
const msgEl = document.getElementById("ordersMsg");
const wrap = document.getElementById("ordersAdmin");

function formatMoney(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "0.00";
  return n.toFixed(2);
}

function ensureAdminOrRedirect() {
  const session = getSession();

  if (!session) {
    window.location.href = "login.html";
    return false;
  }

  if (session.role !== "admin") {
    alert("Admin only.");
    window.location.href = "index.html";
    return false;
  }

  return true;
}

function renderOrders(list) {
  wrap.innerHTML = "";

  if (!list || !list.length) {
    wrap.innerHTML = "<p>No orders found.</p>";
    return;
  }

  for (const o of list) {
    const item = document.createElement("div");
    item.className = "adminOrder";

    item.innerHTML = `
      <div class="adminOrderTop">
        <div class="adminOrderInfo">
          <b>Order #${o.id}</b><br/>
          User: ${o.username || `User #${o.user_id}`}<br/>
          Status: <b>${o.status}</b><br/>
          Date: ${o.created_at || "-"}
        </div>

        <div class="adminOrderActions">
          <div><b>Total:</b> ${formatMoney(o.total ?? 0)} €</div>

          <div class="adminOrderBtns">
            <button class="detailsBtn btnPrimary" type="button">Details</button>
            ${
              o.status === "CART"
                ? `<button class="confirmBtn" type="button">Confirm</button>`
                : ""
            }
          </div>
        </div>
      </div>

      <div class="detailsBox" hidden></div>
    `;

    const detailsBtn = item.querySelector(".detailsBtn");
    const confirmBtn = item.querySelector(".confirmBtn");
    const detailsBox = item.querySelector(".detailsBox");

    // Show/hide order items
    detailsBtn.addEventListener("click", async () => {
      try {
        // Toggle close
        if (!detailsBox.hidden) {
          detailsBox.hidden = true;
          detailsBox.innerHTML = "";
          return;
        }

        const data = await apiFetch(`/orders/admin/orders/${o.id}`);

        const rows = (data.items || [])
          .map(
            (it) => `
              <div class="adminOrderRow">
                <div>${it.name} (x${it.quantity})</div>
                <div>${formatMoney(it.line_total)} €</div>
              </div>
            `
          )
          .join("");

        detailsBox.innerHTML = `
          <div class="card adminOrderDetailsCard">
            ${rows || "<p>No items.</p>"}
            <div class="totalLine">
              <span>Total</span>
              <span>${formatMoney(data.total ?? 0)} €</span>
            </div>
          </div>
        `;

        detailsBox.hidden = false;
      } catch (err) {
        alert(err.message);
      }
    });

    // Confirm order: CART -> ORDER
    if (confirmBtn) {
      confirmBtn.addEventListener("click", async () => {
        try {
          await apiFetch(`/orders/admin/orders/${o.id}/confirm`, { method: "PUT" });
          alert(`Order #${o.id} confirmed`);
          await loadOrders();
        } catch (err) {
          alert(err.message);
        }
      });
    }

    wrap.appendChild(item);
  }
}

async function loadOrders() {
  msgEl.textContent = "";

  if (!ensureAdminOrRedirect()) return;

  try {
    const status = statusSel?.value || "";
    const path = status
      ? `/orders/admin/orders?status=${encodeURIComponent(status)}`
      : "/orders/admin/orders";

    const orders = await apiFetch(path);
    renderOrders(orders);
  } catch (err) {
    msgEl.textContent = err.message;
  }
}

// Events
if (loadBtn) loadBtn.addEventListener("click", loadOrders);
if (statusSel) statusSel.addEventListener("change", loadOrders);

// Auto-load on page open
loadOrders();
