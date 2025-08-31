import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vobyqvmtygsstakxjtph.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvYnlxdm10eWdzc3Rha3hqdHBoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2MjQyNjksImV4cCI6MjA3MjIwMDI2OX0.l-PxEOg8o-tL5xpk3XZqmHNvtF32WnBjjPkAIRwGjjg';

export const supabase = createClient(supabaseUrl, supabaseKey);