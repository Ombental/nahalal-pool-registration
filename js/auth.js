// js/auth.js
// Depends on supabaseClient.js and session.js loaded before this script

// Helper: SHA-256 hash (browser-native)
async function sha256(str) {
  const buf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(str)
  );
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function login(email, password = null) {
  // Query user by email
  const { data: users, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .limit(1);

  if (error || !users || users.length === 0) {
    throw new Error("User not found");
  }
  const user = users[0];

  if (user.role === "admin") {
    if (!password) throw new Error("Password required for admin");
    // Compare hash (assume password is stored hashed)
    const hash = await sha256(password);
    if (user.password !== hash) throw new Error("Invalid password");
  }

  window.nahalalSession.setSession(user);
  return user;
}

function logout() {
  window.nahalalSession.clearSession();
}

function getCurrentUser() {
  return window.nahalalSession.getSession();
}

window.nahalalAuth = {
  login,
  logout,
  getCurrentUser,
};
