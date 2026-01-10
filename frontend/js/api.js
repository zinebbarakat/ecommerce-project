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

  // 🔐 SAFELY attach auth headers (supports all session shapes)
  const userId =
    session?.id ??
    session?.user_id ??
    session?.userId ??
    session?.user?.id;

  const role =
    session?.role ??
    session?.user_role ??
    session?.userRole ??
    session?.user?.role;

  if (userId) headers["x-user-id"] = String(userId);
  if (role) headers["x-user-role"] = String(role);

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    cache: "no-store" // 🚫 disable browser cache
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }

  return data;
}
