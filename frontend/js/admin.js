import { apiFetch, getSession } from "./api.js";

const msg = document.getElementById("msg");
const adminProductsDiv = document.getElementById("adminProducts");

const form = document.getElementById("productForm");
const productIdEl = document.getElementById("productId");
const nameEl = document.getElementById("name");
const categoryEl = document.getElementById("category");
const priceEl = document.getElementById("price");
const stockEl = document.getElementById("stock");
const imageUrlEl = document.getElementById("image_url");
const shortDescEl = document.getElementById("short_desc");
const longDescEl = document.getElementById("long_desc");
const clearBtn = document.getElementById("clearBtn");

function requireAdmin() {
  const s = getSession();

  if (!s) {
    window.location.href = "login.html";
    throw new Error("Not logged in");
  }

  if (s.role !== "admin") {
    alert("Admin only");
    window.location.href = "index.html";
    throw new Error("Admin only");
  }

  return s;
}

function clearForm() {
  productIdEl.value = "";
  nameEl.value = "";
  categoryEl.value = "";
  priceEl.value = "";
  stockEl.value = "";
  imageUrlEl.value = "";
  shortDescEl.value = "";
  longDescEl.value = "";
}

function fillForm(p) {
  productIdEl.value = p.id;
  nameEl.value = p.name;
  categoryEl.value = p.category;
  priceEl.value = p.price;
  stockEl.value = p.stock;
  imageUrlEl.value = p.image_url;
  shortDescEl.value = p.short_desc || "";
  longDescEl.value = p.long_desc || "";
}

function render(products) {
  adminProductsDiv.innerHTML = "";

  if (!products.length) {
    adminProductsDiv.innerHTML = "<p>No products yet.</p>";
    return;
  }

  for (const p of products) {
    const card = document.createElement("div");
    card.className = "product";

    card.innerHTML = `
      <img src="http://localhost:3000${p.image_url}" alt="${p.name}" />
      <h3>${p.name}</h3>
      <p><b>Category:</b> ${p.category}</p>
      <p><b>Price:</b> ${p.price} €</p>
      <p><b>Stock:</b> ${p.stock}</p>

      <div class="actions" style="justify-content:flex-start;">
        <button class="editBtn" type="button">Edit</button>
        <button class="deleteBtn btnDanger" type="button">Delete</button>
      </div>
    `;

    // Edit: put product data into the form
    card.querySelector(".editBtn").addEventListener("click", () => {
      fillForm(p);
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    // Delete: confirm, then call API
    card.querySelector(".deleteBtn").addEventListener("click", async () => {
      msg.textContent = "";
      if (!confirm(`Delete "${p.name}"?`)) return;

      try {
        requireAdmin();
        await apiFetch(`/products/${p.id}`, { method: "DELETE" });
        await loadProducts();
        clearForm();
      } catch (err) {
        msg.textContent = err.message;
      }
    });

    adminProductsDiv.appendChild(card);
  }
}

async function loadProducts() {
  msg.textContent = "";

  try {
    requireAdmin();
    const products = await apiFetch("/products");
    render(products);
  } catch (err) {
    msg.textContent = err.message;
  }
}

// Create / Update product
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  msg.textContent = "";

  try {
    requireAdmin();

    const payload = {
      name: nameEl.value.trim(),
      category: categoryEl.value.trim(),
      price: Number(priceEl.value),
      stock: Number(stockEl.value),
      image_url: imageUrlEl.value.trim(),
      short_desc: shortDescEl.value.trim(),
      long_desc: longDescEl.value.trim()
    };

    // Basic validation (avoid accidental empty numbers)
    if (!payload.name || !payload.category || !payload.image_url) {
      throw new Error("Name, category and image URL are required.");
    }
    if (!Number.isFinite(payload.price) || payload.price < 0) {
      throw new Error("Price must be a valid number (>= 0).");
    }
    if (!Number.isFinite(payload.stock) || payload.stock < 0) {
      throw new Error("Stock must be a valid number (>= 0).");
    }

    const id = productIdEl.value;

    if (!id) {
      // Create
      await apiFetch("/products", {
        method: "POST",
        body: JSON.stringify(payload)
      });
    } else {
      // Update
      await apiFetch(`/products/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload)
      });
    }

    await loadProducts();
    clearForm();
  } catch (err) {
    msg.textContent = err.message;
  }
});

clearBtn.addEventListener("click", clearForm);

// Start page
loadProducts();
