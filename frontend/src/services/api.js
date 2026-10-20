const API_BASE = (import.meta.env.VITE_API_BASE || '/api').replace(/\/$/, '');

// Multi-Room / Table session manager
export function getInitialRoomId() {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('code') || params.get('pin') || params.get('table') || params.get('roomId') || params.get('roomid') || params.get('room');
    if (roomParam) {
      const clean = roomParam.toLowerCase().replace(/[^a-z0-9_-]/g, '');
      if (clean && clean !== 'cloud-titans') {
        localStorage.setItem('hitl_room_id', clean);
        return clean;
      }
    }
    const saved = localStorage.getItem('hitl_room_id');
    if (saved === 'cloud-titans') {
      localStorage.removeItem('hitl_room_id');
      return null;
    }
    if (saved) return saved;
  }
  return null;
}

let activeRoomId = getInitialRoomId();

export function getRoomId() {
  return activeRoomId || 'default';
}

export function setRoomId(roomId) {
  const clean = (roomId || 'default').toLowerCase().replace(/[^a-z0-9_-]/g, '') || 'default';
  activeRoomId = clean;
  if (typeof window !== 'undefined') {
    if (clean === 'cloud-titans') {
      localStorage.removeItem('hitl_room_id');
    } else {
      localStorage.setItem('hitl_room_id', clean);
    }
  }
  return clean;
}

export function clearUrlParams() {
  if (typeof window !== 'undefined' && window.location.search) {
    try {
      window.history.replaceState({}, '', window.location.pathname);
    } catch {}
  }
}

// Player Identity
export function getPlayerId() {
  if (typeof window === 'undefined') return 'anon-player';
  let id = localStorage.getItem('hitl_player_id');
  if (!id) {
    id = 'p-' + Math.random().toString(36).substring(2, 9) + '-' + Date.now().toString(36);
    localStorage.setItem('hitl_player_id', id);
  }
  return id;
}

export function getPlayerName() {
  if (typeof window === 'undefined') return 'Riks';
  return localStorage.getItem('hitl_player_name') || 'Riks';
}

export function setPlayerName(name) {
  const clean = (name || '').trim() || 'Riks';
  if (typeof window !== 'undefined') {
    localStorage.setItem('hitl_player_name', clean);
  }
  return clean;
}

export async function fetchGameState(roomId = getRoomId(), playerId = getPlayerId(), playerName = getPlayerName()) {
  const params = new URLSearchParams();
  if (playerId) params.set('player_id', playerId);
  if (playerName) params.set('player_name', playerName);
  const queryStr = params.toString() ? `?${params.toString()}` : '';
  const res = await fetch(`${API_BASE}/game/${roomId}/state${queryStr}`);
  if (!res.ok) throw new Error(`Failed to fetch game state: ${res.statusText}`);
  return res.json();
}

export async function createTableGame(teamName = 'Alpha Devs', playerCount = 4) {
  const res = await fetch(`${API_BASE}/game/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ team_name: teamName, player_count: playerCount }),
  });
  if (!res.ok) throw new Error(`Failed to create table: ${res.statusText}`);
  const data = await res.json();
  if (data.room_code || data.room_id) {
    setRoomId(data.room_code || data.room_id);
  }
  return data;
}

export async function lookupTableCode(code) {
  if (!code || code.trim().length < 3) return { found: false };
  try {
    const res = await fetch(`${API_BASE}/game/lookup/${encodeURIComponent(code.trim().toUpperCase())}`);
    if (!res.ok) return { found: false };
    return res.json();
  } catch {
    return { found: false };
  }
}

export async function startGame(teamName = 'Alpha Devs', playerCount = 4, roomId = getRoomId()) {
  setRoomId(roomId);
  const res = await fetch(`${API_BASE}/game/${getRoomId()}/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ team_name: teamName, player_count: playerCount, room_id: getRoomId() }),
  });
  if (!res.ok) throw new Error(`Failed to start game: ${res.statusText}`);
  return res.json();
}

