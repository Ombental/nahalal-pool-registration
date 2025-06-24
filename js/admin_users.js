// Placeholder: Handle CSV upload, user creation, and display users
const csvForm = document.getElementById("csv-upload-form");
const csvFeedback = document.getElementById("csv-feedback");
const tableContainer = document.getElementById("users-table-container");

// Session and admin check using custom session
if (!window.nahalalSession.isLoggedIn()) {
  window.location.href = "login.html";
} else if (!window.nahalalSession.isAdmin()) {
  window.location.href = "home.html";
} else {
  const user = window.nahalalSession.getSession();
  // User management logic can use user info here
}

// i18n: Hebrew translations
const i18n = {
  uploadUsers: "העלאת משתמשים (CSV)",
  addUser: "הוסף משתמש",
  errorLoadingUsers: "שגיאה בטעינת משתמשים",
  userAdded: "משתמש נוסף בהצלחה",
  noUsersFound: "לא נמצאו משתמשים",
  action: "פעולה",
  email: "אימייל",
  names: "שמות",
  role: "תפקיד",
  remove: "הסר",
  error: (msg) => `שגיאה: ${msg}`,
};

// Fetch and render all users
async function fetchUsers() {
  const { data, error } = await supabase
    .from("users")
    .select("id, email, name, role, names")
    .order("email", { ascending: true });
  if (error) {
    tableContainer.innerHTML = `<p class='error'>${i18n.errorLoadingUsers}: ${error.message}</p>`;
    return;
  }
  renderTable(data || []);
}

function setUserFeedback(msg, isError) {
  window.nahalalUtils.setFeedback(csvFeedback, msg, isError);
}

function renderTable(users) {
  if (!users.length) {
    tableContainer.innerHTML = `<p>${i18n.noUsersFound}</p>`;
    return;
  }
  let html = `<div class='overflow-x-auto w-full'>
      <table class='min-w-full table-auto border-separate border-spacing-x-4 border-spacing-y-2 bg-white rounded shadow'>
        <thead>
          <tr>
            <th class='px-6 py-3 text-left border-b'>${i18n.email}</th>
            <th class='px-6 py-3 text-left border-b'>${i18n.names}</th>
            <th class='px-6 py-3 text-left border-b'>${i18n.role}</th>
            <th class='px-6 py-3 text-left border-b'>${i18n.action}</th>
          </tr>
        </thead>
        <tbody>`;
  users.forEach((user) => {
    html += `<tr>
      <td class='px-6 py-3 border-b'>${user.email}</td>
      <td class='px-6 py-3 border-b'>${user.names ? user.names : ""}</td>
      <td class='px-6 py-3 border-b'>${user.role}</td>
      <td class='px-6 py-3 border-b'>
        <button class="action-btn delete bg-red-600 text-white rounded px-3 py-1 hover:bg-red-700 transition" data-id="${
          user.id
        }">${i18n.remove}</button>
      </td>
    </tr>`;
  });
  html += "</tbody></table></div>";
  tableContainer.innerHTML = html;
  addUserTableListeners();
}

function addUserTableListeners() {
  document.querySelectorAll(".save").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.getAttribute("data-id");
      const row = btn.closest("tr");
      const role = row.querySelector(".role-select").value;
      const { error } = await supabase
        .from("users")
        .update({ role })
        .eq("id", id);
      if (error) {
        setUserFeedback(`Error: ${error.message}`, true);
      } else {
        setUserFeedback("Role updated!", false);
        fetchUsers();
      }
    });
  });
  document.querySelectorAll(".delete").forEach((btn) => {
    btn.addEventListener("click", async () => {
      if (confirm("האם למחוק את המשתמש?")) {
        const id = btn.getAttribute("data-id");
        const { error } = await supabase.from("users").delete().eq("id", id);
        if (error) {
          setUserFeedback(i18n.error(error.message), true);
        } else {
          setUserFeedback("משתמש נמחק.", false);
          fetchUsers();
        }
      }
    });
  });
}

// CSV upload logic for users
csvForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  setUserFeedback("", false);
  const fileInput = document.getElementById("csv-upload");
  const file = fileInput.files[0];
  if (!file) {
    setUserFeedback("יש לבחור קובץ CSV.", true);
    return;
  }
  const reader = new FileReader();
  reader.onload = async (event) => {
    const text = event.target.result;
    const lines = text.split(/\r?\n/).filter((line) => line.trim());
    if (!lines.length) {
      setUserFeedback("קובץ ה-CSV ריק.", true);
      return;
    }
    const users = [];
    for (const line of lines) {
      const cols = line.split(",").map((col) => col.trim());
      if (cols.length < 3) continue; // Need at least email, first, last
      const email = cols[0];
      const name = cols[1] + " " + cols[2];
      const names = cols.slice(3).filter((n) => n);
      users.push({ email, name, role: "regular", names });
    }
    if (!users.length) {
      setUserFeedback("לא נמצאו משתמשים תקינים בקובץ.", true);
      return;
    }
    const { error } = await supabase.from("users").insert(users);
    if (error) {
      setUserFeedback(i18n.error(error.message), true);
    } else {
      setUserFeedback("משתמשים הועלו בהצלחה!", false);
      fetchUsers();
      fileInput.value = "";
    }
  };
  reader.readAsText(file);
});

fetchUsers();
