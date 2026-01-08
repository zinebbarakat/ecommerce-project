// frontend/js/api.js

export const API_BASE = "http://localhost:3000/api";

export function getSession() {
  try {
    return JSON.parse(localStorage.getItem("session")) || null;
  } catch {
    return null;
  }
}

export function setSession(session) {
  localStorage.setItem("session", JSON.stringify(session));
}

export function clearSession() {
  localStorage.removeItem("session");
}

export async function apiFetch(path, options = {}) {
  const session = getSession();

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  // Required for our backend auth middleware
  if (session?.id && session?.role) {
    headers["x-user-id"] = session.id;
    headers["x-user-role"] = session.role;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers
  });

  // Try to parse JSON (even for errors)
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    const msg = (data && data.error) ? data.error : `Request failed (${res.status})`;
    throw new Error(msg);
  }

  return data;
}
