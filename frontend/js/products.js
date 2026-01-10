import { apiFetch, getSession, clearSession } from "./api.js";

const productsDiv = document.getElementById("products");
const msg = document.getElementById("msg");
const loadBtn = document.getElementById("loadBtn");
const logoutLink = document.getElementById("logoutLink");

// category checkboxes
const catChecks = () => Array.from(document.querySelectorAll(".catCheck"));

function goToDetail(productId) {
  window.location.href = `product.html?id=${productId}`;
}

function renderProducts(products) {
  productsDiv.innerHTML = "";

  if (!products.length) {
    productsDiv.innerHTML = `<p>No products found.</p>`;
    return;
  }

  const session = getSession();
  const isAdmin = session?.role === "admin";

  for (const p of products) {
    const card = document.createElement("div");
    card.className = "product";

    card.innerHTML = `
      <img class="clickableImg" src="http://localhost:3000${p.image_url}" alt="${p.name}" />
      <h3 class="clickableTitle">${p.name}</h3>

      <p><b>Category:</b> ${p.category}</p>
      <p><b>Price:</b> ${p.price} €</p>
      <p><b>Stock:</b> ${p.stock}</p>

      ${
        isAdmin
          ? `<p class="msg" style="margin-top:10px;">Admin view: purchasing is disabled.</p>`
          : `<button class="addBtn" type="button">Add to Cart</button>`
      }
    `;

    // Click to product detail
    const img = card.querySelector(".clickableImg");
    const title = card.querySelector(".clickableTitle");
    img.style.cursor = "pointer";
    title.style.cursor = "pointer";
    img.addEventListener("click", () => goToDetail(p.id));
    title.addEventListener("click", () => goToDetail(p.id));

    // Add to cart (users only)
    const btn = card.querySelector(".addBtn");
    if (btn) {
      btn.addEventListener("click", async () => {
        const sessionNow = getSession();
        if (!sessionNow) {
          window.location.href = "login.html";
          return;
        }

        // extra safety: if admin somehow sees it, block
        if (sessionNow.role === "admin") {
          alert("Admins cannot place orders.");
          return;
        }

        try {
          await apiFetch("/orders/me/cart/items", {
            method: "POST",
            body: JSON.stringify({ product_id: p.id, quantity: 1 }),
          });
          alert("Added to cart!");
        } catch (err) {
          alert(err.message);
        }
      });
    }

    productsDiv.appendChild(card);
  }
}

async function loadProducts() {
  msg.textContent = "";

  const selected = catChecks()
    .filter((c) => c.checked)
    .map((c) => c.value);

  try {
    const path =
      selected.length > 0
        ? `/products?categories=${encodeURIComponent(selected.join(","))}`
        : "/products";

    const products = await apiFetch(path);
    renderProducts(products);
  } catch (err) {
    msg.textContent = err.message;
  }
}

logoutLink.addEventListener("click", (e) => {
  e.preventDefault();
  clearSession();
  window.location.href = "login.html";
});

loadBtn.addEventListener("click", loadProducts);
catChecks().forEach((c) => c.addEventListener("change", loadProducts));
loadProducts();
