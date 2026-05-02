'use client'

import { useEffect, useState } from 'react'
import { Plus, ChevronRight, GripVertical, X, ExternalLink, Copy, Check } from 'lucide-react'
import StatCard from '@/components/ui/StatCard'
import Button from '@/components/ui/Button'
import { supabase, type Job } from '@/lib/supabase'

type QuestionType = 'text' | 'textarea' | 'select' | 'yesno'

type FormQuestion = {
  id: string
  label: string
  type: QuestionType
  required: boolean
  scoringKey?: string
  options?: string[]
}

type ScoringCriterion = {
  id: string
  label: string
  weight: number
  description: string
}

const defaultQuestions: FormQuestion[] = [
  { id: '1', label: 'How many years of relevant experience do you have?', type: 'textarea', required: true, scoringKey: 'experience' },
  { id: '2', label: 'Why do you want this role?', type: 'textarea', required: true, scoringKey: 'motivation' },
  { id: '3', label: 'Describe your most significant professional achievement.', type: 'textarea', required: true, scoringKey: 'achievement' },
  { id: '4', label: 'When are you available to start?', type: 'text', required: false },
]

const defaultCriteria: ScoringCriterion[] = [
  { id: '1', label: 'Relevant experience', weight: 35, description: 'Years and quality of relevant work history' },
  { id: '2', label: 'Communication', weight: 25, description: 'Clarity, structure, and quality of written answers' },
  { id: '3', label: 'Motivation & culture fit', weight: 25, description: 'Genuine interest and alignment with company values' },
  { id: '4', label: 'Achievement quality', weight: 15, description: 'Specificity and impact of past accomplishments' },
]

