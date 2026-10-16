const API_BASE = (import.meta.env.VITE_API_BASE || '/api').replace(/\/$/, '');
const ADMIN_BASE = `${API_BASE}/admin`;

export function getAdminKey() {
  if (typeof window !== 'undefined') {
    // Fix H1: Admin key stored in sessionStorage only.
    // sessionStorage is cleared when the tab/browser closes — safer than localStorage
    // on shared devices (corporate workshop laptops).
    return sessionStorage.getItem('hitl_admin_key') || '';
  }
  return '';
}

export function setAdminKey(key) {
  if (typeof window !== 'undefined') {
    const cleanKey = (key || '').trim();
    // Fix H1: ONLY write to sessionStorage — never persist admin key to disk via localStorage
    sessionStorage.setItem('hitl_admin_key', cleanKey);
  }
}

export function clearAdminKey() {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('hitl_admin_key');
    // Belt-and-suspenders: also clear any localStorage remnant from previous app versions
    localStorage.removeItem('hitl_admin_key');
  }
}

function getAuthHeaders(extra = {}) {
  const key = getAdminKey();
  const headers = { ...extra };
  if (key) {
    headers['X-Admin-Key'] = key;
  }
  return headers;
}

export async function verifyAdminPasscode(key) {
  const cleanKey = (key || '').trim();
  const res = await fetch(`${ADMIN_BASE}/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key: cleanKey }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || 'Invalid Game Master Passcode.');
  }
  setAdminKey(cleanKey);
  return res.json();
}

export async function fetchAllRooms() {
  const res = await fetch(`${ADMIN_BASE}/rooms`, {
    headers: getAuthHeaders(),
  });
  if (res.status === 401) {
    throw new Error('401_UNAUTHORIZED');
  }
  if (!res.ok) throw new Error(`Failed to fetch rooms: ${res.statusText}`);
  return res.json();
}

export async function sendRoomAction(roomId, action, delta = 0, pulls = 1) {
  const res = await fetch(`${ADMIN_BASE}/rooms/${encodeURIComponent(roomId)}/action`, {
    method: 'POST',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ action, delta, pulls }),
  });
  if (res.status === 401) {
    throw new Error('401_UNAUTHORIZED');
  }
  if (!res.ok) throw new Error(`Action '${action}' failed: ${res.statusText}`);
  return res.json();
}

export async function broadcastAnnouncement(message) {
  const res = await fetch(`${ADMIN_BASE}/global/broadcast`, {
    method: 'POST',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ message }),
  });
  if (res.status === 401) {
    throw new Error('401_UNAUTHORIZED');
  }
  if (!res.ok) throw new Error(`Failed to broadcast: ${res.statusText}`);
  return res.json();
}

export async function clearBroadcast() {
  const res = await fetch(`${ADMIN_BASE}/global/clear-broadcast`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  if (res.status === 401) {
    throw new Error('401_UNAUTHORIZED');
  }
  if (!res.ok) throw new Error(`Failed to clear broadcast: ${res.statusText}`);
  return res.json();
}

export async function resetAllRooms() {
  const res = await fetch(`${ADMIN_BASE}/global/reset-all`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  if (res.status === 401) {
    throw new Error('401_UNAUTHORIZED');
  }
  if (!res.ok) throw new Error(`Failed to reset all rooms: ${res.statusText}`);
  return res.json();
}

export async function fetchStagesCheatSheet() {
  const res = await fetch(`${ADMIN_BASE}/stages`, {
    headers: getAuthHeaders(),
  });
  if (res.status === 401) {
    throw new Error('401_UNAUTHORIZED');
  }
  if (!res.ok) throw new Error(`Failed to fetch stages: ${res.statusText}`);
  return res.json();
}

export async function fetchAnalytics() {
  const res = await fetch(`${ADMIN_BASE}/analytics`, {
    headers: getAuthHeaders(),
  });
  if (res.status === 401) {
    throw new Error('401_UNAUTHORIZED');
  }
  if (!res.ok) throw new Error(`Failed to fetch analytics: ${res.statusText}`);
  return res.json();
}

export async function toggleGlobalTimer() {
  const res = await fetch(`${ADMIN_BASE}/global/toggle-pause-all`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  if (res.status === 401) {
    throw new Error('401_UNAUTHORIZED');
  }
  if (!res.ok) throw new Error(`Failed to toggle global timer: ${res.statusText}`);
  return res.json();
}

export async function pauseAllRooms() {
  const res = await fetch(`${ADMIN_BASE}/global/pause-all`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  if (res.status === 401) {
    throw new Error('401_UNAUTHORIZED');
  }
  if (!res.ok) throw new Error(`Failed to pause all rooms: ${res.statusText}`);
  return res.json();
}

export async function resumeAllRooms() {
  const res = await fetch(`${ADMIN_BASE}/global/resume-all`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  if (res.status === 401) {
    throw new Error('401_UNAUTHORIZED');
  }
  if (!res.ok) throw new Error(`Failed to resume all rooms: ${res.statusText}`);
  return res.json();
}

export async function toggleRoomTimer(roomId) {
  return sendRoomAction(roomId, 'toggle_pause');
}

export async function fetchGlobalTheme() {
  const res = await fetch(`${ADMIN_BASE}/theme`);
  if (!res.ok) return { theme: 'minecraft', mode: 'dark' };
  return res.json();
}

export async function setGlobalTheme(theme, mode = 'dark') {
  const res = await fetch(`${ADMIN_BASE}/global/theme`, {
    method: 'POST',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ theme, mode }),
  });
  if (res.status === 401) {
    throw new Error('401_UNAUTHORIZED');
  }
  if (!res.ok) throw new Error(`Failed to update global theme: ${res.statusText}`);
  return res.json();
}
