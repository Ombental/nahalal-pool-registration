// Session check and user info display using custom session
if (!window.nahalalSession.isLoggedIn()) {
  window.location.href = "login.html";
} else {
  const user = window.nahalalSession.getSession();
  const userInfo = document.getElementById("user-info");
  if (userInfo) {
    userInfo.innerHTML = `
      <strong>${user.name || user.email}</strong><br />
      <span>${user.email}</span><br />
      <span>Role: ${user.role}</span>
    `;
  }
  const adminLink = document.getElementById("admin-link");
  if (user.role === "admin" && adminLink) {
    adminLink.style.display = "block";
  }
}
