import { createClient } from '@supabase/supabase-js';

// Get Supabase credentials from environment variables
// Create a .env file in the root with:
// REACT_APP_SUPABASE_URL=your_supabase_url
// REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Check if Supabase is properly configured
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey && 
  supabaseUrl !== 'https://placeholder.supabase.co' && 
  supabaseAnonKey !== 'placeholder-key');

// Create a dummy client if env vars are missing to prevent app crash
// The app will show errors in console but won't crash
let supabase;
if (!isSupabaseConfigured) {
  console.warn(
    '⚠️ Supabase is not configured. Running in demo mode - authentication and search history features are disabled. AI simplification will still work.'
  );
  // Create a dummy client with placeholder values to prevent crashes
  supabase = createClient('https://placeholder.supabase.co', 'placeholder-key');
} else {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

export { supabase };

