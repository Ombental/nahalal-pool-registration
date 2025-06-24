// Placeholder: Fetch upcoming time slots and registrations from Supabase
const tableContainer = document.getElementById("slots-table-container");

// Session check using custom session
if (!window.nahalalSession.isLoggedIn()) {
  window.location.href = "login.html";
} else {
  const user = window.nahalalSession.getSession();
  // Table logic can use user info here
}

const headerRow = document.getElementById("slots-header-row");
const tableBody = document.getElementById("slots-table-body");

let slots = [];
let registrations = [];
let slotIdToNames = {};
let slotIdToRegObjs = {};
let currentStart = 0;
const SLOTS_PER_PAGE = 4;
let userIdToName = {};

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
  remove: "הסר",
  edit: "ערוך",
  delete: "מחק",
  save: "שמור",
  publish: "פרסם",
  unpublish: "הסר פרסום",
  registrations: "הרשמות",
  noRegistrations: "לא נמצאו הרשמות",
  noUsers: "לא נמצאו משתמשים",
  loading: "טוען...",
};

async function loadSlotsAndRegistrations() {
  // Fetch published future slots
  const { data: slotData, error: slotError } = await supabase
    .from("time_slots")
    .select("id, date, start_time, end_time, max_participants")
    .eq("published", true)
    .gte("date", new Date().toISOString().slice(0, 10))
    .order("date", { ascending: true })
    .order("start_time", { ascending: true });
  if (slotError) {
    headerRow.innerHTML = `<th colspan="4">Error loading slots</th>`;
    tableBody.innerHTML = "";
    return;
  }
  slots = slotData || [];
  if (!slots.length) {
    headerRow.innerHTML = `<th colspan="4">No upcoming slots</th>`;
    tableBody.innerHTML = "";
    return;
  }
  // Fetch registrations for these slots (include user_id)
  const slotIds = slots.map((s) => s.id);
  const { data: regData, error: regError } = await supabase
    .from("registrations")
    .select("id, time_slot_id, names, user_id")
    .in("time_slot_id", slotIds);
  if (regError) {
    headerRow.innerHTML = `<th colspan="4">Error loading registrations</th>`;
    tableBody.innerHTML = "";
    return;
  }
  registrations = regData || [];
  // Fetch user names for all user_ids in these registrations
  const userIds = Array.from(new Set(registrations.map((r) => r.user_id)));
  userIdToName = {};
  if (userIds.length > 0) {
    const { data: usersData, error: usersError } = await supabase
      .from("users")
      .select("id, name")
      .in("id", userIds);
    if (!usersError && usersData) {
      usersData.forEach((u) => {
        userIdToName[u.id] = u.name;
      });
    }
  }
  // Map slot id to array of names and registration objects
  slotIdToNames = {};
  slotIdToRegObjs = {};
  registrations.forEach((r) => {
    if (!slotIdToNames[r.time_slot_id]) slotIdToNames[r.time_slot_id] = [];
    if (!slotIdToRegObjs[r.time_slot_id]) slotIdToRegObjs[r.time_slot_id] = [];
    slotIdToNames[r.time_slot_id].push(...(r.names || []));
    slotIdToRegObjs[r.time_slot_id].push({
      id: r.id,
      names: r.names || [],
      user_id: r.user_id,
    });
  });
  renderTable();
}

function isAdmin() {
  return (
    window.nahalalSession &&
    window.nahalalSession.isAdmin &&
    window.nahalalSession.isAdmin()
  );
}

