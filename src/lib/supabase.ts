import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for our database tables
export type Chore = {
  id: number;
  name: string;
  assigned_to: string;
  frequency: number;
  created_at: string;
  last_completed: string | null;
  household_id: string;
};

export type Household = {
  id: string;
  name: string;
  created_at: string;
};

export type Roommate = {
  id: string;
  name: string;
  household_id: string;
  created_at: string;
}; 