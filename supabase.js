import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://jykdtigxiejzqwmihoto.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5a2R0aWd4aWVqenF3bWlob3RvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEyMTM3NjgsImV4cCI6MjA5Njc4OTc2OH0.IMvPPpBugBkzRVlndpIC2ylYQKLelr0royPufLRPaSc'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

export function getDeviceId() {
  let id = localStorage.getItem('grind_device_id')
  if (!id) {
    id = 'user_' + Math.random().toString(36).slice(2) + Date.now().toString(36)
    localStorage.setItem('grind_device_id', id)
  }
  return id
}
