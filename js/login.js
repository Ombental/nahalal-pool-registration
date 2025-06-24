// Toggle between regular and admin login forms
const regularForm = document.getElementById("regular-login-form");
const adminForm = document.getElementById("admin-login-form");
const switchToAdmin = document.getElementById("switch-to-admin");
const switchToRegular = document.getElementById("switch-to-regular");

// Import shared Supabase client
// Assumes supabaseClient.js is loaded before this script

// i18n: Hebrew translations
const i18n = {
  login: "כניסה",
  email: "אימייל",
  loginAsRegular: "כניסה כמשתמש רגיל",
  error: (msg) => `שגיאה: ${msg}`,
};

switchToAdmin.addEventListener("click", () => {
  regularForm.style.display = "none";
  adminForm.style.display = "block";
  switchToAdmin.style.display = "none";
  switchToRegular.style.display = "inline";
});

switchToRegular.addEventListener("click", () => {
  adminForm.style.display = "none";
  regularForm.style.display = "block";
  switchToRegular.style.display = "none";
  switchToAdmin.style.display = "inline";
});

// Placeholder: Supabase Auth integration for both forms
regularForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  setError("regular-error", "");
  const email = document.getElementById("regular-email").value;
  try {
    await window.nahalalAuth.login(email);
    window.location.href = "home.html";
  } catch (err) {
    setError("regular-error", err.message || "Login failed.");
  }
});

adminForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  setError("admin-error", "");
  const username = document.getElementById("admin-username").value;
  const password = document.getElementById("admin-password").value;
  try {
    await window.nahalalAuth.login(username, password);
    window.location.href = "admin.html";
  } catch (err) {
    setError("admin-error", err.message || "Login failed.");
  }
});

function setError(id, msg) {
  window.nahalalUtils.setFeedback(document.getElementById(id), msg, true);
}
