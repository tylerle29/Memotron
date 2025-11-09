import { createClient } from "@supabase/supabase-js"

// Environment variables for Supabase connection
// NEXT_PUBLIC_SUPABASE_URL: Your Supabase project URL
// NEXT_PUBLIC_SUPABASE_ANON_KEY: Your Supabase anonymous API key
const supabaseUrl = "https://qfestqwayjkhsxzxtihr.supabase.co"
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmZXN0cXdheWpraHN4enh0aWhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2NDgzMjcsImV4cCI6MjA3ODIyNDMyN30.zWUaYk3xs4rWDxiETQuyl2fRf4WbUdRl_b8_C8wjNr8"

// Initialize and export Supabase client
// This client is used for all database operations (fetch, insert, update, delete)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
