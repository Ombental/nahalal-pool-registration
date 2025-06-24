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
let userNamesOptions = [];
let userNamesUsedByGroup = {};

// i18n: Hebrew translations
const i18n = {
  selectDate: "בחר תאריך",
  selectTimeRange: "בחר טווח זמן",
  namesOfPeople: "שמות רשומים",
  addAnotherName: "הוסף שם נוסף",
  submitRegistration: "שלח הרשמה",
  updateRegistration: "עדכן הרשמה",
  pleaseSelectAtLeastOneName: "יש לבחור לפחות שם אחד",
  pleaseSelectTimeSlot: "יש לבחור משבצת זמן",
  noPlacesLeft: "אין מקומות פנויים למשבצת זו",
  registrationSuccess: "ההרשמה בוצעה בהצלחה",
  registrationUpdated: "ההרשמה עודכנה בהצלחה",
  maxPeople: (x) => `ניתן להירשם עד ${x} אנשים`,
  nameAlreadyUsed: (n) => `השם '${n}' כבר נרשם לקבוצה זו`,
  pleaseEnterAtLeastOneName: "יש להזין לפחות שם אחד",
  pleaseEnterTimeSlot: "יש לבחור משבצת זמן",
  noAvailableDates: "אין תאריכים זמינים",
  selectDateOption: "-- בחר תאריך --",
  selectTimeRangeOption: "-- בחר טווח זמן --",
  placesLeft: (x) => `| ${x} מקומות פנויים`,
  remove: "הסר",
  errorLoadingSlots: "שגיאה בטעינת משבצות זמן",
  errorLoadingRegistrations: "שגיאה בטעינת הרשמות",
  error: (msg) => `שגיאה: ${msg}`,
  allRegistered: "נרשמת לכל המשבצות זמן האפשריות!",
};

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
    dateSelect.innerHTML = `<option value="">${i18n.errorLoadingSlots}</option>`;
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
    dateSelect.innerHTML = `<option value="">${i18n.errorLoadingRegistrations}</option>`;
    return;
  }
  const slotIdToCount = {};
  userRegistrationsByGroup = {};
  regs.forEach((r) => {
    slotIdToCount[r.time_slot_id] =
      (slotIdToCount[r.time_slot_id] || 0) + (r.names ? r.names.length : 0);
    if (r.time_slots && r.time_slots.time_group) {
      // Track all names used in this group
      const group = r.time_slots.time_group;
      if (!userNamesUsedByGroup[group]) userNamesUsedByGroup[group] = new Set();
      (r.names || []).forEach((n) => userNamesUsedByGroup[group].add(n));
      // Track the registration object for this group (for legacy logic)
      userRegistrationsByGroup[group] = r;
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
  dateSelect.innerHTML = `<option value="">${i18n.selectDateOption}</option>`;
  feedback.textContent = "";
  form.style.display = "block";
  let noDates = true;
  uniqueDates.forEach((date) => {
    // Only include dates with at least one slot that is not in a full group
    const slotsForDate = slotsByDate[date].filter((slot) => {
      const group = slot.time_group;
      const used = userNamesUsedByGroup[group]
        ? userNamesUsedByGroup[group].size
        : 0;
      return used < userNamesOptions.length;
    });
    if (slotsForDate.length > 0) {
      const day = new Date(date);
      const dayName = day.toLocaleDateString("he-IL", { weekday: "long" });
      const dayMonth = day.toLocaleDateString("he-IL", {
        day: "2-digit",
        month: "2-digit",
      });
      dateSelect.innerHTML += `<option value="${date}">${dayName} ${dayMonth}</option>`;
      noDates = false;
    }
  });
  if (noDates) {
    dateSelect.innerHTML = `<option value="">${i18n.noAvailableDates}</option>`;
    // Show message if user has registered to everything possible
    feedback.textContent = i18n.allRegistered;
    feedback.className = "feedback success";
  }
}

function clearNameInputs() {
  Array.from(document.querySelectorAll(".name-input")).forEach((input, i) => {
    if (i > 0) input.remove();
    input.value = "";
  });
}

dateSelect.addEventListener("change", () => {
  timeSelect.innerHTML = `<option value="">${i18n.selectTimeRangeOption}</option>`;
  timeRangeSection.style.display = "none";
  namesList.style.display = "none";
  addNameBtn.style.display = "none";
  submitBtn.style.display = "none";
  selectedSlot = null;
  if (!dateSelect.value) return;
  const slotsForDate = slotsByDate[dateSelect.value] || [];
  slotsForDate.forEach((slot) => {
    timeSelect.innerHTML += `<option value="${slot.id}">${slot.start_time} - ${
      slot.end_time
    } | ${slot.placesLeft} ${i18n.placesLeft(slot.placesLeft)}</option>`;
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
  // Check if the selected slot's group is full (shouldn't happen, but guard)
  const group = selectedSlot ? selectedSlot.time_group : null;
  const used =
    group && userNamesUsedByGroup[group] ? userNamesUsedByGroup[group].size : 0;
  if (placesLeft <= 0 || (group && used >= userNamesOptions.length)) {
    feedback.textContent = i18n.noPlacesLeft;
    feedback.className = "feedback error";
    return;
  }
  // Always show a blank form for new registrations (do not block by group)
  feedback.textContent = "";
  namesList.style.display = "block";
  addNameBtn.style.display = "block";
  updateNameInputs();
  submitBtn.textContent = i18n.submitRegistration;
  submitBtn.style.display = "block";
  submitBtn.removeAttribute("data-edit-id");
});

// Fetch user names from session on load
function getUserNames() {
  const user = window.nahalalSession.getSession();
  return user && user.names ? user.names : [];
}

function addNameInput(value = "") {
  const wrapper = document.createElement("div");
  wrapper.style.display = "flex";
  wrapper.style.alignItems = "center";
  const select = document.createElement("select");
  select.className =
    "name-input w-full p-2 border border-gray-300 rounded-md mb-2";
  select.placeholder = i18n.namesOfPeople;
  // Determine available options (exclude already selected and already used in group)
  const nameInputs = Array.from(document.querySelectorAll(".name-input"));
  const selectedNames = nameInputs.map((input) => input.value).filter((n) => n);
  const group = selectedSlot ? selectedSlot.time_group : null;
  const usedInGroup =
    group && userNamesUsedByGroup[group]
      ? Array.from(userNamesUsedByGroup[group])
      : [];
  let available = userNamesOptions.filter(
    (name) => !selectedNames.includes(name) && !usedInGroup.includes(name)
  );
  // If value is provided and available, use it; otherwise, select the first available
  let selected =
    value && available.includes(value) ? value : available[0] || "";
  available.forEach((name) => {
    const option = document.createElement("option");
    option.value = name;
    option.textContent = name;
    if (name === selected) option.selected = true;
    select.appendChild(option);
  });
  wrapper.appendChild(select);
  // Add remove (X) button if more than one name input
  if (document.querySelectorAll(".name-input").length > 0) {
    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.innerHTML = "";
    removeBtn.title = i18n.remove;
    removeBtn.className = "remove-name-btn text-red-500 ml-2";
    removeBtn.style.background = "none";
    removeBtn.style.border = "none";
    removeBtn.style.fontSize = "1.2em";
    removeBtn.style.cursor = "pointer";
    removeBtn.onclick = () => {
      wrapper.remove();
      updateNameInputs();
    };
    wrapper.appendChild(removeBtn);
  }
  namesList.appendChild(wrapper);
  select.addEventListener("input", updateNameInputs);
  // Immediately update all dropdowns to reflect this selection
  updateNameInputs();
}

function updateNameInputs() {
  const nameInputs = Array.from(document.querySelectorAll(".name-input"));
  // Get all selected values
  const selectedNames = nameInputs.map((input) => input.value).filter((n) => n);
  const group = selectedSlot ? selectedSlot.time_group : null;
  const usedInGroup =
    group && userNamesUsedByGroup[group]
      ? Array.from(userNamesUsedByGroup[group])
      : [];
  // For each select, update its options to exclude already selected names in other selects and already used in group
  nameInputs.forEach((select, idx) => {
    const currentValue = select.value;
    // Save scroll position and focus
    const isFocused = document.activeElement === select;
    const scrollTop = select.scrollTop;
    // Remove all options
    while (select.firstChild) select.removeChild(select.firstChild);
    // Build available options: all userNamesOptions except those selected in other selects and already used in group
    const available = userNamesOptions.filter((name) => {
      // Allow the current select to keep its value
      return (
        (!selectedNames.includes(name) || name === currentValue) &&
        !usedInGroup.includes(name)
      );
    });
    available.forEach((name) => {
      const option = document.createElement("option");
      option.value = name;
      option.textContent = name;
      if (name === currentValue) option.selected = true;
      select.appendChild(option);
    });
    // Restore focus and scroll
    if (isFocused) {
      select.focus();
      select.scrollTop = scrollTop;
    }
  });
  // Hide addNameBtn if all names are used
  if (
    nameInputs.length + (usedInGroup ? usedInGroup.length : 0) >=
    userNamesOptions.length
  ) {
    addNameBtn.style.display = "none";
  } else {
    addNameBtn.style.display = "block";
  }
  const atLeastOne = nameInputs.some((input) => input.value.trim());
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
    feedback.textContent = i18n.pleaseSelectTimeSlot;
    feedback.className = "feedback error";
    return;
  }
  const group = selectedSlot ? selectedSlot.time_group : null;
  const usedInGroup =
    group && userNamesUsedByGroup[group]
      ? Array.from(userNamesUsedByGroup[group])
      : [];
  const names = Array.from(document.querySelectorAll(".name-input"))
    .map((select) => select.value.trim())
    .filter((n) => n);
  if (!names.length) {
    feedback.textContent = i18n.pleaseSelectAtLeastOneName;
    feedback.className = "feedback error";
    return;
  }
  // Check for duplicate names in the group
  for (const n of names) {
    if (usedInGroup.includes(n)) {
      feedback.textContent = i18n.nameAlreadyUsed(n);
      feedback.className = "feedback error";
      return;
    }
  }
  if (names.length > placesLeft) {
    feedback.textContent = i18n.maxPeople(placesLeft);
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
      feedback.textContent = i18n.error(`עדכון הרשמה: ${error.message}`);
      feedback.className = "feedback error";
    } else {
      feedback.textContent = i18n.registrationUpdated;
      feedback.className = "feedback success";
      form.reset();
      window.location.href = "registrations.html";
    }
  } else {
    // No longer block if user already has a registration in this group
    const { error } = await supabase.from("registrations").insert([
      {
        user_id: user.id,
        time_slot_id: selectedSlot.id,
        names,
      },
    ]);
    if (error) {
      feedback.textContent = i18n.error(error.message);
      feedback.className = "feedback error";
    } else {
      feedback.textContent = i18n.registrationSuccess;
      feedback.className = "feedback success";
      form.reset();
      window.location.href = "registrations.html";
    }
  }
});

if (!window.nahalalSession.isLoggedIn()) {
  window.location.href = "login.html";
}

// Ensure slots and registrations are loaded on page load
loadSlotsAndRegistrations();

// On page load, set userNamesOptions
userNamesOptions = getUserNames();
