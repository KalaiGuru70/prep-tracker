const BASE_URL = "http://localhost:8000";

// Generic fetch wrapper — handles errors consistently
async function request(endpoint, options = {}) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }
  return res.json();
}

// ---- Entries ----
export function getEntries() {
  return request("/entries/");
}

export function createEntry(entry) {
  return request("/entries/", {
    method: "POST",
    body: JSON.stringify(entry),
  });
}

export function checkToday() {
  return request("/entries/today");
}

export function deleteEntry(id) {
  return request(`/entries/${id}`, { method: "DELETE" });
}

// ---- Stats ----
export function getStats() {
  return request("/entries/stats/summary");
}