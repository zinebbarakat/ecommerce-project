import { apiFetch } from "./api.js";

export async function registerUser({ username, password, role }) {
  return apiFetch("/auth/register", {
    method: "POST",
    body: JSON.stringify({ username, password, role })
  });
}

export async function loginUser({ username, password }) {
  const data = await apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password })
  });

  // ✅ store session in localStorage (used by apiFetch headers)
  localStorage.setItem("session", JSON.stringify(data));
  return data;
}
