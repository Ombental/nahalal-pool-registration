const SUPABASE_URL = "https://ajoipxispnkoussptzfp.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqb2lweGlzcG5rb3Vzc3B0emZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2NzU1MjAsImV4cCI6MjA2NjI1MTUyMH0.2Mm4tkKZfcXA6_TGNtr-k-4C-CTEXAq17x7OSUZ56p8";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// For ES module style imports (if needed):
// export default supabase;
