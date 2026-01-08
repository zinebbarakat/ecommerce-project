import { apiFetch, setSession, clearSession, getSession } from "./api.js";

export async function registerUser(payload) {
  const data = await apiFetch("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload)
  });
  return data;
}

export async function loginUser(payload) {
  const session = await apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload)
  });
  setSession(session);
  return session;
}

export function logout() {
  clearSession();
}

export function requireLogin() {
  const s = getSession();
  if (!s) {
    window.location.href = "login.html";
  }
  return s;
}

export function requireAdmin() {
  const s = requireLogin();
  if (s.role !== "admin") {
    alert("Admin only");
    window.location.href = "index.html";
  }
  return s;
}
