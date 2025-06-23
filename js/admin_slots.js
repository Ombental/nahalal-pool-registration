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

// Fetch and render all slots
async function fetchSlots() {
  const { data, error } = await supabase
    .from("time_slots")
    .select("*")
    .order("date", { ascending: true })
    .order("start_time", { ascending: true });
  if (error) {
    tableContainer.innerHTML = `<p class='error'>Error loading slots: ${error.message}</p>`;
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
    setFeedback("Start time must be before end time.", true);
    return;
  }
  // Overlap validation
  const { data: slotsOnDate, error: slotsError } = await supabase
    .from("time_slots")
    .select("id, start_time, end_time")
    .eq("date", date);
  if (slotsError) {
    setFeedback(`Error checking overlaps: ${slotsError.message}`, true);
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
    setFeedback("Time slot overlaps with an existing slot on this date.", true);
    return;
  }
  if (editingSlotId) {
    // Update existing slot
    const { error } = await supabase
      .from("time_slots")
      .update({ date, start_time, end_time, max_participants, time_group })
      .eq("id", editingSlotId);
    if (error) {
      setFeedback(`Error: ${error.message}`, true);
    } else {
      setFeedback("Slot updated!", false);
      form.reset();
      form.querySelector("button[type='submit']").textContent = "Add Time Slot";
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
      setFeedback(`Error: ${error.message}`, true);
    } else {
      setFeedback("Slot added!", false);
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
  html += `<h3>Published Time Slots</h3>`;
  html += renderTable(published, true);
  html += `<h3>Unpublished Time Slots</h3>`;
  html += renderTable(unpublished, false);
  tableContainer.innerHTML = html;
  addTableActionListeners(published, unpublished);
}

function addTableActionListeners(published, unpublished) {
  document.querySelectorAll(".delete").forEach((btn) => {
    const isPublished = btn.getAttribute("data-published") === "true";
    if (isPublished) {
      btn.disabled = true;
      btn.title = "Cannot delete published slot";
      return;
    }
    btn.addEventListener("click", async () => {
      if (confirm("Delete this slot?")) {
        const id = btn.getAttribute("data-id");
        const { error } = await supabase
          .from("time_slots")
          .delete()
          .eq("id", id);
        if (error) {
          setFeedback(`Error: ${error.message}`, true);
        } else {
          setFeedback("Slot deleted.", false);
          fetchSlots();
        }
      }
    });
  });
  document.querySelectorAll(".publish").forEach((btn) => {
    const isPublished = btn.getAttribute("data-published") === "true";
    if (isPublished) {
      btn.addEventListener("click", () => {
        alert("Published slots cannot be unpublished, edited, or deleted.");
      });
      return;
    }
    btn.addEventListener("click", async () => {
      const id = btn.getAttribute("data-id");
      if (
        confirm(
          "Once published, this slot cannot be edited, deleted, or unpublished. Continue?"
        )
      ) {
        const { error } = await supabase
          .from("time_slots")
          .update({ published: true })
          .eq("id", id);
        if (error) {
          setFeedback(`Error: ${error.message}`, true);
        } else {
          setFeedback("Slot published.", false);
          fetchSlots();
        }
      }
    });
  });
  document.querySelectorAll(".edit").forEach((btn) => {
    const isPublished = btn.getAttribute("data-published") === "true";
    if (isPublished) {
      btn.disabled = true;
      btn.title = "Cannot edit published slot";
      return;
    }
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
      form.querySelector("button[type='submit']").textContent =
        "Update Time Slot";
      editingSlotId = id;
    });
  });
}

function renderTable(slots, isPublished) {
  if (!slots.length) {
    return `<p>No ${
      isPublished ? "published" : "unpublished"
    } time slots found.</p>`;
  }
  let html =
    "<table><thead><tr><th>Date</th><th>Time</th><th>Group</th><th>Max</th>";
  if (!isPublished) {
    html += "<th>Actions</th>";
  }
  html += "</tr></thead><tbody>";
  slots.forEach((slot) => {
    const bg = getGroupColor(slot.time_group);
    html += `<tr style="background:${bg};opacity:0.6;">
      <td>${slot.date}</td>
      <td>${slot.start_time} - ${slot.end_time}</td>
      <td>${slot.time_group}</td>
      <td>${slot.max_participants}</td>`;
    if (!isPublished) {
      html += `<td>
        <button class="action-btn edit" data-id="${slot.id}">Edit</button>
        <button class="action-btn delete" data-id="${slot.id}">Delete</button>
        <button class="action-btn publish" data-id="${
          slot.id
        }" data-published="${slot.published}">${
        slot.published ? "Unpublish" : "Publish"
      }</button>
      </td>`;
    }
    html += "</tr>";
  });
  html += "</tbody></table>";
  return html;
}

// Initial fetch
fetchSlots();
