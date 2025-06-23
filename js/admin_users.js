// Placeholder: Handle CSV upload, user creation, and display users
const csvForm = document.getElementById("csv-upload-form");
const csvFeedback = document.getElementById("csv-feedback");
const userForm = document.getElementById("user-form");
const userFeedback = document.getElementById("user-feedback");
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

// Helper: SHA-256 hash (browser-native)
async function sha256(str) {
  const buf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(str)
  );
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Fetch and render all users
async function fetchUsers() {
  const { data, error } = await supabase
    .from("users")
    .select("id, email, name, role")
    .order("email", { ascending: true });
  if (error) {
    tableContainer.innerHTML = `<p class='error'>Error loading users: ${error.message}</p>`;
    return;
  }
  renderTable(data || []);
}

userForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  userFeedback.textContent = "";
  const email = document.getElementById("user-email").value.trim();
  const name = document.getElementById("user-name").value.trim();
  const role = document.getElementById("user-role").value;
  let password = null;
  if (role === "admin") {
    password = prompt("Set a password for this admin user:");
    if (!password) {
      userFeedback.textContent = "Password required for admin user.";
      userFeedback.className = "feedback error";
      return;
    }
    password = await sha256(password);
  }
  const { error } = await supabase
    .from("users")
    .insert([{ email, name, role, password }]);
  if (error) {
    userFeedback.textContent = `Error: ${error.message}`;
    userFeedback.className = "feedback error";
  } else {
    userFeedback.textContent = "User added!";
    userFeedback.className = "feedback success";
    userForm.reset();
    fetchUsers();
  }
});

function renderTable(users) {
  if (!users.length) {
    tableContainer.innerHTML = "<p>No users found.</p>";
    return;
  }
  let html =
    "<table><thead><tr><th>Email</th><th>Name</th><th>Role</th><th>Actions</th></tr></thead><tbody>";
  users.forEach((user) => {
    html += `<tr>
      <td>${user.email}</td>
      <td>${user.name}</td>
      <td>
        <select class="role-select" data-id="${user.id}">
          <option value="regular"${
            user.role === "regular" ? " selected" : ""
          }>Regular</option>
          <option value="admin"${
            user.role === "admin" ? " selected" : ""
          }>Admin</option>
        </select>
      </td>
      <td>
        <button class="action-btn save" data-id="${user.id}">Save</button>
        <button class="action-btn delete" data-id="${user.id}">Delete</button>
      </td>
    </tr>`;
  });
  html += "</tbody></table>";
  tableContainer.innerHTML = html;

  // Save role changes
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
        userFeedback.textContent = `Error: ${error.message}`;
        userFeedback.className = "feedback error";
      } else {
        userFeedback.textContent = "Role updated!";
        userFeedback.className = "feedback success";
        fetchUsers();
      }
    });
  });
  // Delete user
  document.querySelectorAll(".delete").forEach((btn) => {
    btn.addEventListener("click", async () => {
      if (confirm("Delete this user?")) {
        const id = btn.getAttribute("data-id");
        const { error } = await supabase.from("users").delete().eq("id", id);
        if (error) {
          userFeedback.textContent = `Error: ${error.message}`;
          userFeedback.className = "feedback error";
        } else {
          userFeedback.textContent = "User deleted.";
          userFeedback.className = "feedback success";
          fetchUsers();
        }
      }
    });
  });
}

// TODO: Implement CSV upload logic

fetchUsers();
