# TODO List: Refactor & Integrate Core Functionality

## Checklist

- [x] Refactor file and directory structure
- [ ] Supabase integration for all data operations
- [ ] Authentication, session handling, and authorization

---

## Breakdown

### 1. Refactor File and Directory Structure

- [x] Organize HTML, JS, and CSS into appropriate folders (e.g., /pages, /js, /css)
- [x] Update all script and link references in HTML files
- [x] Ensure a clean, scalable project layout

### 2. Supabase Integration

- [ ] Set up Supabase project URL and anon/public key in a config file
- [ ] Implement Supabase client initialization in JS
- [ ] Replace all placeholder data fetches with real Supabase queries (CRUD for users, slots, registrations)
- [ ] Handle errors and loading states for all data operations

### 3. Authentication, Session Handling, Authorization

- [ ] Integrate Supabase Auth for login (email for regular, username+password for admin)
- [ ] Store and manage user session (localStorage/sessionStorage or Supabase session)
- [ ] Protect routes/pages based on user role (redirect if unauthorized)
- [ ] Implement logout functionality
- [ ] Enforce authorization for admin actions (UI and Supabase RLS)
