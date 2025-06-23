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
let currentStart = 0;
const SLOTS_PER_PAGE = 4;

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
  // Fetch registrations for these slots
  const slotIds = slots.map((s) => s.id);
  const { data: regData, error: regError } = await supabase
    .from("registrations")
    .select("time_slot_id, names")
    .in("time_slot_id", slotIds);
  if (regError) {
    headerRow.innerHTML = `<th colspan="4">Error loading registrations</th>`;
    tableBody.innerHTML = "";
    return;
  }
  registrations = regData || [];
  // Map slot id to array of names
  slotIdToNames = {};
  registrations.forEach((r) => {
    if (!slotIdToNames[r.time_slot_id]) slotIdToNames[r.time_slot_id] = [];
    slotIdToNames[r.time_slot_id].push(...(r.names || []));
  });
  renderTable();
}

function renderTable() {
  // Determine which slots to show
  const visibleSlots = slots.slice(currentStart, currentStart + SLOTS_PER_PAGE);
  // Header row with arrows
  headerRow.innerHTML = "";
  if (currentStart > 0) {
    headerRow.innerHTML += `<th style="border:1px solid #bbb;cursor:pointer;width:40px;" id="arrow-left">&#8592;</th>`;
  }
  visibleSlots.forEach((slot) => {
    const day = new Date(slot.date);
    const dayName = day.toLocaleDateString(undefined, { weekday: "short" });
    const dayMonth = day.toLocaleDateString(undefined, {
      day: "2-digit",
      month: "2-digit",
    });
    headerRow.innerHTML += `<th style="border:1px solid #bbb;min-width:180px;">${dayName} ${dayMonth}<br>${slot.start_time} - ${slot.end_time}</th>`;
  });
  if (currentStart + SLOTS_PER_PAGE < slots.length) {
    headerRow.innerHTML += `<th style="border:1px solid #bbb;cursor:pointer;width:40px;" id="arrow-right">&#8594;</th>`;
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
    if (currentStart > 0) row += '<td style="border:1px solid #bbb;"></td>';
    visibleSlots.forEach((slot) => {
      const names = slotIdToNames[slot.id] || [];
      if (i < slot.max_participants) {
        row += `<td style="border:1px solid #bbb;">${
          names[i] ? names[i] : ""
        }</td>`;
      } else {
        row += `<td style="border:1px solid #bbb;background:#222;"></td>`;
      }
    });
    if (currentStart + SLOTS_PER_PAGE < slots.length)
      row += '<td style="border:1px solid #bbb;"></td>';
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
}

loadSlotsAndRegistrations();

// Ensure vertical scroll for table container
if (tableContainer) {
  tableContainer.style.maxHeight = "60vh";
  tableContainer.style.overflowY = "auto";
}
