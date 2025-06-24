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

// i18n: Hebrew translations
const i18n = {
  date: "תאריך",
  time: "שעה",
  timeGroup: "קבוצה",
  names: "שמות",
  status: "סטטוס",
  action: "פעולה",
  upcoming: "קרוב",
  past: "עבר",
  cancel: "ביטול",
  noRegistrations: "לא נמצאו הרשמות",
  remove: "הסר",
};

async function fetchAndRenderRegistrations() {
  const user = window.nahalalSession.getSession();
  if (!user) return;
  // Fetch registrations for this user, join with time_slots
  const { data, error } = await supabase
    .from("registrations")
    .select(
      `id, time_slot_id, names, created_at, time_slots:time_slot_id(id, date, start_time, end_time, time_group)`
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  if (error) {
    window.nahalalUtils.setFeedback(
      feedback,
      `Error loading registrations: ${error.message}`,
      true
    );
    tableContainer.innerHTML = "";
    return;
  }
  // Map to table format
  const now = new Date();
  const registrations = (data || []).map((reg) => {
    const slot = reg.time_slots;
    const slotDate = slot ? slot.date : null;
    const slotStart = slot ? slot.start_time : null;
    const slotEnd = slot ? slot.end_time : null;
    const slotGroup = slot ? slot.time_group : null;
    // Determine if future: slot date > today, or today and end_time > now
    let isFuture = false;
    if (slotDate && slotEnd) {
      const slotDateObj = new Date(slotDate + "T" + slotEnd);
      isFuture = slotDateObj > now;
    }
    return {
      id: reg.id,
      date: slotDate,
      start_time: slotStart,
      end_time: slotEnd,
      time_group: slotGroup,
      names: reg.names || [],
      isFuture,
    };
  });
  renderTable(registrations);
}

function renderTable(registrations) {
  if (!registrations.length) {
    tableContainer.innerHTML = `<p>${i18n.noRegistrations}</p>`;
    return;
  }
  let html = `<div class='overflow-x-auto w-full'>
      <table class='min-w-full table-auto border-separate border-spacing-x-4 border-spacing-y-2 bg-white rounded shadow'>
        <thead>
          <tr>
            <th class='px-6 py-3 text-left border-b'>${i18n.date}</th>
            <th class='px-6 py-3 text-left border-b'>${i18n.time}</th>
            <th class='px-6 py-3 text-left border-b'>${i18n.timeGroup}</th>
            <th class='px-6 py-3 text-left border-b'>${i18n.names}</th>
            <th class='px-6 py-3 text-left border-b'>${i18n.status}</th>
            <th class='px-6 py-3 text-left border-b'>${i18n.action}</th>
          </tr>
        </thead>
        <tbody>`;
  registrations.forEach((reg) => {
    const isFuture = reg.isFuture;
    const namesCellId = `names-cell-${reg.id}`;
    html += `<tr>
      <td class='px-6 py-3 border-b'>${reg.date || "-"}</td>
      <td class='px-6 py-3 border-b'>${
        reg.start_time && reg.end_time
          ? reg.start_time + " - " + reg.end_time
          : "-"
      }</td>
      <td class='px-6 py-3 border-b'>${reg.time_group || "-"}</td>
      <td class='px-6 py-3 border-b' id='${namesCellId}'><div class='flex flex-wrap gap-2'>${reg.names
      .map((name, i) => {
        if (isFuture) {
          return `<span class='chip inline-flex items-center rounded-full bg-blue-100 text-blue-800 px-3 py-1 text-sm font-medium mb-1'>${name}${
            reg.names.length > 1
              ? `<button class='remove-name-btn ml-2 text-blue-500 hover:text-red-600' data-regid='${reg.id}' data-name-idx='${i}' title='${i18n.remove}' style='background:none;border:none;font-size:1em;cursor:pointer;'>&times;</button>`
              : ""
          }</span>`;
        } else {
          return `<span class='chip inline-flex items-center rounded-full bg-gray-200 text-gray-700 px-3 py-1 text-sm font-medium mb-1'>${name}</span>`;
        }
      })
      .join("")}</div></td>
      <td class='px-6 py-3 border-b'>${
        isFuture ? i18n.upcoming : i18n.past
      }</td>
      <td class='px-6 py-3 border-b'>${
        isFuture
          ? `<button class=\"cancel-btn bg-red-600 hover:bg-red-700 text-white font-semibold py-1 px-3 rounded\" data-id=\"${reg.id}\">${i18n.cancel}</button>`
          : ""
      }</td>
    </tr>`;
  });
  html += "</tbody></table></div>";
  tableContainer.innerHTML = html;
  addCancelListeners(registrations);
  addRemoveNameListeners(registrations);
}

function addCancelListeners(registrations) {
  document.querySelectorAll(".cancel-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const regId = btn.getAttribute("data-id");
      if (confirm("Are you sure you want to cancel this registration?")) {
        const { error } = await supabase
          .from("registrations")
          .delete()
          .eq("id", regId);
        if (error) {
          window.nahalalUtils.setFeedback(
            feedback,
            `Error cancelling registration: ${error.message}`,
            true
          );
        } else {
          window.nahalalUtils.setFeedback(
            feedback,
            "Registration cancelled.",
            false
          );
          fetchAndRenderRegistrations();
        }
      }
    });
  });
}

function addRemoveNameListeners(registrations) {
  document.querySelectorAll(".remove-name-btn").forEach((btn) => {
    btn.onclick = async () => {
      const regId = btn.getAttribute("data-regid");
      const nameIdx = parseInt(btn.getAttribute("data-name-idx"), 10);
      const reg = registrations.find((r) => r.id == regId);
      if (!reg) return;
      const newNames = reg.names.slice();
      newNames.splice(nameIdx, 1);
      if (newNames.length > 0) {
        // Update registration
        const { error } = await supabase
          .from("registrations")
          .update({ names: newNames })
          .eq("id", regId);
        if (error) {
          window.nahalalUtils.setFeedback(
            feedback,
            `Error updating registration: ${error.message}`,
            true
          );
        } else {
          fetchAndRenderRegistrations();
        }
      } else {
        // Delete registration
        const { error } = await supabase
          .from("registrations")
          .delete()
          .eq("id", regId);
        if (error) {
          window.nahalalUtils.setFeedback(
            feedback,
            `Error deleting registration: ${error.message}`,
            true
          );
        } else {
          fetchAndRenderRegistrations();
        }
      }
    };
  });
}

// On page load, fetch and render
fetchAndRenderRegistrations();
