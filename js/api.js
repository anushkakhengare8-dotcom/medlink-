// ==========================================================================
// MedLink — api.js
// Shared helper for talking to the backend, storing the logged-in user's
// session, and guarding dashboard pages that require login.
// Load this BEFORE layout.js and any page-specific script.
// ==========================================================================

const API_BASE_URL = 'http://localhost:4000/api';

function getToken() {
  return localStorage.getItem('medlink-token');
}

function getUser() {
  const raw = localStorage.getItem('medlink-user');
  return raw ? JSON.parse(raw) : null;
}

function setSession(token, user) {
  localStorage.setItem('medlink-token', token);
  localStorage.setItem('medlink-user', JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem('medlink-token');
  localStorage.removeItem('medlink-user');
}

function logout() {
  clearSession();
  window.location.href = 'index.html';
}

// Call this at the top of every dashboard page — sends anyone without a
// valid session back to the login page instead of showing them an empty shell.
function requireAuth() {
  if (!getToken()) {
    window.location.href = 'index.html';
  }
}

// Wraps fetch(): adds the API base URL, JSON headers, the auth token if one
// exists, and throws a readable Error using the server's own message on failure.
async function apiRequest(path, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  } catch (err) {
    throw new Error('Could not reach the server. Make sure the backend is running on port 4000.');
  }

  if (response.status === 204) {
    return null;
  }

  let data = null;
  try {
    data = await response.json();
  } catch (err) {
    // No JSON body — fine for some responses.
  }

  if (!response.ok) {
    throw new Error((data && data.error) || `Request failed (${response.status})`);
  }

  return data;
}
