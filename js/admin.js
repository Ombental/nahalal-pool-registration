// Session and admin check using custom session
if (!window.nahalalSession.isLoggedIn()) {
  window.location.href = "login.html";
} else if (!window.nahalalSession.isAdmin()) {
  window.location.href = "home.html";
} else {
  const user = window.nahalalSession.getSession();
  // Admin logic can use user info here
}
