# Meridian HR

A clean, premium HR operating platform built with Next.js 14, Supabase, and Tailwind CSS.

## Modules
- **Recruiting** — Job postings, applicant tracking, AI scoring, pipeline view
- **People** — Employee directory, performance reviews, training tracker
- **Documents** — SOPs, procedures, assessments

## Stack
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Supabase (database + auth)
- Anthropic Claude API (AI scoring)
- Lucide icons
- DM Sans + DM Serif Display (Google Fonts)

## Getting started

```bash
npm install
cp .env.local.example .env.local
# Fill in your Supabase + Anthropic keys in .env.local
npm run dev
```

## Deploy to Vercel
1. Push to GitHub
2. Import repo in Vercel
3. Add env vars from `.env.local` in Vercel project settings
4. Deploy

## Design tokens
All design tokens live in `tailwind.config.ts` and `app/globals.css`.
Palette: warm stone neutrals, almost no color. Fonts: DM Sans (body), DM Serif Display (display).
