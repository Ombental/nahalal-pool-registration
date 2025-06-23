// Session check and user info display using custom session
if (!window.nahalalSession.isLoggedIn()) {
  window.location.href = "login.html";
} else {
  const user = window.nahalalSession.getSession();
  document.getElementById("user-info").innerHTML = `
    <strong>${user.name || user.email}</strong><br />
    <span>${user.email}</span><br />
    <span>Role: ${user.role}</span>
  `;
  if (user.role === "admin") {
    document.getElementById("admin-link").style.display = "block";
  }
}
