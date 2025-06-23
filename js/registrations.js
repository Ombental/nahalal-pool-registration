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
    tableContainer.innerHTML = "<p>No registrations found.</p>";
    return;
  }
  let html =
    "<table><thead><tr><th>Date</th><th>Time</th><th>Time Group</th><th>Names</th><th>Status</th><th>Action</th></tr></thead><tbody>";
  registrations.forEach((reg) => {
    const isFuture = reg.isFuture;
    const namesCellId = `names-cell-${reg.id}`;
    html += `<tr>
      <td>${reg.date || "-"}</td>
      <td>${
        reg.start_time && reg.end_time
          ? reg.start_time + " - " + reg.end_time
          : "-"
      }</td>
      <td>${reg.time_group || "-"}</td>
      <td id="${namesCellId}">${reg.names.join(", ")}${
      isFuture
        ? ' <button class="edit-names-btn" data-id="' +
          reg.id +
          '" title="Edit names" style="background:none;border:none;cursor:pointer;padding:0;vertical-align:middle;"><span style="font-size:1.1em;">✏️</span></button>'
        : ""
    }</td>
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
  addCancelListeners(registrations);
  addEditListeners(registrations);
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

function addEditListeners(registrations) {
  document.querySelectorAll(".edit-names-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const regId = btn.getAttribute("data-id");
      const reg = registrations.find((r) => r.id === regId);
      const cell = document.getElementById(`names-cell-${regId}`);
      if (!cell) return;
      renderEditNamesCell(cell, reg, registrations);
    });
  });
}

function renderEditNamesCell(cell, reg, registrations) {
  let inputsHtml = "";
  (reg.names || []).forEach((name, i) => {
    inputsHtml += `<div style='display:flex;align-items:center;margin-bottom:2px;'><input type='text' class='edit-name-input' value="${name.replace(
      /"/g,
      "&quot;"
    )}" style='margin-right:6px;'/>${
      reg.names.length > 1
        ? `<button type='button' class='remove-name-btn' data-idx='${i}' style='background:none;border:none;color:#d32f2f;font-size:1.1em;cursor:pointer;'>✕</button>`
        : ""
    }</div>`;
  });
  if (!reg.names.length) {
    inputsHtml += `<div style='display:flex;align-items:center;margin-bottom:2px;'><input type='text' class='edit-name-input' value="" style='margin-right:6px;'/></div>`;
  }
  inputsHtml += `<button type='button' class='add-name-btn' style='background:none;border:none;color:#2a7ae2;font-size:1.1em;cursor:pointer;margin-top:2px;'>+ Add Name</button>`;
  inputsHtml += `<div style='margin-top:6px;'><button type='button' class='save-names-btn' style='background:#2a7ae2;color:#fff;border:none;border-radius:4px;padding:4px 10px;margin-right:6px;'>Save</button><button type='button' class='cancel-edit-btn' style='background:#bbb;color:#222;border:none;border-radius:4px;padding:4px 10px;'>Cancel</button></div>`;
  cell.innerHTML = inputsHtml;
  addEditNamesHandlers(cell, reg, registrations);
}

function addEditNamesHandlers(cell, reg, registrations) {
  cell.querySelector(".add-name-btn").onclick = () => {
    const div = document.createElement("div");
    div.style.display = "flex";
    div.style.alignItems = "center";
    div.style.marginBottom = "2px";
    const input = document.createElement("input");
    input.type = "text";
    input.className = "edit-name-input";
    input.style.marginRight = "6px";
    if (cell.querySelectorAll(".edit-name-input").length >= 1) {
      const removeBtn = document.createElement("button");
      removeBtn.type = "button";
      removeBtn.className = "remove-name-btn";
      removeBtn.innerHTML = "✕";
      removeBtn.style.background = "none";
      removeBtn.style.border = "none";
      removeBtn.style.color = "#d32f2f";
      removeBtn.style.fontSize = "1.1em";
      removeBtn.style.cursor = "pointer";
      removeBtn.onclick = () => {
        if (cell.querySelectorAll(".edit-name-input").length > 1) div.remove();
      };
      div.appendChild(input);
      div.appendChild(removeBtn);
    } else {
      div.appendChild(input);
    }
    cell.insertBefore(div, cell.querySelector(".add-name-btn"));
  };
  cell.querySelectorAll(".remove-name-btn").forEach((btn) => {
    btn.onclick = () => {
      if (cell.querySelectorAll(".edit-name-input").length > 1)
        btn.parentElement.remove();
    };
  });
  cell.querySelector(".cancel-edit-btn").onclick = () => {
    renderTable(registrations);
  };
  cell.querySelector(".save-names-btn").onclick = async () => {
    const nameInputs = cell.querySelectorAll(".edit-name-input");
    const names = Array.from(nameInputs)
      .map((input) => input.value.trim())
      .filter((n) => n);
    if (!names.length) {
      window.nahalalUtils.setFeedback(
        feedback,
        "Please enter at least one name.",
        true
      );
      return;
    }
    // Update registration
    const { error } = await supabase
      .from("registrations")
      .update({ names })
      .eq("id", reg.id);
    if (error) {
      window.nahalalUtils.setFeedback(
        feedback,
        `Error updating registration: ${error.message}`,
        true
      );
    } else {
      window.nahalalUtils.setFeedback(feedback, "Registration updated!", false);
      fetchAndRenderRegistrations();
    }
  };
}

// On page load, fetch and render
fetchAndRenderRegistrations();
