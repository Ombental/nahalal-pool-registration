// Add dynamic name fields
const addNameBtn = document.getElementById("add-name-btn");
const namesList = document.getElementById("names-list");

addNameBtn.addEventListener("click", () => {
  const input = document.createElement("input");
  input.type = "text";
  input.className = "name-input";
  input.placeholder = "Name";
  namesList.appendChild(input);
});

// Placeholder: Load available slots from Supabase
const slotSelect = document.getElementById("slot-select");
window.addEventListener("DOMContentLoaded", () => {
  // TODO: Fetch available slots from Supabase and populate slotSelect
});

// Placeholder: Handle form submission
const form = document.getElementById("registration-form");
const feedback = document.getElementById("form-feedback");
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  feedback.textContent = "";
  feedback.className = "feedback";
  // TODO: Gather slot, names, and submit registration to Supabase
  // On success: feedback.textContent = 'Registration successful!'; feedback.classList.add('success');
  // On error: feedback.textContent = 'Error message'; feedback.classList.add('error');
});

// Session check using custom session
if (!window.nahalalSession.isLoggedIn()) {
  window.location.href = "login.html";
} else {
  const user = window.nahalalSession.getSession();
  // Registration logic can use user info here
}
