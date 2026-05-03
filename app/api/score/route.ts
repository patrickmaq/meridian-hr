import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'
)

export async function POST(req: NextRequest) {
  try {
    const { applicantId, answers, scoringCriteria } = await req.json()

    if (!applicantId || !answers || !scoringCriteria) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const { data: setting, error: settingError } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'anthropic_api_key')
      .single()

    if (settingError || !setting?.value) {
      return NextResponse.json({ error: 'Anthropic API key not configured.' }, { status: 400 })
    }

    const anthropic = new Anthropic({ apiKey: setting.value })

    const criteria = scoringCriteria?.criteria || []
    const questions = scoringCriteria?.questions || []

    const formattedAnswers = questions.map((q: any) => ({
      question: q.label,
      answer: answers[q.id] || '(no answer)',
    }))

    const prompt = `You are an expert hiring manager evaluating a job application. Score the candidate based on the provided criteria.

SCORING CRITERIA:
${criteria.map((c: any) => `- ${c.label} (${c.weight}% weight): ${c.description}`).join('\n')}

CANDIDATE ANSWERS:
${formattedAnswers.map((a: any) => `Q: ${a.question}\nA: ${a.answer}`).join('\n\n')}

Evaluate the candidate and respond with ONLY a valid JSON object in this exact format:
{
  "grade": "A+",
  "score": 87,
  "score_breakdown": {
    "Criteria Label 1": 90,
    "Criteria Label 2": 75
  },
  "score_summary": "2-3 sentence narrative summary of the candidate strengths and fit."
}

Grade scale: A+ (93-100), A (85-92), B+ (78-84), B (70-77), C+ (63-69), C (55-62), D (below 55).
Score breakdown keys must exactly match the criteria labels above.
score_summary should be concise, specific, and professional.`

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      messages: [{ role: 'user', content: prompt }],
    })

    const raw = message.content[0].type === 'text' ? message.content[0].text : ''
    const parsed = JSON.parse(raw)
    const { grade, score, score_breakdown, score_summary } = parsed

    const { error: updateError } = await supabase
      .from('applicants')
      .update({ grade, score, score_breakdown, score_summary, status: 'Review queue' })
      .eq('id', applicantId)

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update applicant record' }, { status: 500 })
    }

    return NextResponse.json({ grade, score, score_breakdown, score_summary })
  } catch (err: any) {
    console.error('Scoring error:', err)
    return NextResponse.json({ error: err.message || 'Scoring failed' }, { status: 500 })
  }
}