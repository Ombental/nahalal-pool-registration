-- MIGRATION: Add names array field to users table

alter table users
  add column names text[]; 