// Placeholder: Fetch user's registrations from Supabase and populate table
const tableContainer = document.getElementById("registrations-table-container");
const feedback = document.getElementById("feedback");

// Session check using custom session
if (!window.nahalalSession.isLoggedIn()) {
  window.location.href = "login.html";
} else {
  const user = window.nahalalSession.getSession();
  // Registration list logic can use user info here
}

function renderTable(registrations) {
  if (!registrations.length) {
    tableContainer.innerHTML = "<p>No registrations found.</p>";
    return;
  }
  let html =
    "<table><thead><tr><th>Date</th><th>Time</th><th>Time Group</th><th>Names</th><th>Status</th><th>Action</th></tr></thead><tbody>";
  registrations.forEach((reg) => {
    const isFuture = reg.isFuture;
    html += `<tr>
      <td>${reg.date}</td>
      <td>${reg.start_time} - ${reg.end_time}</td>
      <td>${reg.time_group}</td>
      <td>${reg.names.join(", ")}</td>
      <td>${isFuture ? "Upcoming" : "Past"}</td>
      <td>${
        isFuture
          ? `<button class="cancel-btn" data-id="${reg.id}">Cancel</button>`
          : ""
      }</td>
    </tr>`;
  });
  html += "</tbody></table>";
  tableContainer.innerHTML = html;
  document.querySelectorAll(".cancel-btn").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const regId = btn.getAttribute("data-id");
      if (confirm("Are you sure you want to cancel this registration?")) {
        // TODO: Cancel registration in Supabase
        feedback.textContent = "Registration cancelled (placeholder).";
        feedback.className = "feedback success";
        // Optionally remove row from table
      }
    });
  });
}

// Placeholder data
const registrations = [
  {
    id: 1,
    date: "2024-07-01",
    start_time: "10:00",
    end_time: "11:00",
    time_group: "Group 1",
    names: ["You", "Friend"],
    isFuture: true,
  },
  {
    id: 2,
    date: "2024-06-20",
    start_time: "09:00",
    end_time: "10:00",
    time_group: "Group 2",
    names: ["You"],
    isFuture: false,
  },
];

renderTable(registrations);
