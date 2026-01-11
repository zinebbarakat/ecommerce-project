import { getSession, clearSession } from "./api.js";

// Controls the header navigation:
// - Shows/hides links based on user role (data-auth="user" / "admin")
// - Switches Login <-> Logout
// - Displays "Logged in as: ..." when session exists
export function initNav() {
  const session = getSession();

  const authLinks = document.querySelectorAll("[data-auth]");
  const oldLoginLogout = document.getElementById("logoutLink");
  const headerInner = document.querySelector(".headerInner") || document.body;

  // Create/reuse a small text element to show the logged in user
  let who = document.getElementById("whoAmI");
  if (!who) {
    who = document.createElement("span");
    who.id = "whoAmI";
    who.className = "whoAmI"; // style in CSS (cleaner than inline styles)
    headerInner.appendChild(who);
  }

  // Hide role-based links by default
  authLinks.forEach((link) => (link.style.display = "none"));

  // Safety: if logoutLink doesn't exist on a page, stop here
  if (!oldLoginLogout) {
    if (!session) who.textContent = "";
    else who.textContent = `Logged in as: ${session.username} (${session.role})`;
    return;
  }

  // Replace logoutLink with a fresh copy (removes old click listeners)
  const loginLogout = oldLoginLogout.cloneNode(true);
  oldLoginLogout.parentNode.replaceChild(loginLogout, oldLoginLogout);

  // If NOT logged in
  if (!session) {
    who.textContent = "";
    loginLogout.textContent = "Login";
    loginLogout.setAttribute("href", "login.html");
    return;
  }

  // Logged in: show links that match role
  authLinks.forEach((link) => {
    const role = link.getAttribute("data-auth");
    if (role === session.role) link.style.display = "inline-block";
  });

  // Show user info
  who.textContent = `Logged in as: ${session.username} (${session.role})`;

  // Switch Login -> Logout
  loginLogout.textContent = "Logout";
  loginLogout.setAttribute("href", "#");

  loginLogout.addEventListener("click", (e) => {
    e.preventDefault();
    clearSession();
    window.location.href = "login.html";
  });
}
