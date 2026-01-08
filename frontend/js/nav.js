import { getSession } from "./api.js";

export function initNav() {
  const session = getSession();

  // If not logged in, hide Admin + Cart links (optional but clean)
  const adminLink = document.querySelector('a[href="admin.html"]');
  const cartLink = document.querySelector('a[href="cart.html"]');

  if (!session) {
    if (adminLink) adminLink.style.display = "none";
    if (cartLink) cartLink.style.display = "none";
  } else {
    if (adminLink && session.role !== "admin") adminLink.style.display = "none";
  }

  // Show "Logged in as ..."
  const nav = document.querySelector(".nav");
  if (nav) {
    const info = document.createElement("span");
    info.style.marginLeft = "auto";
    info.style.fontWeight = "700";
    info.style.color = "#6b7280";
    info.textContent = session ? `Logged in: ${session.username} (${session.role})` : "Not logged in";
    nav.appendChild(info);
  }
}
