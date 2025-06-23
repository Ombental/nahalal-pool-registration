-- INITIAL MIGRATION: Nahalal Pool Registration

-- USERS TABLE
create table users (
    id uuid primary key default gen_random_uuid(),
    email text unique not null,
    name text not null,
    role text not null check (role in ('admin', 'regular')),
    password text, -- nullable for regular users
    created_at timestamp with time zone default timezone('utc', now())
);

-- TIME_SLOTS TABLE
create table time_slots (
    id uuid primary key default gen_random_uuid(),
    date date not null,
    start_time time not null,
    end_time time not null,
    max_participants integer not null,
    time_group text not null,
    published boolean not null default false,
    created_by uuid references users(id),
    created_at timestamp with time zone default timezone('utc', now())
);

-- REGISTRATIONS TABLE
create table registrations (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references users(id) not null,
    time_slot_id uuid references time_slots(id) not null,
    names text[] not null, -- array of names for people coming with the user
    created_at timestamp with time zone default timezone('utc', now())
);

-- Indexes for performance (optional but recommended)
create index on registrations (user_id);
create index on registrations (time_slot_id);
create index on time_slots (date); 