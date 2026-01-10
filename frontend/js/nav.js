import { getSession, clearSession } from "./api.js";

export function initNav() {
  const session = getSession();

  const logoutLink = document.getElementById("logoutLink");

  // Handle logout
  if (logoutLink) {
    logoutLink.addEventListener("click", (e) => {
      e.preventDefault();
      clearSession();
      window.location.href = "login.html";
    });
  }

  // If not logged in → hide protected links
  if (!session) {
    hideLink("cart.html");
    hideLink("orders.html");
    hideLink("admin.html");
    return;
  }

  // Show who is logged in
  let info = document.getElementById("navUserInfo");
  if (!info) {
    info = document.createElement("span");
    info.id = "navUserInfo";
    info.style.marginLeft = "auto";
    info.textContent = `Logged in as ${session.username} (${session.role})`;

    const nav = document.querySelector(".nav");
    if (nav) nav.appendChild(info);
  }

  // Role-based visibility
  if (session.role === "admin") {
    // Admin: NO cart / orders
    hideLink("cart.html");
    hideLink("orders.html");
  } else {
    // User: NO admin
    hideLink("admin.html");
  }
}

function hideLink(href) {
  document.querySelectorAll(`a[href="${href}"]`).forEach((a) => {
    a.style.display = "none";
  });
}