export async function submitAction({
  action_type,
  custom_prompt_text = null,
  selected_rule_id = null,
  is_timeout = false,
  time_spent_seconds = 0,
}, roomId = getRoomId()) {
  const res = await fetch(`${API_BASE}/game/${roomId}/action`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action_type,
      custom_prompt_text,
      selected_rule_id,
      is_timeout,
      time_spent_seconds,
    }),
  });
  if (!res.ok) throw new Error(`Failed to submit action: ${res.statusText}`);
  return res.json();
}

export async function acknowledgePull(physicalTowerFell = false, roomId = getRoomId()) {
  const res = await fetch(`${API_BASE}/game/${roomId}/acknowledge-pull`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      acknowledged: true,
      physical_tower_fell: physicalTowerFell,
    }),
  });
  if (!res.ok) throw new Error(`Failed to acknowledge pull: ${res.statusText}`);
  return res.json();
}

export async function reportTowerToppled(roomId = getRoomId()) {
  const res = await fetch(`${API_BASE}/game/${roomId}/tower-toppled`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error(`Failed to report toppled tower: ${res.statusText}`);
  return res.json();
}

export async function nextStage(roomId = getRoomId()) {
  const res = await fetch(`${API_BASE}/game/${roomId}/next-stage`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error(`Failed to advance stage: ${res.statusText}`);
  return res.json();
}

export async function resetGame(roomId = getRoomId()) {
  const res = await fetch(`${API_BASE}/game/${roomId}/reset`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error(`Failed to reset game: ${res.statusText}`);
  return res.json();
}

export async function retryStage(roomId = getRoomId()) {
  const res = await fetch(`${API_BASE}/game/${roomId}/retry-stage`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error(`Failed to retry stage: ${res.statusText}`);
  return res.json();
}

export async function joinPlayer(playerId = getPlayerId(), playerName = getPlayerName(), roomId = getRoomId()) {
  const res = await fetch(`${API_BASE}/game/${roomId}/join-player`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ player_id: playerId, player_name: playerName }),
  });
  if (!res.ok) throw new Error(`Failed to register player: ${res.statusText}`);
  return res.json();
}

export async function submitDraft({
  draft_type,
  custom_prompt_text = null,
  selected_rule_id = null,
  selected_suggestion_id = null,
}, roomId = getRoomId(), playerId = getPlayerId(), playerName = getPlayerName()) {
  const chosenRuleOrSuggestion = selected_suggestion_id || selected_rule_id;
  const res = await fetch(`${API_BASE}/game/${roomId}/draft`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      player_id: playerId,
      player_name: playerName,
      draft_type,
      custom_prompt_text,
      selected_rule_id: chosenRuleOrSuggestion,
      selected_suggestion_id: chosenRuleOrSuggestion,
    }),
  });
  if (!res.ok) throw new Error(`Failed to submit draft: ${res.statusText}`);
  return res.json();
}

export async function submitVote({
  action_type,
  time_spent_seconds = 0,
}, roomId = getRoomId(), playerId = getPlayerId(), playerName = getPlayerName()) {
  const res = await fetch(`${API_BASE}/game/${roomId}/vote`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      player_id: playerId,
      player_name: playerName,
      action_type,
      time_spent_seconds,
    }),
  });
  if (!res.ok) throw new Error(`Failed to submit vote: ${res.statusText}`);
  return res.json();
}

export async function resolveTimeout(roomId = getRoomId()) {
  const res = await fetch(`${API_BASE}/game/${roomId}/resolve-timeout`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error(`Failed to resolve timeout: ${res.statusText}`);
  return res.json();
}

export async function commitDecision(roomId = getRoomId()) {
  const res = await fetch(`${API_BASE}/game/${roomId}/commit-decision`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error(`Failed to commit decision: ${res.statusText}`);
  return res.json();
}

export async function revealHint(stageId, roomId = getRoomId()) {
  const res = await fetch(`${API_BASE}/game/${roomId}/reveal-hint`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ stage_id: stageId }),
  });
  if (!res.ok) throw new Error(`Failed to reveal hint: ${res.statusText}`);
  return res.json();
}

