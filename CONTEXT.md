# Meridian HR — Project Context

## What it is
A white-label HR SaaS platform built for Val (a consultant) to sell to his clients.
Each client uses it to manage recruiting, people, and documents.
The platform is Meridian-branded; the candidate-facing application form is unbranded (white-label).

## Stack
- Next.js 16 (App Router, TypeScript)
- Tailwind CSS v4
- Supabase (Postgres database, no auth yet)
- Anthropic Claude API (AI scoring — to be wired up)
- Vercel (deployment)
- GitHub: https://github.com/patrickmaq/meridian-hr

## Design system
- Font: Plus Jakarta Sans (Google Fonts)
- Background: #F2F2F2
- Cards: #FFFFFF with 1px #E8E8E8 border, border-radius 20px
- Ink/text: #111111
- Muted text: #888888
- Buttons: pill shape (border-radius 999px), primary = black bg + white text
- Sidebar: white, black active state
- Illustrations: custom PNGs in /public/ (Higgsfield-generated, TinTin style)

## File structure
app/
  globals.css
  layout.tsx
  page.tsx (redirects to /dashboard/recruiting/applicants)
  apply/[jobId]/page.tsx  ← public candidate application form
  dashboard/
    layout.tsx
    recruiting/
      applicants/page.tsx  ← main hiring manager view
      jobs/page.tsx        ← job posting + form builder + scoring criteria
      pipelines/page.tsx
    people/
      employees/page.tsx
      performance/page.tsx
      training/page.tsx
    docs/
      procedures/page.tsx
      assessments/page.tsx
    settings/page.tsx

components/
  layout/
    Sidebar.tsx
    Topbar.tsx
  ui/
    StatCard.tsx
    Button.tsx
    Badge.tsx
    ScoreBar.tsx
    EmptyState.tsx  ← uses custom PNG illustrations

lib/
  supabase.ts  ← Supabase client + Job/Applicant types

public/
  illustration-applicants.png
  illustration-jobs.png
  illustration-docs.png

## Supabase tables
- jobs (id, title, department, location, type, status, closing_date, description, scoring_criteria jsonb)
- applicants (id, job_id, name, email, phone, answers jsonb, grade, score, score_breakdown jsonb, score_summary, status, activity_log jsonb)
- employees (id, name, email, role, department, start_date, status)
- performance_reviews (id, employee_id, cycle, overall_score, scores jsonb, notes, status)
- training_courses (id, title, description, assigned_to, due_date)
- training_records (id, employee_id, course_id, status, completed_at)
- documents (id, title, category, file_url, file_size)

RLS is disabled on all tables (dev mode — add policies before going to production).

## Supabase project
- URL: https://skxgvktsxefdcbpchucl.supabase.co
- Project ID: skxgvktsxefdcbpchucl

## Scoring criteria (how it works)
When a hiring manager creates a job, they define:
1. Application questions (label, type, required, scoringKey)
2. Scoring criteria (label, weight %, description) — must total 100%
3. Welcome video URL (Loom/YouTube/Vimeo — embeds after candidate submits)

All stored in jobs.scoring_criteria as JSON.

## AI scoring (to be built)
When a candidate submits at /apply/[jobId]:
1. Save applicant to Supabase
2. Call /api/score route (server-side)
3. Pass answers + scoring criteria to Claude
4. Claude returns: grade (A+/A/B+/B/C+/C/D), score (0-100), score_breakdown (object), score_summary (string)
5. Update applicant record in Supabase with scoring data
6. Hiring manager sees grade instantly in applicants dashboard

## Environment variables
NEXT_PUBLIC_SUPABASE_URL=https://skxgvktsxefdcbpchucl.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
ANTHROPIC_API_KEY=your-key (server-side only, not prefixed with NEXT_PUBLIC)

## What's done
- [x] Full platform shell (all 3 modules)
- [x] Supabase connected
- [x] Job posting builder (form builder + scoring criteria + welcome video)
- [x] White-label candidate application form
- [x] Custom illustrated empty states
- [x] Deployed to Vercel

## What's next
- [ ] AI scoring API route (/api/score)
- [ ] Wire scoring into application submission
- [ ] Email notification to hiring manager on new application
- [ ] Auth (login/workspace per client)
- [ ] Vercel env vars for ANTHROPIC_API_KEY