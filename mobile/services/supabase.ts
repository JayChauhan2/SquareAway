import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing Supabase configuration. Please set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in your .env file.");
    // We can't throw here comfortably without crashing the app immediately on import, 
    // but it's better to fail fast or handle it in the UI. 
    // Taking the generated plan advises throwing or logging.
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

