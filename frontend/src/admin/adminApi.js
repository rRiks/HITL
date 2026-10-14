const API_BASE = (import.meta.env.VITE_API_BASE || '/api').replace(/\/$/, '');
const ADMIN_BASE = `${API_BASE}/admin`;

export async function fetchAllRooms() {
  const res = await fetch(`${ADMIN_BASE}/rooms`);
  if (!res.ok) throw new Error(`Failed to fetch rooms: ${res.statusText}`);
  return res.json();
}

export async function sendRoomAction(roomId, action, delta = 0, pulls = 1) {
  const res = await fetch(`${ADMIN_BASE}/rooms/${encodeURIComponent(roomId)}/action`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, delta, pulls }),
  });
  if (!res.ok) throw new Error(`Action '${action}' failed: ${res.statusText}`);
  return res.json();
}

export async function broadcastAnnouncement(message) {
  const res = await fetch(`${ADMIN_BASE}/global/broadcast`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  });
  if (!res.ok) throw new Error(`Failed to broadcast: ${res.statusText}`);
  return res.json();
}

export async function clearBroadcast() {
  const res = await fetch(`${ADMIN_BASE}/global/clear-broadcast`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error(`Failed to clear broadcast: ${res.statusText}`);
  return res.json();
}

export async function resetAllRooms() {
  const res = await fetch(`${ADMIN_BASE}/global/reset-all`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error(`Failed to reset all rooms: ${res.statusText}`);
  return res.json();
}

export async function fetchStagesCheatSheet() {
  const res = await fetch(`${ADMIN_BASE}/stages`);
  if (!res.ok) throw new Error(`Failed to fetch stages: ${res.statusText}`);
  return res.json();
}

export async function fetchAnalytics() {
  const res = await fetch(`${ADMIN_BASE}/analytics`);
  if (!res.ok) throw new Error(`Failed to fetch analytics: ${res.statusText}`);
  return res.json();
}

export async function toggleGlobalTimer() {
  const res = await fetch(`${ADMIN_BASE}/global/toggle-pause-all`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error(`Failed to toggle global timer: ${res.statusText}`);
  return res.json();
}

export async function pauseAllRooms() {
  const res = await fetch(`${ADMIN_BASE}/global/pause-all`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error(`Failed to pause all rooms: ${res.statusText}`);
  return res.json();
}

export async function resumeAllRooms() {
  const res = await fetch(`${ADMIN_BASE}/global/resume-all`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error(`Failed to resume all rooms: ${res.statusText}`);
  return res.json();
}

export async function toggleRoomTimer(roomId) {
  return sendRoomAction(roomId, 'toggle_pause');
}
