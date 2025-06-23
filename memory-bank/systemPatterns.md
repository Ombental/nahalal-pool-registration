# System Patterns: Nahalal Pool Registration

## Architecture

- Static frontend (HTML, CSS, JS) hosted on GitHub Pages
- Supabase as backend for authentication, database, and API
- No traditional backend server

## Key Technical Decisions

- All business logic handled in frontend or via Supabase (RLS, triggers, etc.)
- Admin and regular user roles managed via Supabase Auth and/or custom claims
- Time slot and registration logic enforced at both UI and database level

## Design Patterns

- SPA-like navigation using vanilla JS (no framework)
- Modular JS for separation of concerns (auth, API, UI, etc.)
- Supabase Row Level Security (RLS) for data protection

## Component Relationships

- Auth module manages login/logout and user roles
- Admin UI components for slot/user management and reports
- Registration form and table views for regular users
- All data interactions go through Supabase client
