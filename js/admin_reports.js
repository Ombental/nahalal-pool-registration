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

let lastRegistrations = [];
let lastDuplicates = [];

function arrayToCSV(arr, columns) {
  return window.nahalalUtils.arrayToCSV(arr, columns);
}

function downloadCSV(filename, csv) {
  window.nahalalUtils.downloadCSV(filename, csv);
}

function setFeedback(msg, isError) {
  window.nahalalUtils.setFeedback(feedback, msg, isError);
}

document
  .getElementById("export-registrations-btn")
  .addEventListener("click", () => {
    if (!lastRegistrations.length) {
      setFeedback("No registrations to export.", true);
      return;
    }
    const columns = [
      "name",
      "email",
      "date",
      "start_time",
      "end_time",
      "time_group",
      "names",
    ];
    const csv = arrayToCSV(lastRegistrations, columns);
    downloadCSV("registrations.csv", csv);
    setFeedback("Exported registrations as CSV.", false);
  });

document
  .getElementById("export-duplicates-btn")
  .addEventListener("click", () => {
    if (!lastDuplicates.length) {
      setFeedback("No duplicates to export.", true);
      return;
    }
    const columns = ["name", "email", "time_group", "count"];
    const csv = arrayToCSV(lastDuplicates, columns);
    downloadCSV("duplicates.csv", csv);
    setFeedback("Exported duplicates as CSV.", false);
  });

function renderRegistrationsTable(registrations) {
  lastRegistrations = registrations;
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
  lastDuplicates = duplicates;
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

async function fetchAndRenderReports() {
  // Fetch all registrations with user and slot info
  const { data: regs, error: regsError } = await supabase
    .from("registrations")
    .select(
      `id, names, user_id, time_slot_id, users:user_id(name, email), time_slots:time_slot_id(date, start_time, end_time, time_group)`
    );
  if (regsError) {
    setFeedback(`Error loading registrations: ${regsError.message}`, true);
    registrationsTable.innerHTML = "";
    duplicatesTable.innerHTML = "";
    return;
  }
  // Format for main table
  const registrations = (regs || []).map((reg) => {
    const user = reg.users || {};
    const slot = reg.time_slots || {};
    return {
      name: user.name || "-",
      email: user.email || "-",
      date: slot.date || "-",
      start_time: slot.start_time || "-",
      end_time: slot.end_time || "-",
      time_group: slot.time_group || "-",
      names: reg.names || [],
    };
  });
  renderRegistrationsTable(registrations);

  // Find duplicates: users registered more than once in the same time group
  const dupMap = {};
  (regs || []).forEach((reg) => {
    const user = reg.users || {};
    const slot = reg.time_slots || {};
    if (!user.email || !slot.time_group) return;
    const key = user.email + "|" + slot.time_group;
    if (!dupMap[key])
      dupMap[key] = {
        name: user.name,
        email: user.email,
        time_group: slot.time_group,
        count: 0,
      };
    dupMap[key].count += 1;
  });
  const duplicates = Object.values(dupMap).filter((dup) => dup.count > 1);
  renderDuplicatesTable(duplicates);
}

// On page load, fetch and render
fetchAndRenderReports();
