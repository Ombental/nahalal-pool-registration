const dateSelect = document.getElementById("date-select");
const timeSelect = document.getElementById("time-select");
const timeRangeSection = document.getElementById("time-range-section");
const namesList = document.getElementById("names-list");
const addNameBtn = document.getElementById("add-name-btn");
const submitBtn = document.getElementById("submit-btn");
const form = document.getElementById("registration-form");
const feedback = document.getElementById("form-feedback");

let slotsByDate = {};
let slots = [];
let selectedSlot = null;
let placesLeft = 0;
let userRegistrationsByGroup = {};

function isFutureSlot(slot, now = new Date()) {
  return window.nahalalUtils.isFutureSlot(slot, now);
}

async function loadSlotsAndRegistrations() {
  const { data: slotsData, error: slotsError } = await supabase
    .from("time_slots")
    .select("id, date, start_time, end_time, time_group, max_participants")
    .eq("published", true)
    .order("date", { ascending: true })
    .order("start_time", { ascending: true });
  if (slotsError) {
    dateSelect.innerHTML = `<option value="">Error loading slots</option>`;
    return;
  }
  const now = new Date();
  slots = (slotsData || []).filter((slot) => isFutureSlot(slot, now));
  const slotIds = slots.map((s) => s.id);
  const { data: regs, error: regsError } = await supabase
    .from("registrations")
    .select("id, time_slot_id, names, time_slots:time_slot_id(time_group)")
    .in("time_slot_id", slotIds)
    .eq("user_id", window.nahalalSession.getSession().id);
  if (regsError) {
    dateSelect.innerHTML = `<option value="">Error loading registrations</option>`;
    return;
  }
  const slotIdToCount = {};
  userRegistrationsByGroup = {};
  regs.forEach((r) => {
    slotIdToCount[r.time_slot_id] =
      (slotIdToCount[r.time_slot_id] || 0) + (r.names ? r.names.length : 0);
    if (r.time_slots && r.time_slots.time_group) {
      userRegistrationsByGroup[r.time_slots.time_group] = r;
    }
  });
  slots.forEach((slot) => {
    slot.placesLeft = slot.max_participants - (slotIdToCount[slot.id] || 0);
  });
  slotsByDate = {};
  slots.forEach((slot) => {
    if (!slotsByDate[slot.date]) slotsByDate[slot.date] = [];
    slotsByDate[slot.date].push(slot);
  });
  populateDateDropdown();
}

function populateDateDropdown() {
  const uniqueDates = Object.keys(slotsByDate);
  if (!uniqueDates.length) {
    dateSelect.innerHTML = `<option value="">No available dates</option>`;
    return;
  }
  dateSelect.innerHTML = `<option value="">-- Select a date --</option>`;
  uniqueDates.forEach((date) => {
    const day = new Date(date);
    const dayName = day.toLocaleDateString(undefined, { weekday: "long" });
    const dayMonth = day.toLocaleDateString(undefined, {
      day: "2-digit",
      month: "2-digit",
    });
    dateSelect.innerHTML += `<option value="${date}">${dayName} ${dayMonth}</option>`;
  });
}

function clearNameInputs() {
  Array.from(document.querySelectorAll(".name-input")).forEach((input, i) => {
    if (i > 0) input.remove();
    input.value = "";
  });
}

dateSelect.addEventListener("change", () => {
  timeSelect.innerHTML = `<option value="">-- Select a time range --</option>`;
  timeRangeSection.style.display = "none";
  namesList.style.display = "none";
  addNameBtn.style.display = "none";
  submitBtn.style.display = "none";
  selectedSlot = null;
  if (!dateSelect.value) return;
  const slotsForDate = slotsByDate[dateSelect.value] || [];
  slotsForDate.forEach((slot) => {
    timeSelect.innerHTML += `<option value="${slot.id}">${slot.start_time} - ${slot.end_time} | ${slot.placesLeft} places left</option>`;
  });
  timeRangeSection.style.display = "block";
});

