// Base URL of the backend API
// Example: apiFetch("/products") -> http://localhost:3000/api/products
export const API_BASE = "http://localhost:3000/api";

// Read the current session from localStorage.
// Session is created after login/register, example:
// { id: 1, username: "zizo", role: "user" }
export function getSession() {
  try {
    return JSON.parse(localStorage.getItem("session"));
  } catch {
    return null;
  }
}

// Logout helper: remove session from localStorage
export function clearSession() {
  localStorage.removeItem("session");
}

// Wrapper around fetch() used everywhere in the frontend.
// - Adds JSON headers
// - Adds auth headers (x-user-id, x-user-role) if logged in
// - Parses JSON response
// - Throws clean error messages from the backend
export async function apiFetch(path, options = {}) {
  const session = getSession();

  const headers = {
    ...(options.headers || {})
  };

  // Only set JSON header if we are sending a body (POST/PUT)
  if (options.body) {
    headers["Content-Type"] = "application/json";
  }

  // Attach auth headers (backend reads these in requireAuth middleware)
  if (session?.id) headers["x-user-id"] = String(session.id);
  if (session?.role) headers["x-user-role"] = String(session.role);

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    cache: "no-store"
  });

  // Most endpoints return JSON. If parsing fails, fallback to empty object.
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    // Backend usually returns: { error: "..." }
    throw new Error(data.error || `Request failed (${res.status})`);
  }

  return data;
}
