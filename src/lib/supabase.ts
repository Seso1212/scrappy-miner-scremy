
import { createClient } from '@supabase/supabase-js';

// Default values for development when env vars aren't available
const DEFAULT_SUPABASE_URL = 'https://your-supabase-project.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'your-anon-key';

// Get environment variables or use defaults
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper function to get user from session
export const getCurrentUser = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user;
};

// Console log to help with debugging
if (supabaseUrl === DEFAULT_SUPABASE_URL) {
  console.warn('Using default Supabase URL. Set VITE_SUPABASE_URL for production.');
}
