# Tech Context: Nahalal Pool Registration

## Technologies Used

- GitHub Pages (static hosting)
- Supabase (database, authentication, API)
- HTML, CSS, JavaScript (no frameworks requiring bundling)

## Development Setup

- All frontend code is static and deployable to GitHub Pages
- Supabase project must be configured with the required tables and authentication

## Technical Constraints

- No backend server; all logic must be handled in the frontend or via Supabase
- Admin authentication must be secure (username + password)
- Regular user authentication is email-based

## Dependencies

- Supabase JS client
- (Optional) Lightweight JS libraries for UI, as long as they do not require a build step
