// supabase.js
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

export const supabase = createClient(
  'https://kkeeyedxfgeffvfjxapu.supabase.co',   // paste your Project URL
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrZWV5ZWR4ZmdlZmZ2Zmp4YXB1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwMjY4NzgsImV4cCI6MjA4OTYwMjg3OH0.UIwa13zvQWF_Equ8v1p4ItrDD2Vkqhztk4hhYS056JM'                           // paste your anon key
)
