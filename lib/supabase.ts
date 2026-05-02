import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Job = {
  id: string
  created_at: string
  title: string
  department: string
  location: string
  type: string
  status: string
  closing_date: string
  description: string
  scoring_criteria: any
}

export type Applicant = {
  id: string
  created_at: string
  job_id: string
  name: string
  email: string
  phone: string
  answers: any
  grade: string
  score: number
  score_breakdown: any
  score_summary: string
  status: string
  activity_log: any[]
  jobs?: Job
}
