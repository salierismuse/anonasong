import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types matching your new schema
export interface Garden {
  id: string
  name: string
  display_name: string
  garden_index: number
  created_at: string
  updated_at: string
  flower_count: number
}

export interface Flower {
  id: string
  garden_id: string
  song_input: string
  song_type: string
  flower_type: string
  note?: string
  planted_at: string
}

// Constraints from design doc
export const GARDEN_CONSTRAINTS = {
  FLOWERS_PER_PAGE: 24, // Pagination limit, not a max
  MAX_NOTE_CHARACTERS: 100,
  MAX_NAME_LENGTH: 15,
} as const