type Step = 'list' | 'create' | 'detail'

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState<Step>('list')
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [copied, setCopied] = useState(false)
  const [jobForm, setJobForm] = useState({ title: '', department: '', location: '', type: 'Full-time', closing_date: '', description: '', welcome_video_url: '' })
  const [questions, setQuestions] = useState<FormQuestion[]>(defaultQuestions)
  const [criteria, setCriteria] = useState<ScoringCriterion[]>(defaultCriteria)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'questions' | 'scoring' | 'branding'>('questions')

  useEffect(() => { fetchJobs() }, [])

  async function fetchJobs() {
    const { data } = await supabase.from('jobs').select('*').order('created_at', { ascending: false })
    setJobs(data || [])
    setLoading(false)
  }

  async function saveJob() {
    if (!jobForm.title) return
    setSaving(true)
    await supabase.from('jobs').insert([{
      title: jobForm.title, department: jobForm.department, location: jobForm.location,
      type: jobForm.type, closing_date: jobForm.closing_date || null,
      description: jobForm.description, status: 'Active',
      scoring_criteria: { questions, criteria, welcome_video_url: jobForm.welcome_video_url }
    }])
    setSaving(false)
    fetchJobs()
    setStep('list')
    setJobForm({ title: '', department: '', location: '', type: 'Full-time', closing_date: '', description: '', welcome_video_url: '' })
    setQuestions(defaultQuestions)
    setCriteria(defaultCriteria)
  }

  function addQuestion() {
    setQuestions([...questions, { id: Date.now().toString(), label: '', type: 'textarea', required: false }])
  }
  function removeQuestion(id: string) { setQuestions(questions.filter(q => q.id !== id)) }
  function updateQuestion(id: string, updates: Partial<FormQuestion>) {
    setQuestions(questions.map(q => q.id === id ? { ...q, ...updates } : q))
  }
  function updateCriterion(id: string, updates: Partial<ScoringCriterion>) {
    setCriteria(criteria.map(c => c.id === id ? { ...c, ...updates } : c))
  }
  function addCriterion() {
    setCriteria([...criteria, { id: Date.now().toString(), label: '', weight: 10, description: '' }])
  }
  function removeCriterion(id: string) { setCriteria(criteria.filter(c => c.id !== id)) }

  const totalWeight = criteria.reduce((s, c) => s + c.weight, 0)

  function copyLink(jobId: string) {
    navigator.clipboard.writeText(`${window.location.origin}/apply/${jobId}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (step === 'list') return (
    <div className="animate-fade-up">
      <div className="grid grid-cols-4 gap-4 mb-7 stagger-1 animate-fade-up">
        <StatCard label="Open roles" value={jobs.filter(j => j.status === 'Active').length} sub="Actively recruiting" />
        <StatCard label="Total postings" value={jobs.length} />
        <StatCard label="Avg time to hire" value="18d" sub="Rolling 90 days" />
        <StatCard label="Roles filled YTD" value={7} sub="Since Jan 2026" />
      </div>
      <div className="stagger-2 animate-fade-up">
        <div className="flex items-center justify-between mb-5">
          <p className="text-[12px] font-semibold text-stone-400 uppercase tracking-widest">Job postings</p>
          <Button variant="primary" size="sm" onClick={() => setStep('create')}><Plus size={12} />Create posting</Button>
        </div>
        {loading ? (
          <div className="text-[13px] text-stone-400 py-8 text-center">Loading...</div>
        ) : jobs.length === 0 ? (
          <div className="border-2 border-dashed border-stone-300 rounded-2xl py-16 px-6 flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-stone-100 flex items-center justify-center mb-4">
              <span className="text-[22px]">📋</span>
            </div>
            <p className="text-[15px] font-medium text-stone-700 mb-1">No job postings yet</p>
            <p className="text-[13px] text-stone-400 mb-5">Create your first posting to start receiving applications.</p>
            <Button variant="primary" size="md" onClick={() => setStep('create')}><Plus size={13} />Create your first posting</Button>
          </div>
        ) : (
          <div className="space-y-2">
            {jobs.map((job) => (
              <div key={job.id} onClick={() => { setSelectedJob(job); setStep('detail') }}
                className="bg-white border border-stone-200 rounded-xl px-5 py-4 flex items-center gap-4 hover:border-stone-300 transition-all cursor-pointer group">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 mb-0.5">
                    <p className="text-[14px] font-semibold text-stone-900">{job.title}</p>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${job.status === 'Active' ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-500'}`}>{job.status}</span>
                  </div>
                  <p className="text-[12px] text-stone-400">{[job.department, job.location, job.type].filter(Boolean).join(' · ')}</p>
                </div>
                {job.closing_date && (
                  <div className="text-right flex-shrink-0">
                    <p className="text-[12px] text-stone-500">{new Date(job.closing_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    <p className="text-[10px] text-stone-400 mt-0.5">closes</p>
                  </div>
                )}
                <button onClick={(e) => { e.stopPropagation(); copyLink(job.id) }}
                  className="flex items-center gap-1.5 text-[11px] text-stone-400 hover:text-stone-700 px-2.5 py-1.5 rounded-lg hover:bg-stone-100 transition-all flex-shrink-0">
                  {copied ? <Check size={12} /> : <Copy size={12} />}{copied ? 'Copied!' : 'Copy link'}
                </button>
                <ChevronRight size={14} className="text-stone-300 group-hover:text-stone-500 transition-colors flex-shrink-0" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )

  if (step === 'detail' && selectedJob) {
    const sc = selectedJob.scoring_criteria as any
    const jobQuestions: FormQuestion[] = sc?.questions || []
    const jobCriteria: ScoringCriterion[] = sc?.criteria || []
    const applyUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/apply/${selectedJob.id}`
    return (
      <div className="animate-fade-up max-w-3xl">
        <button onClick={() => setStep('list')} className="flex items-center gap-1.5 text-[12px] text-stone-400 hover:text-stone-700 mb-5 transition-colors">
          <ChevronRight size={12} className="rotate-180" />Back to postings
        </button>
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-[22px] font-semibold tracking-tight text-stone-900">{selectedJob.title}</h2>
            <p className="text-[13px] text-stone-400 mt-0.5">{[selectedJob.department, selectedJob.location, selectedJob.type].filter(Boolean).join(' · ')}</p>
          </div>
          <span className={`text-[11px] font-semibold px-3 py-1 rounded-full mt-1 ${selectedJob.status === 'Active' ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-500'}`}>{selectedJob.status}</span>
        </div>
        <div className="bg-stone-900 rounded-2xl p-5 mb-6">
          <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-widest mb-2">Application link</p>
          <p className="text-[12px] text-stone-300 mb-3 break-all font-mono">{applyUrl}</p>
          <div className="flex gap-2">
            <button onClick={() => copyLink(selectedJob.id)}
              className="flex items-center gap-1.5 bg-white text-stone-900 text-[12px] font-medium px-3 py-1.5 rounded-lg hover:bg-stone-100 transition-all">
              {copied ? <Check size={12} /> : <Copy size={12} />}{copied ? 'Copied!' : 'Copy link'}
            </button>
            <a href={applyUrl} target="_blank"
              className="flex items-center gap-1.5 text-stone-400 text-[12px] px-3 py-1.5 rounded-lg hover:bg-stone-800 transition-all">
              <ExternalLink size={12} />Preview form
            </a>
          </div>
        </div>
        {jobQuestions.length > 0 && (
          <div className="bg-white border border-stone-200 rounded-2xl p-5 mb-4">
            <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-widest mb-4">Application questions ({jobQuestions.length})</p>
            <div className="space-y-2">
              {jobQuestions.map((q, i) => (
                <div key={q.id} className="flex items-start gap-3 py-2 border-b border-stone-100 last:border-0">
                  <span className="text-[11px] font-medium text-stone-300 mt-0.5 w-4 flex-shrink-0">{i + 1}</span>
                  <div className="flex-1">
                    <p className="text-[13px] text-stone-700">{q.label}</p>
                    <p className="text-[11px] text-stone-400 mt-0.5">{q.type} {q.required ? '· required' : '· optional'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {jobCriteria.length > 0 && (
          <div className="bg-white border border-stone-200 rounded-2xl p-5">
            <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-widest mb-4">Scoring criteria</p>
            <div className="space-y-2">
              {jobCriteria.map(c => (
                <div key={c.id} className="flex items-center gap-3 py-2 border-b border-stone-100 last:border-0">
                  <div className="flex-1">
                    <p className="text-[13px] font-medium text-stone-700">{c.label}</p>
                    {c.description && <p className="text-[11px] text-stone-400">{c.description}</p>}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="w-24 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                      <div className="h-full bg-stone-800 rounded-full" style={{ width: `${c.weight}%` }} />
                    </div>
                    <span className="text-[12px] font-semibold text-stone-600 w-8 text-right">{c.weight}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="animate-fade-up max-w-3xl">
      <button onClick={() => setStep('list')} className="flex items-center gap-1.5 text-[12px] text-stone-400 hover:text-stone-700 mb-5 transition-colors">
        <ChevronRight size={12} className="rotate-180" />Back to postings
      </button>
      <h2 className="text-[22px] font-semibold tracking-tight text-stone-900 mb-1">Create a job posting</h2>
      <p className="text-[13px] text-stone-400 mb-7">Set up the role, build your application form, and define how applicants will be scored.</p>
      <div className="bg-white border border-stone-200 rounded-2xl p-6 mb-4">
        <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-widest mb-4">Role details</p>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-[12px] font-medium text-stone-600 mb-1.5">Job title *</label>
            <input value={jobForm.title} onChange={e => setJobForm({...jobForm, title: e.target.value})}
              className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2.5 text-[13px] text-stone-900 focus:outline-none focus:border-stone-400 transition-colors"
              placeholder="e.g. Senior Account Manager" />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-stone-600 mb-1.5">Department</label>
            <input value={jobForm.department} onChange={e => setJobForm({...jobForm, department: e.target.value})}
              className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2.5 text-[13px] text-stone-900 focus:outline-none focus:border-stone-400 transition-colors"
              placeholder="e.g. Sales" />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-stone-600 mb-1.5">Location</label>
            <input value={jobForm.location} onChange={e => setJobForm({...jobForm, location: e.target.value})}
              className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2.5 text-[13px] text-stone-900 focus:outline-none focus:border-stone-400 transition-colors"
              placeholder="e.g. Remote" />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-stone-600 mb-1.5">Employment type</label>
            <select value={jobForm.type} onChange={e => setJobForm({...jobForm, type: e.target.value})}
              className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2.5 text-[13px] text-stone-900 focus:outline-none focus:border-stone-400 transition-colors">
              <option>Full-time</option><option>Part-time</option><option>Contract</option><option>Internship</option>
            </select>
          </div>
          <div>
            <label className="block text-[12px] font-medium text-stone-600 mb-1.5">Closing date</label>
            <input type="date" value={jobForm.closing_date} onChange={e => setJobForm({...jobForm, closing_date: e.target.value})}
              className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2.5 text-[13px] text-stone-900 focus:outline-none focus:border-stone-400 transition-colors" />
          </div>
          <div className="col-span-2">
            <label className="block text-[12px] font-medium text-stone-600 mb-1.5">Role description</label>
            <textarea value={jobForm.description} onChange={e => setJobForm({...jobForm, description: e.target.value})} rows={3}
              className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2.5 text-[13px] text-stone-900 focus:outline-none focus:border-stone-400 transition-colors resize-none"
              placeholder="Brief description of the role..." />
          </div>
        </div>
      </div>
      <div className="flex gap-1 bg-stone-100 p-1 rounded-xl mb-4">
        {(['questions', 'scoring', 'branding'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 rounded-lg text-[12px] font-medium transition-all ${activeTab === tab ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}>
            {tab === 'questions' ? 'Application form' : tab === 'scoring' ? 'Scoring criteria' : 'Welcome video'}
          </button>
        ))}
      </div>
      {activeTab === 'questions' && (
        <div className="bg-white border border-stone-200 rounded-2xl p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[13px] font-semibold text-stone-800">Application questions</p>
              <p className="text-[12px] text-stone-400 mt-0.5">These are shown to candidates when they apply.</p>
            </div>
            <Button variant="secondary" size="sm" onClick={addQuestion}><Plus size={12} />Add question</Button>
          </div>
          <div className="space-y-3">
            {questions.map((q, i) => (
              <div key={q.id} className="border border-stone-200 rounded-xl p-4 bg-stone-50 group">
                <div className="flex items-start gap-3">
                  <div className="flex items-center gap-2 flex-shrink-0 mt-2">
                    <GripVertical size={14} className="text-stone-300" />
                    <span className="text-[11px] font-semibold text-stone-300 w-4">{i + 1}</span>
                  </div>
                  <div className="flex-1 space-y-2">
                    <input value={q.label} onChange={e => updateQuestion(q.id, { label: e.target.value })}
                      className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-[13px] text-stone-900 focus:outline-none focus:border-stone-400"
                      placeholder="Question text..." />
                    <div className="flex items-center gap-2 flex-wrap">
                      <select value={q.type} onChange={e => updateQuestion(q.id, { type: e.target.value as QuestionType })}
                        className="bg-white border border-stone-200 rounded-lg px-2.5 py-1.5 text-[11px] text-stone-600 focus:outline-none focus:border-stone-400">
                        <option value="textarea">Long text</option>
                        <option value="text">Short text</option>
                        <option value="yesno">Yes / No</option>
                      </select>
                      <label className="flex items-center gap-1.5 text-[11px] text-stone-500 cursor-pointer">
                        <input type="checkbox" checked={q.required} onChange={e => updateQuestion(q.id, { required: e.target.checked })} />
                        Required
                      </label>
                    </div>
                  </div>
                  <button onClick={() => removeQuestion(q.id)} className="opacity-0 group-hover:opacity-100 transition-opacity mt-1 p-1 text-stone-300 hover:text-stone-600 rounded">
                    <X size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {activeTab === 'scoring' && (
        <div className="bg-white border border-stone-200 rounded-2xl p-6 mb-4">
          <div className="flex items-center justify-between mb-1">
            <div>
              <p className="text-[13px] font-semibold text-stone-800">Scoring criteria</p>
              <p className="text-[12px] text-stone-400 mt-0.5">Define what you value and how much each factor matters.</p>
            </div>
            <Button variant="secondary" size="sm" onClick={addCriterion}><Plus size={12} />Add criterion</Button>
          </div>
          <div className={`text-[11px] font-medium mb-4 mt-2 ${totalWeight === 100 ? 'text-stone-400' : totalWeight > 100 ? 'text-red-500' : 'text-amber-600'}`}>
            Total weight: {totalWeight}% {totalWeight === 100 ? '✓' : totalWeight > 100 ? '— exceeds 100%' : '— must equal 100%'}
          </div>
          <div className="space-y-3">
            {criteria.map((c) => (
              <div key={c.id} className="border border-stone-200 rounded-xl p-4 bg-stone-50 group">
                <div className="flex items-start gap-3">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <input value={c.label} onChange={e => updateCriterion(c.id, { label: e.target.value })}
                        className="flex-1 bg-white border border-stone-200 rounded-lg px-3 py-2 text-[13px] font-medium text-stone-900 focus:outline-none focus:border-stone-400"
                        placeholder="Criterion name..." />
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <input type="number" min="0" max="100" value={c.weight}
                          onChange={e => updateCriterion(c.id, { weight: parseInt(e.target.value) || 0 })}
                          className="w-14 bg-white border border-stone-200 rounded-lg px-2 py-2 text-[13px] font-semibold text-stone-900 text-center focus:outline-none focus:border-stone-400" />
                        <span className="text-[12px] text-stone-400">%</span>
                      </div>
                    </div>
                    <input value={c.description} onChange={e => updateCriterion(c.id, { description: e.target.value })}
                      className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-[12px] text-stone-600 focus:outline-none focus:border-stone-400"
                      placeholder="Brief description of what you're evaluating..." />
                    <div className="h-1.5 bg-stone-200 rounded-full overflow-hidden">
                      <div className="h-full bg-stone-800 rounded-full transition-all duration-300" style={{ width: `${Math.min(c.weight, 100)}%` }} />
                    </div>
                  </div>
                  <button onClick={() => removeCriterion(c.id)} className="opacity-0 group-hover:opacity-100 transition-opacity mt-1 p-1 text-stone-300 hover:text-stone-600 rounded">
                    <X size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {activeTab === 'branding' && (
        <div className="bg-white border border-stone-200 rounded-2xl p-6 mb-4">
          <p className="text-[13px] font-semibold text-stone-800 mb-1">Welcome video</p>
          <p className="text-[12px] text-stone-400 mb-5">After submitting, candidates will see this video. Record a short personal intro to your company.</p>
          <div className="mb-4">
            <label className="block text-[12px] font-medium text-stone-600 mb-1.5">Video URL</label>
            <input value={jobForm.welcome_video_url} onChange={e => setJobForm({...jobForm, welcome_video_url: e.target.value})}
              className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2.5 text-[13px] text-stone-900 focus:outline-none focus:border-stone-400 transition-colors"
              placeholder="https://loom.com/share/... or YouTube link" />
            <p className="text-[11px] text-stone-400 mt-1.5">Paste a Loom, YouTube, or Vimeo link. Embeds automatically.</p>
          </div>
          {jobForm.welcome_video_url && (
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-4">
              <p className="text-[11px] text-stone-400 mb-1">URL set:</p>
              <p className="text-[12px] text-stone-600 font-mono break-all">{jobForm.welcome_video_url}</p>
            </div>
          )}
        </div>
      )}
      <div className="flex items-center gap-3 mt-2">
        <Button variant="primary" size="md" onClick={saveJob} disabled={saving || !jobForm.title}>
          {saving ? 'Saving...' : 'Publish job posting'}
        </Button>
        <Button variant="ghost" size="md" onClick={() => setStep('list')}>Cancel</Button>
      </div>
    </div>
  )
}

export const dynamic = 'force-dynamic'