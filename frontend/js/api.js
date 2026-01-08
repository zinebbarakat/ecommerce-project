export const API_BASE = "http://localhost:3000/api";

export function getSession() {
  try {
    return JSON.parse(localStorage.getItem("session"));
  } catch {
    return null;
  }
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

  // Attach session headers if logged in (your backend expects these)
  if (session?.id) headers["x-user-id"] = String(session.id);
  if (session?.role) headers["x-user-role"] = String(session.role);

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    cache: "no-store" // IMPORTANT: avoid 304 cache issues
  });

  // Handle non-JSON safely
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }

  return data;
}
