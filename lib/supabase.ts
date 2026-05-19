import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://havxhrpvkmqknsmehiqo.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhhdnhocnB2a21xa25zbWVoaXFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyMDgzMTgsImV4cCI6MjA5NDc4NDMxOH0.FzzBarHZwk11YICVjceM8M8KDROhuZ9SkTT2jIdZRpw'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
