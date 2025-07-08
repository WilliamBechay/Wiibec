import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ezxsvimqwrqzzcfyohft.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6eHN2aW1xd3JxenpjZnlvaGZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4Njc0NzEsImV4cCI6MjA2NzQ0MzQ3MX0.6DZIgzDWUErAvTYGgEeJ0r0leN_MaQ3olGyRREu-GJU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);