export async function fetchLeaderboard() {
  const res = await fetch(`${API_BASE}/leaderboard`);
  if (!res.ok) throw new Error(`Failed to fetch leaderboard: ${res.statusText}`);
  return res.json();
}

export async function fetchBroadcast() {
  const res = await fetch(`${API_BASE}/admin/broadcast`);
  if (!res.ok) return { active: false, message: '' };
  return res.json();
}

export async function fetchGlobalTheme() {
  try {
    const res = await fetch(`${API_BASE}/admin/theme`);
    if (!res.ok) return { theme: 'minecraft', mode: 'dark' };
    return res.json();
  } catch {
    return { theme: 'minecraft', mode: 'dark' };
  }
}

// -------------------------------------------------------------
// Sprint Delivery Mode Endpoints (Game 2)
// -------------------------------------------------------------
export async function fetchSprintState(roomId = getRoomId()) {
  const res = await fetch(`${API_BASE}/sprint/${roomId}/state`);
  if (!res.ok) throw new Error(`Failed to fetch sprint state: ${res.statusText}`);
  return res.json();
}

export async function startSprintGame(arg1, arg2, arg3, arg4) {
  // Supports both startSprintGame(roomId, teamName) and startSprintGame(teamName, playerCount, roomId, playerName)
  let roomId, teamName, playerCount, playerName;
  if (typeof arg2 === 'number') {
    teamName = arg1 || 'Sprint Squad';
    playerCount = arg2;
    roomId = arg3 || getRoomId();
    playerName = arg4 || getPlayerName();
  } else {
    roomId = arg1 || getRoomId();
    teamName = arg2 || 'Sprint Squad';
    playerCount = 4;
    playerName = getPlayerName();
  }
  const res = await fetch(`${API_BASE}/sprint/${roomId}/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ team_name: teamName, room_id: roomId, player_count: playerCount }),
  });
  if (!res.ok) throw new Error(`Failed to start sprint game: ${res.statusText}`);
  return res.json();
}

export async function submitSprintAcceptAsIs(roomId = getRoomId()) {
  const res = await fetch(`${API_BASE}/sprint/${roomId}/accept-as-is`, {
    method: 'POST',
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || `Failed to accept as-is: ${res.statusText}`);
  }
  return res.json();
}

export async function submitSprintManualOverride(roomId = getRoomId(), playerId = getPlayerId(), playerName = getPlayerName()) {
  const res = await fetch(`${API_BASE}/sprint/${roomId}/manual-override`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ player_id: playerId, player_name: playerName }),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || `Failed manual override: ${res.statusText}`);
  }
  return res.json();
}

export async function submitSprintSteerTurn(roomId = getRoomId(), userPrompt = '', playerId = getPlayerId(), playerName = getPlayerName()) {
  const res = await fetch(`${API_BASE}/sprint/${roomId}/steer-turn`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ player_id: playerId, player_name: playerName, user_prompt: userPrompt }),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || `Failed steer turn: ${res.statusText}`);
  }
  return res.json();
}

export async function commitSprintSteeredCode(roomId = getRoomId()) {
  const res = await fetch(`${API_BASE}/sprint/${roomId}/commit-steer`, {
    method: 'POST',
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || `Failed to commit steered code: ${res.statusText}`);
  }
  return res.json();
}

export async function submitSprintGuardrail(roomId = getRoomId(), ruleId = 'rule_1', ruleTitle = 'Architectural Guardrail') {
  const res = await fetch(`${API_BASE}/sprint/${roomId}/guardrail`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rule_id: ruleId, rule_title: ruleTitle }),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || `Failed to enforce guardrail: ${res.statusText}`);
  }
  return res.json();
}

export async function advanceSprintStage(roomId = getRoomId()) {
  const res = await fetch(`${API_BASE}/sprint/${roomId}/advance`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error(`Failed to advance sprint stage: ${res.statusText}`);
  return res.json();
}

export async function resetSprintGame(roomId = getRoomId()) {
  const res = await fetch(`${API_BASE}/sprint/${roomId}/reset`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error(`Failed to reset sprint game: ${res.statusText}`);
  return res.json();
}


