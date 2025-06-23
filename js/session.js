const SESSION_KEY = "nahalal_user";
const SESSION_TIMEOUT_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function setSession(user) {
  const session = {
    user,
    createdAt: Date.now(),
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

function getSession() {
  const sessionStr = localStorage.getItem(SESSION_KEY);
  if (!sessionStr) return null;
  try {
    const session = JSON.parse(sessionStr);
    if (!session.user || !session.createdAt) {
      clearSession();
      return null;
    }
    if (Date.now() - session.createdAt > SESSION_TIMEOUT_MS) {
      clearSession();
      return null;
    }
    // Sliding window: update timestamp on access
    session.createdAt = Date.now();
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return session.user;
  } catch {
    clearSession();
    return null;
  }
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

function isLoggedIn() {
  return !!getSession();
}

function isAdmin() {
  const user = getSession();
  return user && user.role === "admin";
}

// Expose as global for browser usage
window.nahalalSession = {
  setSession,
  getSession,
  clearSession,
  isLoggedIn,
  isAdmin,
};
