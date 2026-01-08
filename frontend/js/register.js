import { registerUser } from "./auth.js";

const form = document.getElementById("registerForm");
const msg = document.getElementById("msg");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  msg.textContent = "";

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;
  const role = document.getElementById("role").value;

  try {
    await registerUser({ username, password, role });
    alert("Account created! Please login.");
    window.location.href = "login.html";
  } catch (err) {
    msg.textContent = err.message;
  }
});
