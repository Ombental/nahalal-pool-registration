# nahalal-pool-registration

## Project Overview

A web app for managing pool time slot registrations, with admin and regular user roles. Static frontend (HTML, JS, CSS) hosted on GitHub Pages, Supabase as backend.

## Current Status

- All main pages scaffolded
- Next phase: Refactor file/directory structure, Supabase integration, authentication/session handling

## Static Hosting & Entry Point

- The app is designed for static hosting on GitHub Pages.
- **index.html** at the project root is the entry point for all users.
- On load, `index.html` checks for a Supabase session:
  - If logged in, redirects to `pages/home.html`.
  - If not logged in, redirects to `pages/login.html`.
- All navigation should be through `index.html` to ensure compatibility with GitHub Pages' static file serving (no server-side routing).

## Planned File/Directory Structure

```
/
├── index.html
├── pages/
│   ├── login.html
│   ├── home.html
│   ├── registration.html
│   ├── registrations.html
│   ├── table.html
│   ├── admin.html
│   ├── admin_slots.html
│   ├── admin_users.html
│   └── admin_reports.html
├── js/
│   ├── login.js
│   ├── home.js
│   ├── registration.js
│   ├── registrations.js
│   ├── table.js
│   ├── admin.js
│   ├── admin_slots.js
│   ├── admin_users.js
│   └── admin_reports.js
├── css/
│   └── (optional: shared or page-specific CSS files)
├── memory-bank/
│   └── ...
└── README.md
```

## Refactor Plan

1. Move HTML files to `/pages`, JS files to `/js`, and (optionally) CSS to `/css`
2. Update all script and link references in HTML files
3. Ensure a clean, scalable project layout
4. Begin Supabase integration and authentication/session handling
