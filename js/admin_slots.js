// Placeholder: Handle slot creation and display existing slots
const form = document.getElementById("slot-form");
const feedback = document.getElementById("form-feedback");
const tableContainer = document.getElementById("slots-table-container");

// Session and admin check using custom session
if (!window.nahalalSession.isLoggedIn()) {
  window.location.href = "login.html";
} else if (!window.nahalalSession.isAdmin()) {
  window.location.href = "home.html";
}
const user = window.nahalalSession.getSession();

// Helper: assign a consistent color to each time group
function getGroupColor(group) {
  return window.nahalalUtils.getGroupColor(group);
}

// i18n: Hebrew translations
const i18n = {
  errorLoadingSlots: "שגיאה בטעינת משבצות זמן",
  slotAdded: "משבצת זמן נוספה בהצלחה",
  slotUpdated: "משבצת זמן עודכנה בהצלחה",
  slotDeleted: "משבצת זמן נמחקה",
  publish: "פרסם",
  unpublish: "הסר פרסום",
  edit: "ערוך",
  delete: "מחק",
  save: "שמור",
  action: "פעולה",
  areYouSureDelete: "האם למחוק את המשבצת?",
  error: (msg) => `שגיאה: ${msg}`,
  publishedTimeSlots: "משבצות זמן שפורסמו",
  unpublishedTimeSlots: "משבצות זמן שלא פורסמו",
  published: "פורסם",
  unpublished: "לא פורסם",
  noTimeSlotsFound: (status) => `לא נמצאו משבצות זמן (${status})`,
  date: "תאריך",
  time: "שעה",
  group: "קבוצה",
  max: "מקסימום משתתפים",
  actions: "פעולות",
  slotPublished: "משבצת זמן פורסמה",
  cannotDeletePublishedSlot: "לא ניתן למחוק משבצת שפורסמה",
  publishedSlotsCannotBeUnpublishedEditedDeleted:
    "לא ניתן להסיר פרסום, לערוך או למחוק משבצת שפורסמה.",
  oncePublishedThisSlotCannotBeEditedDeletedOrUnpublishedContinue:
    "לאחר פרסום, לא ניתן לערוך, למחוק או להסיר פרסום ממשבצת זו. להמשיך?",
};

// Fetch and render all slots
async function fetchSlots() {
  const { data, error } = await supabase
    .from("time_slots")
    .select("*")
    .order("date", { ascending: true })
    .order("start_time", { ascending: true });
  if (error) {
    tableContainer.innerHTML = `<p class='error'>${i18n.errorLoadingSlots}: ${error.message}</p>`;
    return;
  }
  const published = (data || []).filter((s) => s.published);
  const unpublished = (data || []).filter((s) => !s.published);
  renderTables(published, unpublished);
}

let editingSlotId = null;

form.addEventListener("submit", addSlotHandler);

async function addSlotHandler(e) {
  e.preventDefault();
  feedback.textContent = "";
  const date = document.getElementById("slot-date").value;
  const start_time = document.getElementById("slot-start").value;
  const end_time = document.getElementById("slot-end").value;
  const max_participants = parseInt(
    document.getElementById("slot-max").value,
    10
  );
  const time_group = document.getElementById("slot-group").value;
  if (start_time >= end_time) {
    setFeedback(i18n.error, true);
    return;
  }
  // Overlap validation
  const { data: slotsOnDate, error: slotsError } = await supabase
    .from("time_slots")
    .select("id, start_time, end_time")
    .eq("date", date);
  if (slotsError) {
    setFeedback(i18n.error(slotsError.message), true);
    return;
  }
  // Check for overlap (ignore self if editing)
  const newStart = start_time;
  const newEnd = end_time;
  const overlap = (slotsOnDate || []).some((slot) => {
    if (editingSlotId && slot.id === editingSlotId) return false;
    // Overlap if: newStart < slot.end_time && newEnd > slot.start_time
    return newStart < slot.end_time && newEnd > slot.start_time;
  });
  if (overlap) {
    setFeedback(i18n.error, true);
    return;
  }
  if (editingSlotId) {
    // Update existing slot
    const { error } = await supabase
      .from("time_slots")
      .update({ date, start_time, end_time, max_participants, time_group })
      .eq("id", editingSlotId);
    if (error) {
      setFeedback(i18n.error(error.message), true);
    } else {
      setFeedback(i18n.slotUpdated, false);
      form.reset();
      form.querySelector("button[type='submit']").textContent = i18n.save;
      editingSlotId = null;
      fetchSlots();
    }
  } else {
    // Add new slot
    const slot = {
      date,
      start_time,
      end_time,
      max_participants,
      time_group,
      published: false,
      created_by: user.id,
    };
    const { error } = await supabase.from("time_slots").insert([slot]);
    if (error) {
      setFeedback(i18n.error(error.message), true);
    } else {
      setFeedback(i18n.slotAdded, false);
      form.reset();
      fetchSlots();
    }
  }
}

function setFeedback(msg, isError) {
  window.nahalalUtils.setFeedback(feedback, msg, isError);
}

