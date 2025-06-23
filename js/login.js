// Toggle between regular and admin login forms
const regularForm = document.getElementById("regular-login-form");
const adminForm = document.getElementById("admin-login-form");
const switchToAdmin = document.getElementById("switch-to-admin");
const switchToRegular = document.getElementById("switch-to-regular");

// Import shared Supabase client
// Assumes supabaseClient.js is loaded before this script

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
  document.getElementById("regular-error").textContent = "";
  const email = document.getElementById("regular-email").value;
  try {
    await window.nahalalAuth.login(email);
    window.location.href = "home.html";
  } catch (err) {
    document.getElementById("regular-error").textContent =
      err.message || "Login failed.";
  }
});

adminForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  document.getElementById("admin-error").textContent = "";
  const username = document.getElementById("admin-username").value;
  const password = document.getElementById("admin-password").value;
  try {
    await window.nahalalAuth.login(username, password);
    window.location.href = "admin.html";
  } catch (err) {
    document.getElementById("admin-error").textContent =
      err.message || "Login failed.";
  }
});
