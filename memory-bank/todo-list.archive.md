# TODO List & Page Breakdown: Nahalal Pool Registration (ARCHIVE)

## Checklist

- [x] Login Page
- [x] Home/Main Page
- [x] Registration Form Page
- [x] Previous Registrations Page
- [x] General Shared Table View Page
- [x] Admin Home Page
- [x] Admin: Time Slot Management Page
- [x] Admin: User List Management Page
- [x] Admin: Reports Page

---

## Page-by-Page Breakdown

### 1. Login Page

- [x] UI for email login (regular user)
- [x] UI for username+password login (admin)
- [ ] Supabase Auth integration
- [ ] Error handling and feedback
- [ ] Redirect to appropriate home page based on role

### 2. Home/Main Page

- [x] Welcome message and user info
- [x] Navigation to registration form, previous registrations, shared table
- [x] If admin, navigation to admin area

### 3. Registration Form Page

- [x] List available time slots (from Supabase)
- [x] Form to select slot and enter names of accompanying people
- [x] Submit registration to Supabase
- [x] Handle slot capacity and time group restrictions
- [x] Success/failure feedback

### 4. Previous Registrations Page

- [x] List all user's registrations (past and future)
- [x] Allow cancellation of future registrations
- [x] Confirmation dialogs for cancellation

### 5. General Shared Table View Page

- [x] Table of all upcoming time slots
- [x] Show names of registered users for each slot
- [x] Real-time updates (optional)

### 6. Admin Home Page

- [x] Dashboard with links to all admin functions
- [x] Show summary stats (optional)

### 7. Admin: Time Slot Management Page

- [x] Create, edit, and delete time slots
- [x] Set max participants, time group, publish status
- [x] List and filter existing slots

### 8. Admin: User List Management Page

- [x] Upload CSV or enter emails manually
- [x] Edit/delete users
- [x] Assign roles (admin/regular)

### 9. Admin: Reports Page

- [x] Export all current registrations
- [x] Report users registered twice in the same time group
- [x] Download as CSV or view in browser
