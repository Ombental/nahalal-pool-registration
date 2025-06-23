// Placeholder: Fetch upcoming time slots and registrations from Supabase
const tableContainer = document.getElementById("slots-table-container");

// Session check using custom session
if (!window.nahalalSession.isLoggedIn()) {
  window.location.href = "login.html";
} else {
  const user = window.nahalalSession.getSession();
  // Table logic can use user info here
}

function renderTable(slots) {
  if (!slots.length) {
    tableContainer.innerHTML = "<p>No upcoming time slots found.</p>";
    return;
  }
  let html =
    "<table><thead><tr><th>Date</th><th>Time</th><th>Time Group</th><th>Max Participants</th><th>Registered Users</th></tr></thead><tbody>";
  slots.forEach((slot) => {
    html += `<tr>
      <td>${slot.date}</td>
      <td>${slot.start_time} - ${slot.end_time}</td>
      <td>${slot.time_group}</td>
      <td>${slot.max_participants}</td>
      <td class="names-list">${slot.registrations
        .map((r) => r.names.join(", "))
        .join("<br>")}</td>
    </tr>`;
  });
  html += "</tbody></table>";
  tableContainer.innerHTML = html;
}

// Placeholder data
const slots = [
  {
    date: "2024-07-01",
    start_time: "10:00",
    end_time: "11:00",
    time_group: "Group 1",
    max_participants: 10,
    registrations: [{ names: ["Alice", "Bob"] }, { names: ["Charlie"] }],
  },
  {
    date: "2024-07-02",
    start_time: "09:00",
    end_time: "10:00",
    time_group: "Group 2",
    max_participants: 8,
    registrations: [],
  },
];

renderTable(slots);
