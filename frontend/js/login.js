import { loginUser } from "./auth.js";

const form = document.getElementById("loginForm");
const msg = document.getElementById("msg");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  msg.textContent = "";

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;

  try {
    const session = await loginUser({ username, password });
    msg.textContent = `Logged in as ${session.username} (${session.role})`;
    // go to shop
    window.location.href = "index.html";
  } catch (err) {
    msg.textContent = err.message;
  }
});
