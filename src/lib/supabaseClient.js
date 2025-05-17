import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fgmrfpufpdrxqldlgtna.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnbXJmcHVmcGRyeHFsZGxndG5hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc0ODQxMTksImV4cCI6MjA2MzA2MDExOX0.fEx3An17srekhamdVJOa3Vvc7dJgM_V6TAVBSYF5mOw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
