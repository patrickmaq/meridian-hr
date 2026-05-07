'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase, type Job } from '@/lib/supabase'
import { CheckCircle, X } from 'lucide-react'

type FormQuestion = {
  id: string
  label: string
  type: string
  required: boolean
  scoringKey?: string
}

type BrandingConfig = {
  logoUrl?: string
  accentColor?: string
  welcomeMessage?: string
}

function getEmbedUrl(url: string): string | null {
  if (!url) return null
  if (url.includes('youtube.com/watch?v=')) {
    const id = url.split('v=')[1]?.split('&')[0]
    return `https://www.youtube.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`
  }
  if (url.includes('youtu.be/')) {
    const id = url.split('youtu.be/')[1]?.split('?')[0]
    return `https://www.youtube.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`
  }
  if (url.includes('loom.com/share/')) {
    const id = url.split('loom.com/share/')[1]?.split('?')[0]
    return `https://www.loom.com/embed/${id}?autoplay=1`
  }
  if (url.includes('vimeo.com/')) {
    const id = url.split('vimeo.com/')[1]?.split('?')[0]
    return `https://player.vimeo.com/video/${id}?autoplay=1`
  }
  return url
}

function getContrastColor(hex: string): string {
  const h = hex.replace('#', '')
  const r = parseInt(h.substring(0, 2), 16)
  const g = parseInt(h.substring(2, 4), 16)
  const b = parseInt(h.substring(4, 6), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.5 ? '#111111' : '#FFFFFF'
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
  // Controls whether the full-screen video is shown or dismissed
  const [videoDismissed, setVideoDismissed] = useState(false)

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
      .insert([{ job_id: jobId, name, email, phone, answers, status: 'Pending review', activity_log: activityLog }])
      .select('id')
      .single()

    if (inserted?.id && job?.scoring_criteria) {
      fetch('/api/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicantId: inserted.id, answers, scoringCriteria: job.scoring_criteria }),
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
  const branding: BrandingConfig = sc?.branding || {}
  const accentColor = branding.accentColor && branding.accentColor !== '#111111' ? branding.accentColor : '#0C0C0C'
  const accentFg = getContrastColor(accentColor)

  // ─── SUBMITTED STATE ──────────────────────────────────────────────────────
  if (submitted) {
    // Full-screen video experience (if video set and not yet dismissed)
    if (embedUrl && !videoDismissed) {
      return (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
          {/* Top banner — confirmation message */}
          <div className="relative z-10 flex items-center justify-between px-6 py-4"
            style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.85), rgba(0,0,0,0))' }}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: accentColor }}>
                <CheckCircle size={16} style={{ color: accentFg }} />
              </div>
              <div>
                <p className="text-white text-[14px] font-semibold leading-tight">Application received</p>
                <p className="text-white/60 text-[12px] mt-0.5">
                  Thanks for applying for <span className="text-white/80">{job.title}</span> — we'll be in touch soon.
                </p>
              </div>
            </div>
            {/* Dismiss button */}
            <button
              onClick={() => setVideoDismissed(true)}
              className="flex items-center gap-1.5 text-white/60 hover:text-white text-[12px] transition-colors px-3 py-1.5 rounded-lg hover:bg-white/10"
            >
              <X size={14} />
              Skip
            </button>
          </div>

          {/* Full-screen iframe */}
          <div className="flex-1 relative">
            <iframe
              src={embedUrl}
              className="absolute inset-0 w-full h-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
            />
          </div>
        </div>
      )
    }

    // Fallback confirmation screen (no video, or video dismissed)
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4 py-12">
        <div className="max-w-lg w-full">
          <div className="bg-white rounded-3xl border border-stone-200 p-10 text-center">
            {branding.logoUrl && (
              <img src={branding.logoUrl} alt="Company logo" className="h-8 object-contain mx-auto mb-6"
                onError={e => (e.currentTarget.style.display = 'none')} />
            )}
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ backgroundColor: accentColor }}>
              <CheckCircle size={24} style={{ color: accentFg }} />
            </div>
            <h2 className="text-[24px] font-semibold tracking-tight text-stone-900 mb-2">Application received</h2>
            <p className="text-[14px] text-stone-500 leading-relaxed">
              Thank you for applying for <strong className="text-stone-800">{job.title}</strong>. We've received your application and will be in touch soon.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // ─── APPLICATION FORM ─────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-stone-50 py-12 px-4">
      <div className="max-w-xl mx-auto">
        {/* Logo */}
        {branding.logoUrl && (
          <div className="mb-8">
            <img src={branding.logoUrl} alt="Company logo" className="h-10 object-contain"
              onError={e => (e.currentTarget.style.display = 'none')} />
          </div>
        )}

        {/* Job header */}
        <div className="mb-8">
          <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-widest mb-4">Now hiring</p>
          <h1 className="text-[32px] font-semibold tracking-tight text-stone-900 leading-tight mb-2">{job.title}</h1>
          <div className="flex flex-wrap gap-2 mb-4">
            {[job.department, job.location, job.type].filter(Boolean).map((tag, i) => (
              <span key={i} className="text-[12px] text-stone-500 bg-white border border-stone-200 px-2.5 py-0.5 rounded-full">{tag}</span>
            ))}
          </div>
          {branding.welcomeMessage && (
            <p className="text-[14px] text-stone-600 leading-relaxed mb-3 p-4 bg-white border border-stone-200 rounded-xl">
              {branding.welcomeMessage}
            </p>
          )}
          {job.description && <p className="text-[14px] text-stone-500 mt-2 leading-relaxed">{job.description}</p>}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Contact details */}
          <div className="bg-white border border-stone-200 rounded-2xl p-6">
            <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-widest mb-4">Your details</p>
            <div className="space-y-3">
              <div>
                <label className="block text-[12px] font-medium text-stone-600 mb-1.5">Full name *</label>
                <input required value={name} onChange={e => setName(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-[13px] text-stone-900 placeholder:text-stone-400 focus:outline-none transition-colors"
                  onFocus={e => e.currentTarget.style.borderColor = accentColor}
                  onBlur={e => e.currentTarget.style.borderColor = ''}
                  placeholder="Your full name" />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-stone-600 mb-1.5">Email address *</label>
                <input required type="email" value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-[13px] text-stone-900 placeholder:text-stone-400 focus:outline-none transition-colors"
                  onFocus={e => e.currentTarget.style.borderColor = accentColor}
                  onBlur={e => e.currentTarget.style.borderColor = ''}
                  placeholder="you@example.com" />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-stone-600 mb-1.5">Phone number</label>
                <input value={phone} onChange={e => setPhone(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-[13px] text-stone-900 placeholder:text-stone-400 focus:outline-none transition-colors"
                  onFocus={e => e.currentTarget.style.borderColor = accentColor}
                  onBlur={e => e.currentTarget.style.borderColor = ''}
                  placeholder="+1 (604) 555-0100" />
              </div>
            </div>
          </div>

          {/* Application questions */}
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
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-[13px] text-stone-900 placeholder:text-stone-400 focus:outline-none transition-colors resize-none"
                        onFocus={e => e.currentTarget.style.borderColor = accentColor}
                        onBlur={e => e.currentTarget.style.borderColor = ''}
                        placeholder="Your answer..." />
                    )}
                    {q.type === 'text' && (
                      <input required={q.required} value={answers[q.id] || ''}
                        onChange={e => setAnswers({...answers, [q.id]: e.target.value})}
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-[13px] text-stone-900 placeholder:text-stone-400 focus:outline-none transition-colors"
                        onFocus={e => e.currentTarget.style.borderColor = accentColor}
                        onBlur={e => e.currentTarget.style.borderColor = ''}
                        placeholder="Your answer..." />
                    )}
                    {q.type === 'yesno' && (
                      <div className="flex gap-2">
                        {['Yes', 'No'].map(opt => (
                          <button key={opt} type="button" onClick={() => setAnswers({...answers, [q.id]: opt})}
                            className="px-5 py-2 rounded-xl text-[13px] font-medium border transition-all"
                            style={{
                              backgroundColor: answers[q.id] === opt ? accentColor : '#F9F9F9',
                              color: answers[q.id] === opt ? accentFg : '#57534e',
                              borderColor: answers[q.id] === opt ? accentColor : '#e7e5e4',
                            }}>
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

          {/* Submit */}
          <button type="submit" disabled={submitting}
            className="w-full rounded-2xl py-4 text-[14px] font-semibold transition-colors disabled:opacity-50 cursor-pointer"
            style={{ backgroundColor: accentColor, color: accentFg }}>
            {submitting ? 'Submitting...' : 'Submit application →'}
          </button>
          <p className="text-[11px] text-stone-400 text-center">Your information is kept confidential and will only be used for this application.</p>
        </form>
      </div>
    </div>
  )
}

export const dynamic = 'force-dynamic'
