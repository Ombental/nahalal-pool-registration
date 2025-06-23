// Placeholder: Fetch and display summary stats from Supabase
window.addEventListener("DOMContentLoaded", () => {
  // TODO: Fetch counts from Supabase
  // Example placeholder:
  document.getElementById("summary").innerHTML = `
    <strong>Summary:</strong> <br />
    <span>Total Users: 42</span><br />
    <span>Total Time Slots: 12</span><br />
    <span>Total Registrations: 87</span>
  `;
});

// Session and admin check using custom session
if (!window.nahalalSession.isLoggedIn()) {
  window.location.href = "login.html";
} else if (!window.nahalalSession.isAdmin()) {
  window.location.href = "home.html";
} else {
  const user = window.nahalalSession.getSession();
  // Admin logic can use user info here
}
