import { apiFetch, getSession } from "./api.js";

const detailEl = document.getElementById("detail");
const msgEl = document.getElementById("msg");

function getProductIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

function renderProduct(p) {
  const session = getSession();
  const isAdmin = session?.role === "admin";

  detailEl.innerHTML = `
    <div class="detail">
      <div>
        <img
          class="detailImg"
          src="http://localhost:3000${p.image_url}"
          alt="${p.name}"
        />
      </div>

      <div>
        <h2>${p.name}</h2>
        <p><b>Category:</b> ${p.category}</p>
        <p><b>Price:</b> ${p.price} €</p>
        <p><b>Stock:</b> ${p.stock}</p>

        ${p.short_desc ? `<p><b>Short description:</b> ${p.short_desc}</p>` : ""}
        ${p.long_desc ? `<p><b>Details:</b> ${p.long_desc}</p>` : ""}

        ${
          isAdmin
            ? `<p class="msg" style="margin-top:10px;">Admin view: purchasing is disabled.</p>`
            : `<button id="addBtn" class="btnPrimary" type="button" style="margin-top:12px;">Add to Cart</button>
               <p id="addedMsg" style="margin-top:10px; font-weight:700;"></p>`
        }
      </div>
    </div>
  `;

  // If admin, no cart actions
  if (isAdmin) return;

  const addBtn = document.getElementById("addBtn");
  const addedMsg = document.getElementById("addedMsg");

  addBtn.addEventListener("click", async () => {
    const s = getSession();

    // Must be logged in as a user
    if (!s) {
      window.location.href = "login.html";
      return;
    }
    if (s.role === "admin") {
      alert("Admins cannot place orders.");
      return;
    }

    try {
      addBtn.disabled = true;
      addedMsg.textContent = "";

      await apiFetch("/orders/me/cart/items", {
        method: "POST",
        body: JSON.stringify({ product_id: p.id, quantity: 1 })
      });

      addedMsg.style.color = "green";
      addedMsg.textContent = "Added to cart ✅";
    } catch (err) {
      alert(err.message);
    } finally {
      addBtn.disabled = false;
    }
  });
}

async function loadProduct() {
  const id = getProductIdFromUrl();

  if (!id) {
    msgEl.textContent = "No product id provided.";
    return;
  }

  try {
    msgEl.textContent = "";
    const product = await apiFetch(`/products/${id}`);
    renderProduct(product);
  } catch (err) {
    msgEl.textContent = err.message;
  }
}

loadProduct();
