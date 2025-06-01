// This file sets up the connection to Supabase, our online database service.
// You need to replace the placeholders with your actual Supabase project URL and anon key.
// You can find these in your Supabase project settings under 'API'.

import { createClient } from '@supabase/supabase-js';

// TODO: Replace these with your own Supabase project details
const supabaseUrl = 'https://your-project.supabase.co'; // <-- Your Supabase URL
const supabaseAnonKey = 'your-anon-key'; // <-- Your Supabase anon key

// This creates a client we can use to talk to Supabase from anywhere in our app
export const supabase = createClient(supabaseUrl, supabaseAnonKey); 