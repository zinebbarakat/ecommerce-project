import { apiFetch, getSession } from "./api.js";

const detail = document.getElementById("detail");
const msg = document.getElementById("msg");

function getProductId() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

function renderProduct(p) {
  detail.innerHTML = `
    <div style="display:grid; grid-template-columns: 1fr 1.2fr; gap: 20px;">
      <div>
        <img src="http://localhost:3000${p.image_url}"
             alt="${p.name}"
             style="width:100%; height:320px; object-fit:contain;
                    background:#f8fafc; border:1px solid #e5e7eb;
                    border-radius:14px; padding:12px;">
      </div>

      <div>
        <h2>${p.name}</h2>
        <p><b>Category:</b> ${p.category}</p>
        <p><b>Price:</b> ${p.price} €</p>
        <p><b>Stock:</b> ${p.stock}</p>

        ${p.short_desc ? `<p><b>Short description:</b> ${p.short_desc}</p>` : ""}
        ${p.long_desc ? `<p><b>Details:</b> ${p.long_desc}</p>` : ""}

        <button id="addBtn" style="margin-top:12px;">Add to Cart</button>
        <p id="addedMsg" style="margin-top:10px; color:green; font-weight:700;"></p>
      </div>
    </div>
  `;

  document.getElementById("addBtn").addEventListener("click", async () => {
    const session = getSession();
    if (!session) {
      window.location.href = "login.html";
      return;
    }

    try {
      await apiFetch("/orders/me/cart/items", {
        method: "POST",
        body: JSON.stringify({ product_id: p.id, quantity: 1 })
      });
      document.getElementById("addedMsg").textContent = "Added to cart ✅";
    } catch (err) {
      alert(err.message);
    }
  });
}

async function loadProduct() {
  const id = getProductId();

  if (!id) {
    msg.textContent = "No product id provided.";
    return;
  }

  try {
    const product = await apiFetch(`/products/${id}`);
    renderProduct(product);
  } catch (err) {
    msg.textContent = err.message;
  }
}

loadProduct();