function renderTable() {
  // Determine which slots to show
  const visibleSlots = slots.slice(currentStart, currentStart + SLOTS_PER_PAGE);
  // Header row with arrows
  headerRow.innerHTML = "";
  if (currentStart > 0) {
    headerRow.innerHTML += `<th class="px-2 py-2 border bg-blue-50 text-center cursor-pointer w-10" id="arrow-left">&#8592;</th>`;
  }
  visibleSlots.forEach((slot) => {
    const day = new Date(slot.date);
    // Hebrew weekday and date
    const dayName = day.toLocaleDateString("he-IL", { weekday: "short" });
    const dayMonth = day.toLocaleDateString("he-IL", {
      day: "2-digit",
      month: "2-digit",
    });
    // Count number of registrations for this slot
    const regCount = (slotIdToRegObjs[slot.id] || []).length;
    headerRow.innerHTML += `<th class="px-4 py-2 border bg-blue-50 text-center min-w-[180px]">
      <div>${dayName} ${dayMonth}</div>
      <div class='font-semibold'>${slot.end_time?.slice(0, 5) || ""} - ${
      slot.start_time?.slice(0, 5) || ""
    }</div>
      <div class='text-xs text-gray-500 mt-1 block'>${regCount} ${
      i18n.registrations
    }</div>
    </th>`;
  });
  if (currentStart + SLOTS_PER_PAGE < slots.length) {
    headerRow.innerHTML += `<th class="px-2 py-2 border bg-blue-50 text-center cursor-pointer w-10" id="arrow-right">&#8594;</th>`;
  }
  // Find max max_participants among visible slots
  let maxRows = 0;
  visibleSlots.forEach((slot) => {
    if (slot.max_participants > maxRows) maxRows = slot.max_participants;
  });
  // Render body rows
  tableBody.innerHTML = "";
  for (let i = 0; i < maxRows; i++) {
    let row = "";
    if (currentStart > 0) row += '<td class="px-2 py-2 border bg-white"></td>';
    visibleSlots.forEach((slot) => {
      const regObjs = slotIdToRegObjs[slot.id] || [];
      // Build a flat list of {regId, name, nameIdx, user_id} for this slot
      let flatNames = [];
      regObjs.forEach((regObj) => {
        (regObj.names || []).forEach((n, idx) => {
          flatNames.push({
            regId: regObj.id,
            name: n,
            nameIdx: idx,
            user_id: regObj.user_id,
          });
        });
      });
      let cellHtml = "";
      if (i < slot.max_participants) {
        if (flatNames[i]) {
          const { regId, name, user_id } = flatNames[i];
          const userName = userIdToName[user_id]
            ? ` (${userIdToName[user_id]})`
            : "";
          if (isAdmin()) {
            cellHtml = `<span class='font-medium text-blue-700'>${name}${userName}</span> <button class='remove-name-btn text-red-500 ml-1' data-regid='${regId}' data-name='${encodeURIComponent(
              name
            )}' title='Remove' style='font-size:1em;background:none;border:none;cursor:pointer;'>✕</button>`;
          } else {
            cellHtml = `<span class='font-medium text-blue-700'>${name}${userName}</span>`;
          }
        }
        row += `<td class="px-4 py-2 border bg-white text-center">${cellHtml}</td>`;
      } else {
        row += `<td class="px-4 py-2 border bg-gray-100"></td>`;
      }
    });
    if (currentStart + SLOTS_PER_PAGE < slots.length)
      row += '<td class="px-2 py-2 border bg-white"></td>';
    tableBody.innerHTML += `<tr>${row}</tr>`;
  }
  // Add arrow event listeners
  const leftArrow = document.getElementById("arrow-left");
  if (leftArrow)
    leftArrow.onclick = () => {
      currentStart = Math.max(0, currentStart - 1);
      renderTable();
    };
  const rightArrow = document.getElementById("arrow-right");
  if (rightArrow)
    rightArrow.onclick = () => {
      currentStart = Math.min(slots.length - SLOTS_PER_PAGE, currentStart + 1);
      renderTable();
    };
  // Add remove-name button listeners (admin only)
  if (isAdmin()) {
    document.querySelectorAll(".remove-name-btn").forEach((btn) => {
      btn.onclick = async () => {
        const regId = btn.getAttribute("data-regid");
        const name = decodeURIComponent(btn.getAttribute("data-name"));
        // Find the registration by its unique id
        const reg = registrations.find((r) => r.id === regId);
        if (!reg) return;
        const newNames = (reg.names || []).filter((n) => n !== name);
        if (newNames.length > 0) {
          // Update registration
          const { error } = await supabase
            .from("registrations")
            .update({ names: newNames })
            .eq("id", regId);
          if (error) {
            alert("Error updating registration: " + error.message);
          }
        } else {
          // Delete registration
          const { error } = await supabase
            .from("registrations")
            .delete()
            .eq("id", regId);
          if (error) {
            alert("Error deleting registration: " + error.message);
          }
        }
        await loadSlotsAndRegistrations();
      };
    });
  }
}

loadSlotsAndRegistrations();

// Ensure vertical scroll for table container
if (tableContainer) {
  tableContainer.style.maxHeight = "60vh";
  tableContainer.style.overflowY = "auto";
}
