# Database Schema: Nahalal Pool Registration

## Tables

### users

- id (uuid, PK)
- email (text, unique)
- name (text)
- role (enum: 'admin', 'regular')
- password (text, nullable for regular users)
- created_at (timestamp)

### time_slots

- id (uuid, PK)
- date (date)
- start_time (time)
- end_time (time)
- max_participants (integer)
- time_group (text)
- published (boolean)
- created_by (uuid, FK -> users.id)
- created_at (timestamp)

### registrations

- id (uuid, PK)
- user_id (uuid, FK -> users.id)
- time_slot_id (uuid, FK -> time_slots.id)
- names (text[], array of names for people coming with the user)
- created_at (timestamp)

## Relationships

- Each registration links a user to a time slot
- Each time slot can have multiple registrations, up to max_participants
- Users can only register for one slot per time group

## Notes

- Admins are identified by role in users table and have a password
- Regular users are uploaded/managed by admin; password is null for them
- Each registration can include a list of names (text array) for additional people
- Supabase Row Level Security (RLS) should enforce registration and viewing permissions
