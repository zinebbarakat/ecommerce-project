import { loginUser } from "./auth.js";

const form = document.getElementById("loginForm");
const msg = document.getElementById("msg");

// Safety check (in case script loads on wrong page)
if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    msg.textContent = "";

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;

    try {
      // Authenticate user and store session in localStorage
      const session = await loginUser({ username, password });

      // Redirect user based on role
      if (session.role === "admin") {
        window.location.href = "admin.html";
      } else {
        window.location.href = "index.html";
      }
    } catch (err) {
      // Display backend error (invalid credentials, etc.)
      msg.textContent = err.message;
    }
  });
}