timeSelect.addEventListener("change", () => {
  namesList.style.display = "none";
  addNameBtn.style.display = "none";
  submitBtn.style.display = "none";
  clearNameInputs();
  if (!timeSelect.value) return;
  selectedSlot = slots.find((s) => s.id === timeSelect.value);
  placesLeft = selectedSlot ? selectedSlot.placesLeft : 0;
  if (placesLeft <= 0) {
    feedback.textContent = "No places left for this slot.";
    feedback.className = "feedback error";
    return;
  }
  const existingReg = userRegistrationsByGroup[selectedSlot.time_group];
  if (existingReg) {
    feedback.textContent =
      "You already have a registration for this time group. You can edit the names and update.";
    feedback.className = "feedback";
    const names = existingReg.names || [];
    clearNameInputs();
    const firstInput = document.querySelector(".name-input");
    if (firstInput) firstInput.value = names[0] || "";
    for (let i = 1; i < names.length; i++) {
      addNameInput(names[i]);
    }
    namesList.style.display = "block";
    addNameBtn.style.display = "block";
    updateNameInputs();
    submitBtn.textContent = "Update Registration";
    submitBtn.style.display = "block";
    submitBtn.setAttribute("data-edit-id", existingReg.id);
  } else {
    feedback.textContent = "";
    namesList.style.display = "block";
    addNameBtn.style.display = "block";
    updateNameInputs();
    submitBtn.textContent = "Submit Registration";
    submitBtn.style.display = "block";
    submitBtn.removeAttribute("data-edit-id");
  }
});

function addNameInput(value = "") {
  const wrapper = document.createElement("div");
  wrapper.style.display = "flex";
  wrapper.style.alignItems = "center";
  const input = document.createElement("input");
  input.type = "text";
  input.className = "name-input";
  input.placeholder = "Name";
  input.value = value;
  wrapper.appendChild(input);
  namesList.appendChild(wrapper);
  input.addEventListener("input", updateNameInputs);
}

function updateNameInputs() {
  const nameInputs = document.querySelectorAll(".name-input");
  if (nameInputs.length > placesLeft) {
    for (let i = nameInputs.length - 1; i >= placesLeft; i--) {
      nameInputs[i].parentElement.remove();
    }
  }
  document.querySelectorAll(".remove-name-btn").forEach((btn) => btn.remove());
  nameInputs.forEach((input, i) => {
    if (i > 0) {
      if (
        !input.nextSibling ||
        !input.nextSibling.classList ||
        !input.nextSibling.classList.contains("remove-name-btn")
      ) {
        const removeBtn = document.createElement("button");
        removeBtn.type = "button";
        removeBtn.textContent = "✕";
        removeBtn.className = "remove-name-btn";
        removeBtn.style.marginLeft = "8px";
        removeBtn.onclick = () => {
          input.parentElement.remove();
          updateNameInputs();
        };
        input.after(removeBtn);
      }
    }
  });
  addNameBtn.style.display = nameInputs.length < placesLeft ? "block" : "none";
  const atLeastOne = Array.from(nameInputs).some((input) => input.value.trim());
  submitBtn.style.display = atLeastOne ? "block" : "none";
}

addNameBtn.addEventListener("click", () => {
  const nameInputs = document.querySelectorAll(".name-input");
  if (nameInputs.length < placesLeft) {
    addNameInput();
    updateNameInputs();
  }
});

namesList.addEventListener("input", updateNameInputs);

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  feedback.textContent = "";
  feedback.className = "feedback";
  const user = window.nahalalSession.getSession();
  if (!selectedSlot) {
    feedback.textContent = "Please select a time slot.";
    feedback.className = "feedback error";
    return;
  }
  const names = Array.from(document.querySelectorAll(".name-input"))
    .map((input) => input.value.trim())
    .filter((n) => n);
  if (!names.length) {
    feedback.textContent = "Please enter at least one name.";
    feedback.className = "feedback error";
    return;
  }
  if (names.length > placesLeft) {
    feedback.textContent = `You can only register up to ${placesLeft} people for this slot.`;
    feedback.className = "feedback error";
    return;
  }
  const editId = submitBtn.getAttribute("data-edit-id");
  if (editId) {
    const { error } = await supabase
      .from("registrations")
      .update({ names, time_slot_id: selectedSlot.id })
      .eq("id", editId);
    if (error) {
      feedback.textContent = `Error updating registration: ${error.message}`;
      feedback.className = "feedback error";
    } else {
      feedback.textContent = "Registration updated!";
      feedback.className = "feedback success";
      form.reset();
      window.location.href = "registrations.html";
    }
  } else {
    const existingReg = userRegistrationsByGroup[selectedSlot.time_group];
    if (existingReg) {
      feedback.textContent =
        "You already have a registration for this time group.";
      feedback.className = "feedback error";
      return;
    }
    const { error } = await supabase.from("registrations").insert([
      {
        user_id: user.id,
        time_slot_id: selectedSlot.id,
        names,
      },
    ]);
    if (error) {
      feedback.textContent = `Error: ${error.message}`;
      feedback.className = "feedback error";
    } else {
      feedback.textContent = "Registration successful!";
      feedback.className = "feedback success";
      form.reset();
      window.location.href = "registrations.html";
    }
  }
});

if (!window.nahalalSession.isLoggedIn()) {
  window.location.href = "login.html";
}
