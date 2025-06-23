# Project Brief: Nahalal Pool Registration

## Project Scope

A web application to manage and register users for limited pool time slots, supporting both admin and regular users. The app will be hosted on GitHub Pages (static frontend) and use Supabase as the backend database and authentication provider.

## Core Requirements

- Allow regular users to register for available pool time slots, view and cancel their registrations, and see a shared table of upcoming slots and registrants.
- Allow admin users to define/edit time slots, upload/update the list of regular users, and export/view registration reports.
- Enforce registration limits per time slot and per "time group".
- Support two user types: Admin (with password) and Regular (email login).
- No traditional backend; all logic must be handled via frontend and Supabase API.

## Goals

- Simple, intuitive user experience for both admins and regular users.
- Secure authentication and authorization for admin actions.
- Accurate, real-time display of slot availability and registrations.
- Easy management and reporting for admins.

## Out of Scope

- Payment processing
- Mobile app (web only)
- Non-Supabase backends
