'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase, type Job } from '@/lib/supabase'
import { CheckCircle, Play } from 'lucide-react'

type FormQuestion = {
  id: string
  label: string
  type: string
  required: boolean
  scoringKey?: string
}

function getEmbedUrl(url: string): string | null {
  if (!url) return null
  if (url.includes('youtube.com/watch?v=')) {
    const id = url.split('v=')[1]?.split('&')[0]
    return `https://www.youtube.com/embed/${id}`
  }
  if (url.includes('youtu.be/')) {
    const id = url.split('youtu.be/')[1]?.split('?')[0]
    return `https://www.youtube.com/embed/${id}`
  }
  if (url.includes('loom.com/share/')) {
    const id = url.split('loom.com/share/')[1]?.split('?')[0]
    return `https://www.loom.com/embed/${id}`
  }
  if (url.includes('vimeo.com/')) {
    const id = url.split('vimeo.com/')[1]?.split('?')[0]
    return `https://player.vimeo.com/video/${id}`
  }
  return url
}

export default function ApplyPage() {
  const { jobId } = useParams()
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')

  useEffect(() => {
    async function fetchJob() {
      const { data } = await supabase.from('jobs').select('*').eq('id', jobId).single()
      setJob(data)
      setLoading(false)
    }
    fetchJob()
  }, [jobId])

async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name || !email) return
    setSubmitting(true)

    const activityLog = [
      { label: 'Application submitted', time: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }) },
    ]

    const { data: inserted } = await supabase
      .from('applicants')
      .insert([{
        job_id: jobId, name, email, phone, answers,
        status: 'Pending review', activity_log: activityLog,
      }])
      .select('id')
      .single()

    if (inserted?.id && job?.scoring_criteria) {
      fetch('/api/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicantId: inserted.id,
          answers,
          scoringCriteria: job.scoring_criteria,
        }),
      }).catch(() => {})
    }

    setSubmitting(false)
    setSubmitted(true)
  }

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-5 h-5 border-2 border-stone-200 border-t-stone-600 rounded-full animate-spin" />
    </div>
  )

  if (!job) return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-[15px] font-medium text-stone-700 mb-1">Posting not found</p>
        <p className="text-[13px] text-stone-400">This job posting may have closed or the link is incorrect.</p>
      </div>
    </div>
  )

  const sc = job.scoring_criteria as any
  const questions: FormQuestion[] = sc?.questions || []
  const welcomeVideoUrl = sc?.welcome_video_url || ''
  const embedUrl = getEmbedUrl(welcomeVideoUrl)

  if (submitted) return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full">
        <div className="bg-white rounded-3xl border border-stone-200 p-10 text-center mb-4">
          <div className="w-14 h-14 rounded-2xl bg-stone-900 flex items-center justify-center mx-auto mb-5">
            <CheckCircle size={24} className="text-white" />
          </div>
          <h2 className="text-[24px] font-semibold tracking-tight text-stone-900 mb-2">Application received</h2>
          <p className="text-[14px] text-stone-500 leading-relaxed">
            Thank you for applying for <strong className="text-stone-800">{job.title}</strong>. We've received your application and will be in touch soon.
          </p>
        </div>
        {embedUrl && (
          <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden">
            <div className="p-5 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-stone-900 flex items-center justify-center">
                  <Play size={10} className="text-white ml-0.5" />
                </div>
                <p className="text-[13px] font-medium text-stone-800">A message from the team</p>
              </div>
            </div>
            <div className="aspect-video">
              <iframe src={embedUrl} className="w-full h-full" frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen />
            </div>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-stone-50 py-12 px-4">
      <div className="max-w-xl mx-auto">
        <div className="mb-8">
          <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-widest mb-4">Now hiring</p>
          <h1 className="text-[32px] font-semibold tracking-tight text-stone-900 leading-tight mb-2">{job.title}</h1>
          <div className="flex flex-wrap gap-2">
            {[job.department, job.location, job.type].filter(Boolean).map((tag, i) => (
              <span key={i} className="text-[12px] text-stone-500 bg-white border border-stone-200 px-2.5 py-0.5 rounded-full">{tag}</span>
            ))}
          </div>
          {job.description && <p className="text-[14px] text-stone-500 mt-4 leading-relaxed">{job.description}</p>}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-white border border-stone-200 rounded-2xl p-6">
            <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-widest mb-4">Your details</p>
            <div className="space-y-3">
              <div>
                <label className="block text-[12px] font-medium text-stone-600 mb-1.5">Full name *</label>
                <input required value={name} onChange={e => setName(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-[13px] text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-400 transition-colors"
                  placeholder="Your full name" />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-stone-600 mb-1.5">Email address *</label>
                <input required type="email" value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-[13px] text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-400 transition-colors"
                  placeholder="you@example.com" />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-stone-600 mb-1.5">Phone number</label>
                <input value={phone} onChange={e => setPhone(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-[13px] text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-400 transition-colors"
                  placeholder="+1 (604) 555-0100" />
              </div>
            </div>
          </div>

          {questions.length > 0 && (
            <div className="bg-white border border-stone-200 rounded-2xl p-6">
              <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-widest mb-4">Application questions</p>
              <div className="space-y-5">
                {questions.map((q) => (
                  <div key={q.id}>
                    <label className="block text-[13px] font-medium text-stone-700 mb-2">
                      {q.label}{q.required && <span className="text-stone-400 ml-1">*</span>}
                    </label>
                    {q.type === 'textarea' && (
                      <textarea required={q.required} value={answers[q.id] || ''}
                        onChange={e => setAnswers({...answers, [q.id]: e.target.value})} rows={4}
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-[13px] text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-400 transition-colors resize-none"
                        placeholder="Your answer..." />
                    )}
                    {q.type === 'text' && (
                      <input required={q.required} value={answers[q.id] || ''}
                        onChange={e => setAnswers({...answers, [q.id]: e.target.value})}
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-[13px] text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-400 transition-colors"
                        placeholder="Your answer..." />
                    )}
                    {q.type === 'yesno' && (
                      <div className="flex gap-2">
                        {['Yes', 'No'].map(opt => (
                          <button key={opt} type="button" onClick={() => setAnswers({...answers, [q.id]: opt})}
                            className={`px-5 py-2 rounded-xl text-[13px] font-medium border transition-all ${answers[q.id] === opt ? 'bg-stone-900 text-white border-stone-900' : 'bg-stone-50 text-stone-600 border-stone-200 hover:border-stone-400'}`}>
                            {opt}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <button type="submit" disabled={submitting}
            className="w-full bg-stone-900 text-white rounded-2xl py-4 text-[14px] font-semibold hover:bg-stone-700 transition-colors disabled:opacity-50 cursor-pointer">
            {submitting ? 'Submitting...' : 'Submit application →'}
          </button>
          <p className="text-[11px] text-stone-400 text-center">Your information is kept confidential and will only be used for this application.</p>
        </form>
      </div>
    </div>
  )
}

export const dynamic = 'force-dynamic'