function renderTables(published, unpublished) {
  let html = "";
  html += `<h3 class='text-xl font-bold text-orange-700 mb-2 mt-6'>${i18n.publishedTimeSlots}</h3>`;
  html += `<div class='overflow-x-auto w-full mb-10'>${renderTable(
    published,
    true
  )}</div>`;
  html += `<h3 class='text-xl font-bold text-orange-700 mb-2 mt-6'>${i18n.unpublishedTimeSlots}</h3>`;
  html += `<div class='overflow-x-auto w-full'>${renderTable(
    unpublished,
    false
  )}</div>`;
  tableContainer.innerHTML = html;
  addTableActionListeners(published, unpublished);
}

function addTableActionListeners(published, unpublished) {
  document.querySelectorAll(".delete").forEach((btn) => {
    const isPublished = btn.getAttribute("data-published") === "true";
    if (isPublished) {
      btn.disabled = true;
      btn.title = i18n.cannotDeletePublishedSlot;
      return;
    }
    btn.addEventListener("click", async () => {
      if (confirm(i18n.areYouSureDelete)) {
        const id = btn.getAttribute("data-id");
        const { error } = await supabase
          .from("time_slots")
          .delete()
          .eq("id", id);
        if (error) {
          setFeedback(i18n.error(error.message), true);
        } else {
          setFeedback(i18n.slotDeleted, false);
          fetchSlots();
        }
      }
    });
  });
  document.querySelectorAll(".publish").forEach((btn) => {
    const isPublished = btn.getAttribute("data-published") === "true";
    if (isPublished) {
      btn.addEventListener("click", () => {
        alert(i18n.publishedSlotsCannotBeUnpublishedEditedDeleted);
      });
      return;
    }
    btn.addEventListener("click", async () => {
      const id = btn.getAttribute("data-id");
      if (
        confirm(
          i18n.oncePublishedThisSlotCannotBeEditedDeletedOrUnpublishedContinue
        )
      ) {
        const { error } = await supabase
          .from("time_slots")
          .update({ published: true })
          .eq("id", id);
        if (error) {
          setFeedback(i18n.error(error.message), true);
        } else {
          setFeedback(i18n.slotPublished, false);
          fetchSlots();
        }
      }
    });
  });
  document.querySelectorAll(".edit").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      const slot = [...published, ...unpublished].find((s) => s.id === id);
      if (!slot) return;
      document.getElementById("slot-date").value = slot.date;
      document.getElementById("slot-start").value = slot.start_time;
      document.getElementById("slot-end").value = slot.end_time;
      document.getElementById("slot-max").value = slot.max_participants;
      document.getElementById("slot-group").value = slot.time_group;
      form.scrollIntoView({ behavior: "smooth" });
      form.querySelector("button[type='submit']").textContent = i18n.edit;
      editingSlotId = id;
    });
  });
}

function renderTable(slots, isPublished) {
  if (!slots.length) {
    return `<p class='py-4 text-gray-500'>${i18n.noTimeSlotsFound(
      isPublished ? i18n.published : i18n.unpublished
    )}</p>`;
  }
  let html = `<table class='min-w-full table-auto border-separate border-spacing-x-4 border-spacing-y-2 bg-white rounded shadow'>
      <thead>
        <tr>
          <th class='px-6 py-3 text-left border-b'>${i18n.date}</th>
          <th class='px-6 py-3 text-left border-b'>${i18n.time}</th>
          <th class='px-6 py-3 text-left border-b'>${i18n.group}</th>
          <th class='px-6 py-3 text-left border-b'>${i18n.max}</th>
          <th class='px-6 py-3 text-left border-b'>${i18n.actions}</th>`;
  html += `</tr>
      </thead>
      <tbody>`;
  slots.forEach((slot) => {
    const bg = getGroupColor(slot.time_group);
    html += `<tr style="background:${bg};opacity:0.6;">
      <td class='px-6 py-3 border-b'>${slot.date}</td>
      <td class='px-6 py-3 border-b'>${slot.start_time} - ${slot.end_time}</td>
      <td class='px-6 py-3 border-b'>${slot.time_group}</td>
      <td class='px-6 py-3 border-b'>${slot.max_participants}</td>`;
    html += `<td class='px-6 py-3 border-b'>`;
    if (isPublished) {
      html += `<button class="action-btn edit bg-blue-600 text-white rounded px-3 py-1 hover:bg-blue-700 transition" data-id="${slot.id}">${i18n.edit}</button>`;
    } else {
      html += `<button class="action-btn edit bg-blue-600 text-white rounded px-3 py-1 mr-2 hover:bg-blue-700 transition" data-id="${
        slot.id
      }">${i18n.edit}</button>
        <button class="action-btn delete bg-red-600 text-white rounded px-3 py-1 mr-2 hover:bg-red-700 transition" data-id="${
          slot.id
        }">${i18n.delete}</button>
        <button class="action-btn publish bg-orange-600 text-white rounded px-3 py-1 hover:bg-orange-700 transition" data-id="${
          slot.id
        }" data-published="${slot.published}">${
        slot.published ? i18n.unpublish : i18n.publish
      }</button>`;
    }
    html += `</td>`;
    html += "</tr>";
  });
  html += "</tbody></table>";
  return html;
}

// Initial fetch
fetchSlots();
