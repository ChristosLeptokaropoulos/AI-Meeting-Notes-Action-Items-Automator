import { createClient } from '@supabase/supabase-js';

// These values come from .env.local
// NextJS automatically loads them at build/runtime
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Create and export a single Supabase client instance
export const supabase = createClient(supabaseUrl, supabaseKey);
