import { createClient } from '@supabase/supabase-js';

// Get Supabase credentials from environment variables
// Create a .env file in the root with:
// REACT_APP_SUPABASE_URL=your_supabase_url
// REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please create a .env file with REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

