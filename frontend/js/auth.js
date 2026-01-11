import { apiFetch } from "./api.js";

// Register a new user
export async function registerUser({ username, password, role }) {
  return apiFetch("/auth/register", {
    method: "POST",
    body: JSON.stringify({ username, password, role })
  });
}

// Login user and store session
export async function loginUser({ username, password }) {
  const data = await apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password })
  });

  // Save session for authenticated requests
  localStorage.setItem("session", JSON.stringify(data));
  return data;
}
