import { apiFetch, getSession, clearSession } from "./api.js";

const productsDiv = document.getElementById("products");
const msg = document.getElementById("msg");
const loadBtn = document.getElementById("loadBtn");
const clearBtn = document.getElementById("clearBtn");
const resultsCount = document.getElementById("resultsCount");
const logoutLink = document.getElementById("logoutLink");

// category checkboxes
const catChecks = () => Array.from(document.querySelectorAll(".catCheck"));

function goToDetail(productId) {
  window.location.href = `product.html?id=${productId}`;
}

function setCount(n) {
  if (resultsCount) resultsCount.textContent = String(n);
}

function renderProducts(products) {
  productsDiv.innerHTML = "";
  setCount(products.length);

  if (!products.length) {
    productsDiv.innerHTML = `<p>No products found.</p>`;
    return;
  }

  const session = getSession();
  const isAdmin = session?.role === "admin";

  for (const p of products) {
    const card = document.createElement("div");
    card.className = "product";

    // Make the whole card clickable (details), but not the button
    card.setAttribute("role", "button");
    card.setAttribute("tabindex", "0");
    card.setAttribute("aria-label", `View details for ${p.name}`);

    card.innerHTML = `
      <img src="http://localhost:3000${p.image_url}" alt="${p.name}" />
      <h3>${p.name}</h3>

      <p><b>Category:</b> ${p.category}</p>
      <p><b>Price:</b> ${p.price} €</p>
      <p><b>Stock:</b> ${p.stock}</p>

      ${
        isAdmin
          ? `<p class="msg" style="margin-top:10px;">Admin view: purchasing is disabled.</p>`
          : `<button class="addBtn" type="button">Add to Cart</button>`
      }
    `;

    // Card click -> detail
    card.addEventListener("click", () => goToDetail(p.id));

    // Keyboard accessibility (Enter / Space)
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        goToDetail(p.id);
      }
    });

    // Add to cart (users only) - stop click bubbling to card
    const btn = card.querySelector(".addBtn");
    if (btn) {
      btn.addEventListener("click", async (e) => {
        e.stopPropagation();

        const sessionNow = getSession();
        if (!sessionNow) {
          window.location.href = "login.html";
          return;
        }

        // extra safety
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
    setCount(0);
  }
}

// Clear filters -> show all products
if (clearBtn) {
  clearBtn.addEventListener("click", () => {
    catChecks().forEach((c) => (c.checked = false));
    loadProducts();
  });
}

logoutLink.addEventListener("click", (e) => {
  e.preventDefault();
  clearSession();
  window.location.href = "login.html";
});

if (loadBtn) loadBtn.addEventListener("click", loadProducts);
catChecks().forEach((c) => c.addEventListener("change", loadProducts));

loadProducts();
