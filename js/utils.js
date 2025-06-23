// js/utils.js
// Common utility functions for the Nahalal Pool Registration app

// SHA-256 hash (browser-native, async)
async function sha256(str) {
  const buf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(str)
  );
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Feedback message utility
function setFeedback(element, msg, isError = false) {
  if (!element) return;
  element.textContent = msg;
  element.className = isError ? "feedback error" : "feedback success";
}

// Array to CSV string
function arrayToCSV(arr, columns) {
  const escape = (str) => '"' + String(str).replace(/"/g, '""') + '"';
  const header = columns.map(escape).join(",");
  const rows = arr.map((row) =>
    columns
      .map((col) =>
        escape(Array.isArray(row[col]) ? row[col].join("; ") : row[col] ?? "")
      )
      .join(",")
  );
  return [header, ...rows].join("\r\n");
}

// Download CSV file
function downloadCSV(filename, csv) {
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 0);
}

// Check if a slot is in the future (date/time logic)
function isFutureSlot(slot, now = new Date()) {
  const slotDate = new Date(slot.date);
  if (slotDate > now) return true;
  if (slotDate.toISOString().slice(0, 10) === now.toISOString().slice(0, 10)) {
    const slotEnd = new Date(slot.date + "T" + slot.end_time);
    return slotEnd > now;
  }
  return false;
}

// Assign a consistent color to each group (for admin slots)
const groupColors = {};
const colorPalette = [
  "#e3f2fd",
  "#ffe0b2",
  "#e1bee7",
  "#c8e6c9",
  "#fff9c4",
  "#f8bbd0",
  "#d7ccc8",
  "#b2dfdb",
  "#f0f4c3",
  "#f5e1a4",
];
function getGroupColor(group) {
  if (!groupColors[group]) {
    const idx = Object.keys(groupColors).length % colorPalette.length;
    groupColors[group] = colorPalette[idx];
  }
  return groupColors[group];
}

// Expose globally for browser usage
window.nahalalUtils = {
  sha256,
  setFeedback,
  arrayToCSV,
  downloadCSV,
  isFutureSlot,
  getGroupColor,
};
