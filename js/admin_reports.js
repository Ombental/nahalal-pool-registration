// Placeholder: Populate reports and handle CSV export
const registrationsTable = document.getElementById(
  "registrations-table-container"
);
const duplicatesTable = document.getElementById("duplicates-table-container");
const feedback = document.getElementById("feedback");

// Session and admin check using custom session
if (!window.nahalalSession.isLoggedIn()) {
  window.location.href = "login.html";
} else if (!window.nahalalSession.isAdmin()) {
  window.location.href = "home.html";
} else {
  const user = window.nahalalSession.getSession();
  // Report logic can use user info here
}

document
  .getElementById("export-registrations-btn")
  .addEventListener("click", () => {
    feedback.textContent = "Exported registrations as CSV (placeholder).";
    feedback.className = "feedback success";
    // TODO: Generate and download CSV
  });

document
  .getElementById("export-duplicates-btn")
  .addEventListener("click", () => {
    feedback.textContent = "Exported duplicates as CSV (placeholder).";
    feedback.className = "feedback success";
    // TODO: Generate and download CSV
  });

function renderRegistrationsTable(registrations) {
  if (!registrations.length) {
    registrationsTable.innerHTML = "<p>No registrations found.</p>";
    return;
  }
  let html =
    "<table><thead><tr><th>User</th><th>Email</th><th>Date</th><th>Time</th><th>Time Group</th><th>Names</th></tr></thead><tbody>";
  registrations.forEach((reg) => {
    html += `<tr>
      <td>${reg.name}</td>
      <td>${reg.email}</td>
      <td>${reg.date}</td>
      <td>${reg.start_time} - ${reg.end_time}</td>
      <td>${reg.time_group}</td>
      <td>${reg.names.join(", ")}</td>
    </tr>`;
  });
  html += "</tbody></table>";
  registrationsTable.innerHTML = html;
}

function renderDuplicatesTable(duplicates) {
  if (!duplicates.length) {
    duplicatesTable.innerHTML = "<p>No duplicate registrations found.</p>";
    return;
  }
  let html =
    "<table><thead><tr><th>User</th><th>Email</th><th>Time Group</th><th>Count</th></tr></thead><tbody>";
  duplicates.forEach((dup) => {
    html += `<tr>
      <td>${dup.name}</td>
      <td>${dup.email}</td>
      <td>${dup.time_group}</td>
      <td>${dup.count}</td>
    </tr>`;
  });
  html += "</tbody></table>";
  duplicatesTable.innerHTML = html;
}

// Placeholder data
const registrations = [
  {
    name: "Alice",
    email: "alice@example.com",
    date: "2024-07-01",
    start_time: "10:00",
    end_time: "11:00",
    time_group: "Group 1",
    names: ["Alice", "Bob"],
  },
  {
    name: "Bob",
    email: "bob@example.com",
    date: "2024-07-02",
    start_time: "09:00",
    end_time: "10:00",
    time_group: "Group 2",
    names: ["Bob"],
  },
];

const duplicates = [
  {
    name: "Alice",
    email: "alice@example.com",
    time_group: "Group 1",
    count: 2,
  },
];

renderRegistrationsTable(registrations);
renderDuplicatesTable(duplicates);
