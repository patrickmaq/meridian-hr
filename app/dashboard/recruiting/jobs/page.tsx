'use client'

import { useEffect, useState, useRef } from 'react'
import { Plus, ChevronRight, GripVertical, X, ExternalLink, Copy, Check, Trash2, AlertTriangle, ToggleLeft, ToggleRight, AlertCircle, Eye, Upload, Link } from 'lucide-react'
import StatCard from '@/components/ui/StatCard'
import Button from '@/components/ui/Button'
import { supabase, type Job } from '@/lib/supabase'

type QuestionType = 'text' | 'textarea' | 'select' | 'yesno'
type FormQuestion = { id: string; label: string; type: QuestionType; required: boolean; scoringKey?: string; options?: string[] }
type ScoringCriterion = { id: string; label: string; weight: number; description: string; whatGoodLooksLike: string; dealBreaker: boolean }
type BrandingConfig = { logoUrl: string; accentColor: string; welcomeMessage: string }

const PRESET_CRITERIA = [
  { label: 'Relevant experience', description: 'Years and quality of relevant work history', whatGoodLooksLike: 'Has held similar roles before and can speak to concrete outcomes. Longevity and progression matter more than the number of jobs.', defaultWeight: 30 },
  { label: 'Communication', description: 'Clarity, structure, and quality of written answers', whatGoodLooksLike: 'Answers are clear, well-structured, and free of ambiguity. They get to the point and back up statements with specifics.', defaultWeight: 20 },
  { label: 'Motivation & culture fit', description: 'Genuine interest in the role and alignment with company values', whatGoodLooksLike: 'Shows they\'ve done their homework on the company. Their "why" feels authentic, not generic. Enthusiasm comes through naturally.', defaultWeight: 20 },
  { label: 'Achievement quality', description: 'Specificity and measurable impact of past accomplishments', whatGoodLooksLike: 'Uses numbers, timelines, or outcomes to describe wins. Avoids vague statements like "I helped the team improve performance."', defaultWeight: 15 },
  { label: 'Leadership & ownership', description: 'Evidence of taking initiative and leading others or projects', whatGoodLooksLike: 'Has owned projects end-to-end, mentored others, or stepped up without being asked. Shows they don\'t wait to be told what to do.', defaultWeight: 15 },
  { label: 'Problem solving', description: 'Ability to analyse situations and make sound decisions', whatGoodLooksLike: 'Walks through their thinking clearly. Shows they consider trade-offs and can adapt when things don\'t go to plan.', defaultWeight: 15 },
  { label: 'Technical skills', description: 'Role-specific technical knowledge or hard skills', whatGoodLooksLike: 'Can demonstrate hands-on proficiency, not just familiarity. Bonus if they\'ve applied these skills in a comparable context.', defaultWeight: 20 },
  { label: 'Coachability', description: 'Openness to feedback and willingness to grow', whatGoodLooksLike: 'Mentions times they changed course based on feedback. Doesn\'t over-defend past decisions. Treats learning as ongoing.', defaultWeight: 10 },
  { label: 'Customer focus', description: 'Orientation toward serving clients, customers, or end users', whatGoodLooksLike: 'Naturally frames their work in terms of customer impact. Has examples of going beyond the brief to solve a real user problem.', defaultWeight: 15 },
  { label: 'Attention to detail', description: 'Thoroughness and accuracy in their work', whatGoodLooksLike: 'Application itself is a signal — well-written, no errors, thoughtfully presented. Past work examples reflect care and precision.', defaultWeight: 10 },
  { label: 'Team fit', description: 'Ability to work collaboratively and contribute to team culture', whatGoodLooksLike: 'Talks about others\' contributions generously. Has examples of navigating conflict or disagreement constructively.', defaultWeight: 10 },
  { label: 'Initiative', description: 'Proactiveness and drive to identify and act on opportunities', whatGoodLooksLike: 'Has examples of spotting a problem nobody asked them to fix and doing something about it. Self-starter energy is evident.', defaultWeight: 10 },
]

const defaultQuestions: FormQuestion[] = [
  { id: '1', label: 'How many years of relevant experience do you have?', type: 'textarea', required: true, scoringKey: 'experience' },
  { id: '2', label: 'Why do you want this role?', type: 'textarea', required: true, scoringKey: 'motivation' },
  { id: '3', label: 'Describe your most significant professional achievement.', type: 'textarea', required: true, scoringKey: 'achievement' },
  { id: '4', label: 'When are you available to start?', type: 'text', required: false },
]

// One example card so hiring managers know what to fill in — 0% weight keeps publish locked
const defaultCriteria: ScoringCriterion[] = [{ id: '1', label: 'Relevant experience', weight: 0, description: 'Years and quality of relevant work history', whatGoodLooksLike: '', dealBreaker: false }]

const defaultBranding: BrandingConfig = { logoUrl: '', accentColor: '#111111', welcomeMessage: '' }

type Step = 'list' | 'create' | 'detail'

function getEmbedUrl(url: string): string | null {
  if (!url) return null
  if (url.includes('youtube.com/watch?v=')) return `https://www.youtube.com/embed/${url.split('v=')[1]?.split('&')[0]}?autoplay=1&rel=0`
  if (url.includes('youtu.be/')) return `https://www.youtube.com/embed/${url.split('youtu.be/')[1]?.split('?')[0]}?autoplay=1&rel=0`
  if (url.includes('loom.com/share/')) return `https://www.loom.com/embed/${url.split('loom.com/share/')[1]?.split('?')[0]}?autoplay=1`
  if (url.includes('vimeo.com/')) return `https://player.vimeo.com/video/${url.split('vimeo.com/')[1]?.split('?')[0]}?autoplay=1`
  return url
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState<Step>('list')
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [copied, setCopied] = useState(false)
  const [jobForm, setJobForm] = useState({ title: '', department: '', location: '', type: 'Full-time', closing_date: '', description: '', welcome_video_url: '', idealCandidateBrief: '' })
  const [questions, setQuestions] = useState<FormQuestion[]>(defaultQuestions)
  const [criteria, setCriteria] = useState<ScoringCriterion[]>(defaultCriteria)
  const [branding, setBranding] = useState<BrandingConfig>(defaultBranding)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'questions' | 'scoring' | 'aftersubmit'>('questions')
  const [deleteTarget, setDeleteTarget] = useState<Job | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [videoInputMode, setVideoInputMode] = useState<'url' | 'upload'>('url')
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [showPreview, setShowPreview] = useState(false)
  const [afterSubmitVisited, setAfterSubmitVisited] = useState(false)
  const [showAfterSubmitPrompt, setShowAfterSubmitPrompt] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { fetchJobs() }, [])

  async function fetchJobs() {
    const { data } = await supabase.from('jobs').select('*').order('created_at', { ascending: false })
    setJobs(data || [])
    setLoading(false)
  }

  // ─── Scoring validation (hard gate) ──────────────────────────────────────
  const totalWeight = criteria.reduce((s, c) => s + c.weight, 0)
  const hasEmptyLabel = criteria.some(c => !c.label.trim())
  const scoringValid = criteria.length > 0 && !hasEmptyLabel && totalWeight === 100

  function getScoringStatus(): string {
    if (criteria.length === 0) return 'Add at least one scoring criterion'
    if (hasEmptyLabel) return 'All criteria need a name'
    if (totalWeight < 100) return `Weights total ${totalWeight}% — need 100%`
    if (totalWeight > 100) return `Weights total ${totalWeight}% — exceeds 100%`
    return ''
  }

  const publishBlocked = !jobForm.title || !scoringValid
  const scoringStatus = getScoringStatus()

  async function saveJob() {
    if (publishBlocked) return
    if (!afterSubmitVisited) { setShowAfterSubmitPrompt(true); return }
    setSaving(true)
    await supabase.from('jobs').insert([{
      title: jobForm.title, department: jobForm.department, location: jobForm.location,
      type: jobForm.type, closing_date: jobForm.closing_date || null,
      description: jobForm.description, status: 'Active',
      scoring_criteria: { questions, criteria, welcome_video_url: jobForm.welcome_video_url, idealCandidateBrief: jobForm.idealCandidateBrief, branding }
    }])
    setSaving(false)
    fetchJobs()
    setStep('list')
    setJobForm({ title: '', department: '', location: '', type: 'Full-time', closing_date: '', description: '', welcome_video_url: '', idealCandidateBrief: '' })
    setQuestions(defaultQuestions)
    setCriteria(defaultCriteria)
    setBranding(defaultBranding)
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    await supabase.from('jobs').delete().eq('id', deleteTarget.id)
    setDeleting(false)
    setDeleteTarget(null)
    fetchJobs()
    if (selectedJob?.id === deleteTarget.id) { setSelectedJob(null); setStep('list') }
  }

  async function handleVideoUpload(file: File) {
    if (!file) return
    setUploading(true)
    setUploadProgress(0)
    const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`
    const { data, error } = await supabase.storage.from('videos').upload(fileName, file, { cacheControl: '3600', upsert: false })
    if (error) { alert('Upload failed: ' + error.message); setUploading(false); return }
    const { data: urlData } = supabase.storage.from('videos').getPublicUrl(fileName)
    setJobForm(f => ({ ...f, welcome_video_url: urlData.publicUrl }))
    setUploading(false)
    setUploadProgress(100)
  }

  function addQuestion() { setQuestions([...questions, { id: Date.now().toString(), label: '', type: 'textarea', required: false }]) }
  function removeQuestion(id: string) { setQuestions(questions.filter(q => q.id !== id)) }
  function updateQuestion(id: string, u: Partial<FormQuestion>) { setQuestions(questions.map(q => q.id === id ? { ...q, ...u } : q)) }
  function updateCriterion(id: string, u: Partial<ScoringCriterion>) { setCriteria(criteria.map(c => c.id === id ? { ...c, ...u } : c)) }
  function addCriterion() { setCriteria([...criteria, { id: Date.now().toString(), label: '', weight: 10, description: '', whatGoodLooksLike: '', dealBreaker: false }]) }
  function removeCriterion(id: string) { setCriteria(criteria.filter(c => c.id !== id)) }
  function addPresetCriterion(preset: typeof PRESET_CRITERIA[0]) {
    if (criteria.some(c => c.label === preset.label)) return
    setCriteria([...criteria, { id: Date.now().toString(), label: preset.label, weight: preset.defaultWeight, description: preset.description, whatGoodLooksLike: preset.whatGoodLooksLike, dealBreaker: false }])
  }

  const usedLabels = new Set(criteria.map(c => c.label))

  function copyLink(jobId: string) {
    navigator.clipboard.writeText(`${window.location.origin}/apply/${jobId}`)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }


  // ─── After Submit soft prompt modal ──────────────────────────────────────
  const AfterSubmitPrompt = () => {
    if (!showAfterSubmitPrompt) return null
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}>
        <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
          <p className="text-[14px] font-semibold text-stone-900 mb-2">Set up your after-submit screen?</p>
          <p className="text-[13px] text-stone-500 leading-relaxed mb-5">You have not visited the <strong className="text-stone-700">After submit</strong> tab yet. Without it, candidates will see a plain confirmation page with no branding or welcome video.</p>
          <p className="text-[12px] text-stone-400 mb-5">You can skip this — it is optional. But it is worth a look before publishing.</p>
          <div className="flex gap-2">
            <button onClick={() => { setShowAfterSubmitPrompt(false); setActiveTab('aftersubmit'); setAfterSubmitVisited(true) }} className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold text-white bg-stone-900 hover:bg-stone-700 transition-colors">Set it up</button>
            <button onClick={async () => { setShowAfterSubmitPrompt(false); setAfterSubmitVisited(true); setSaving(true); await supabase.from('jobs').insert([{ title: jobForm.title, department: jobForm.department, location: jobForm.location, type: jobForm.type, closing_date: jobForm.closing_date || null, description: jobForm.description, status: 'Active', scoring_criteria: { questions, criteria, welcome_video_url: jobForm.welcome_video_url, idealCandidateBrief: jobForm.idealCandidateBrief, branding } }]); setSaving(false); fetchJobs(); setStep('list'); setJobForm({ title: '', department: '', location: '', type: 'Full-time', closing_date: '', description: '', welcome_video_url: '', idealCandidateBrief: '' }); setQuestions(defaultQuestions); setCriteria(defaultCriteria); setBranding(defaultBranding) }} className="flex-1 py-2.5 rounded-xl text-[13px] font-medium text-stone-600 bg-stone-100 hover:bg-stone-200 transition-colors">Publish anyway</button>
          </div>
        </div>
      </div>
    )
  }

  // ─── After Submit Preview Modal ───────────────────────────────────────────
  const PreviewModal = () => {
    if (!showPreview) return null
    const embedUrl = getEmbedUrl(jobForm.welcome_video_url)
    const accentColor = branding.accentColor || '#111111'

    return (
      <div className="fixed inset-0 z-50 flex flex-col" style={{ backgroundColor: '#000' }}>
        {/* Preview banner */}
        <div style={{ backgroundColor: '#1a1a1a', borderBottom: '1px solid #333', padding: '10px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#F59E0B' }} />
            <p style={{ color: '#888', fontSize: 12, fontFamily: 'inherit' }}>Preview — After submit screen (candidate view)</p>
          </div>
          <button onClick={() => setShowPreview(false)} style={{ color: '#888', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontFamily: 'inherit' }}>
            <X size={14} />Close preview
          </button>
        </div>

        {embedUrl ? (
          // Full-screen video preview
          <div className="flex-1 flex flex-col" style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(to bottom, rgba(0,0,0,0.85), rgba(0,0,0,0))' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: accentColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Check size={16} color="#fff" />
                </div>
                <div>
                  <p style={{ color: '#fff', fontSize: 14, fontWeight: 600, fontFamily: 'inherit' }}>Application received</p>
                  <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, fontFamily: 'inherit', marginTop: 2 }}>Thanks for applying for <span style={{ color: 'rgba(255,255,255,0.85)' }}>{jobForm.title || 'this role'}</span> — we'll be in touch soon.</p>
                </div>
              </div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, fontFamily: 'inherit' }}>Skip button appears here</div>
            </div>
            <iframe
              src={embedUrl.replace('autoplay=1', 'autoplay=0')}
              style={{ width: '100%', flex: 1, border: 'none' }}
              allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          // Confirmation card preview (no video)
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F2F2F2', padding: 24 }}>
            <div style={{ backgroundColor: '#fff', borderRadius: 24, border: '1px solid #E8E8E8', padding: '48px 40px', maxWidth: 480, width: '100%', textAlign: 'center' }}>
              {branding.logoUrl && <img src={branding.logoUrl} alt="Logo" style={{ height: 32, objectFit: 'contain', margin: '0 auto 24px' }} onError={e => (e.currentTarget.style.display = 'none')} />}
              <div style={{ width: 56, height: 56, borderRadius: 16, backgroundColor: accentColor, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <Check size={24} color="#fff" />
              </div>
              <p style={{ fontSize: 22, fontWeight: 600, color: '#111', marginBottom: 8, fontFamily: 'inherit' }}>Application received</p>
              <p style={{ fontSize: 14, color: '#888', lineHeight: 1.6, fontFamily: 'inherit' }}>
                Thank you for applying for <strong style={{ color: '#333' }}>{jobForm.title || 'this role'}</strong>. We've received your application and will be in touch soon.
              </p>
              {!jobForm.welcome_video_url && (
                <p style={{ fontSize: 12, color: '#bbb', marginTop: 24, fontStyle: 'italic', fontFamily: 'inherit' }}>Add a welcome video above to show a full-screen video here instead.</p>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  const DeleteModal = () => {
    if (!deleteTarget) return null
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}>
        <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0"><AlertTriangle size={18} className="text-red-500" /></div>
            <div>
              <p className="text-[14px] font-semibold text-stone-900">Delete this posting?</p>
              <p className="text-[12px] text-stone-400 mt-0.5">{deleteTarget.title}</p>
            </div>
          </div>
          <p className="text-[13px] text-stone-600 leading-relaxed mb-5">The job posting will be removed. <strong className="text-stone-800">All applicants will be kept</strong> in your database and can still be found in the Applicants section.</p>
          <div className="flex gap-2">
            <button onClick={() => setDeleteTarget(null)} className="flex-1 py-2.5 rounded-xl text-[13px] font-medium text-stone-600 bg-stone-100 hover:bg-stone-200 transition-colors">Cancel</button>
            <button onClick={confirmDelete} disabled={deleting} className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors disabled:opacity-60">
              {deleting ? 'Deleting...' : 'Delete posting'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ─── LIST ─────────────────────────────────────────────────────────────────
  if (step === 'list') return (
    <div className="animate-fade-up">
      <DeleteModal />
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
            <div className="w-14 h-14 rounded-2xl bg-stone-100 flex items-center justify-center mb-4"><span className="text-[22px]">📋</span></div>
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
                <button onClick={(e) => { e.stopPropagation(); copyLink(job.id) }} className="flex items-center gap-1.5 text-[11px] text-stone-400 hover:text-stone-700 px-2.5 py-1.5 rounded-lg hover:bg-stone-100 transition-all flex-shrink-0">
                  {copied ? <Check size={12} /> : <Copy size={12} />}{copied ? 'Copied!' : 'Copy link'}
                </button>
                <button onClick={(e) => { e.stopPropagation(); setDeleteTarget(job) }} className="opacity-0 group-hover:opacity-100 flex items-center gap-1.5 text-[11px] text-stone-400 hover:text-red-500 px-2.5 py-1.5 rounded-lg hover:bg-red-50 transition-all flex-shrink-0">
                  <Trash2 size={12} />
                </button>
                <ChevronRight size={14} className="text-stone-300 group-hover:text-stone-500 transition-colors flex-shrink-0" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )

  // ─── DETAIL ───────────────────────────────────────────────────────────────
  if (step === 'detail' && selectedJob) {
    const sc = selectedJob.scoring_criteria as any
    const jobQuestions: FormQuestion[] = sc?.questions || []
    const jobCriteria: ScoringCriterion[] = sc?.criteria || []
    const idealBrief: string = sc?.idealCandidateBrief || ''
    const applyUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/apply/${selectedJob.id}`
    return (
      <div className="animate-fade-up max-w-3xl">
        <DeleteModal />
        <button onClick={() => setStep('list')} className="flex items-center gap-1.5 text-[12px] text-stone-400 hover:text-stone-700 mb-5 transition-colors">
          <ChevronRight size={12} className="rotate-180" />Back to postings
        </button>
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-[22px] font-semibold tracking-tight text-stone-900">{selectedJob.title}</h2>
            <p className="text-[13px] text-stone-400 mt-0.5">{[selectedJob.department, selectedJob.location, selectedJob.type].filter(Boolean).join(' · ')}</p>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-[11px] font-semibold px-3 py-1 rounded-full ${selectedJob.status === 'Active' ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-500'}`}>{selectedJob.status}</span>
            <button onClick={() => setDeleteTarget(selectedJob)} className="flex items-center gap-1.5 text-[12px] text-stone-400 hover:text-red-500 px-2.5 py-1.5 rounded-lg hover:bg-red-50 transition-all">
              <Trash2 size={13} />Delete
            </button>
          </div>
        </div>
        <div className="bg-stone-900 rounded-2xl p-5 mb-6">
          <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-widest mb-2">Application link</p>
          <p className="text-[12px] text-stone-300 mb-3 break-all font-mono">{applyUrl}</p>
          <div className="flex gap-2">
            <button onClick={() => copyLink(selectedJob.id)} className="flex items-center gap-1.5 bg-white text-stone-900 text-[12px] font-medium px-3 py-1.5 rounded-lg hover:bg-stone-100 transition-all">
              {copied ? <Check size={12} /> : <Copy size={12} />}{copied ? 'Copied!' : 'Copy link'}
            </button>
            <a href={applyUrl} target="_blank" className="flex items-center gap-1.5 text-stone-400 text-[12px] px-3 py-1.5 rounded-lg hover:bg-stone-800 transition-all">
              <ExternalLink size={12} />Preview form
            </a>
          </div>
        </div>
        {idealBrief && (
          <div className="bg-white border border-stone-200 rounded-2xl p-5 mb-4">
            <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-widest mb-2">Candidate brief</p>
            <p className="text-[13px] text-stone-600 leading-relaxed">{idealBrief}</p>
          </div>
        )}
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
            <div className="space-y-3">
              {jobCriteria.map(c => (
                <div key={c.id} className="py-3 border-b border-stone-100 last:border-0">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-[13px] font-medium text-stone-700">{c.label}</p>
                        {c.dealBreaker && <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-500 border border-red-100">Deal-breaker</span>}
                      </div>
                      {c.description && <p className="text-[11px] text-stone-400 mt-0.5">{c.description}</p>}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="w-24 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                        <div className="h-full bg-stone-800 rounded-full" style={{ width: `${c.weight}%` }} />
                      </div>
                      <span className="text-[12px] font-semibold text-stone-600 w-8 text-right">{c.weight}%</span>
                    </div>
                  </div>
                  {c.whatGoodLooksLike && (
                    <div className="mt-2 bg-stone-50 rounded-lg px-3 py-2">
                      <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest mb-1">What good looks like</p>
                      <p className="text-[12px] text-stone-600 leading-relaxed">{c.whatGoodLooksLike}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  // ─── CREATE ───────────────────────────────────────────────────────────────
  return (
    <div className="animate-fade-up max-w-3xl">
      <PreviewModal />
      <AfterSubmitPrompt />
      <button onClick={() => setStep('list')} className="flex items-center gap-1.5 text-[12px] text-stone-400 hover:text-stone-700 mb-5 transition-colors">
        <ChevronRight size={12} className="rotate-180" />Back to postings
      </button>
      <h2 className="text-[22px] font-semibold tracking-tight text-stone-900 mb-1">Create a job posting</h2>
      <p className="text-[13px] text-stone-400 mb-7">Set up the role, build your application form, and define how applicants will be scored.</p>

      {/* Role details */}
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
              className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2.5 text-[13px] text-stone-900 focus:outline-none focus:border-stone-400 transition-colors" placeholder="e.g. Sales" />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-stone-600 mb-1.5">Location</label>
            <input value={jobForm.location} onChange={e => setJobForm({...jobForm, location: e.target.value})}
              className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2.5 text-[13px] text-stone-900 focus:outline-none focus:border-stone-400 transition-colors" placeholder="e.g. Remote" />
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

      {/* Candidate brief */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 mb-4">
        <div className="mb-3">
          <p className="text-[13px] font-semibold text-stone-800">Candidate brief</p>
          <p className="text-[12px] text-stone-400 mt-0.5">Describe who you're really looking for. The more specific you are, the more accurately each applicant will be evaluated against your needs.</p>
        </div>
        <textarea value={jobForm.idealCandidateBrief} onChange={e => setJobForm({...jobForm, idealCandidateBrief: e.target.value})} rows={4}
          className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2.5 text-[13px] text-stone-900 focus:outline-none focus:border-stone-400 transition-colors resize-none"
          placeholder="e.g. We're a growing regional property management company looking for our first Senior Operations Manager. This person will oversee day-to-day across three sites, manage a small team, and report directly to the owner. We need someone who's hands-on, calm under pressure, and experienced dealing with contractors, tenants, and compliance. Culture fit matters — we're tight-knit and move fast." />
        <p className="text-[11px] text-stone-400 mt-2">Think about: team size, reporting structure, must-haves vs. nice-to-haves, and what makes your culture unique.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-stone-100 p-1 rounded-xl mb-4">
        {(['questions', 'scoring', 'aftersubmit'] as const).map(tab => (
          <button key={tab} onClick={() => { setActiveTab(tab); if (tab === 'aftersubmit') setAfterSubmitVisited(true) }}
            className={`flex-1 py-2 rounded-lg text-[12px] font-medium transition-all relative ${activeTab === tab ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}>
            {tab === 'questions' ? 'Application form' : tab === 'scoring' ? 'Scoring criteria' : 'After submit'}
            {tab === 'scoring' && !scoringValid && (
              <span className="absolute top-1.5 right-2 w-1.5 h-1.5 rounded-full bg-amber-400" />
            )}
            {tab === 'aftersubmit' && !afterSubmitVisited && (
              <span className="absolute top-1.5 right-2 w-1.5 h-1.5 rounded-full bg-blue-400" />
            )}
          </button>
        ))}
      </div>

      {/* Application form tab */}
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
                        <option value="textarea">Long text</option><option value="text">Short text</option><option value="yesno">Yes / No</option>
                      </select>
                      <label className="flex items-center gap-1.5 text-[11px] text-stone-500 cursor-pointer">
                        <input type="checkbox" checked={q.required} onChange={e => updateQuestion(q.id, { required: e.target.checked })} />Required
                      </label>
                    </div>
                  </div>
                  <button onClick={() => removeQuestion(q.id)} className="opacity-0 group-hover:opacity-100 transition-opacity mt-1 p-1 text-stone-300 hover:text-stone-600 rounded"><X size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Scoring criteria tab */}
      {activeTab === 'scoring' && (
        <div className="mb-4 space-y-4">
          <div className="bg-white border border-stone-200 rounded-2xl p-6">
            <div className="mb-4">
              <p className="text-[13px] font-semibold text-stone-800">Quick-add criteria</p>
              <p className="text-[12px] text-stone-400 mt-0.5">Click any to instantly add it — each comes with a suggested description and weight you can edit.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {PRESET_CRITERIA.map(preset => {
                const isAdded = usedLabels.has(preset.label)
                return (
                  <button key={preset.label} onClick={() => addPresetCriterion(preset)} disabled={isAdded} title={preset.description}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium border transition-all"
                    style={{ backgroundColor: isAdded ? '#F5F5F4' : '#FAFAF9', borderColor: isAdded ? '#D6D3D1' : '#E7E5E4', color: isAdded ? '#A8A29E' : '#44403C', cursor: isAdded ? 'default' : 'pointer' }}>
                    {isAdded && <Check size={11} />}{preset.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="bg-white border border-stone-200 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-1">
              <div>
                <p className="text-[13px] font-semibold text-stone-800">Your scoring criteria</p>
                <p className="text-[12px] text-stone-400 mt-0.5">Customise each one and add as many as you need.</p>
              </div>
              <Button variant="secondary" size="sm" onClick={addCriterion}><Plus size={12} />Custom</Button>
            </div>
            <div className={`text-[11px] font-medium mb-4 mt-2 ${totalWeight === 100 ? 'text-stone-400' : totalWeight > 100 ? 'text-red-500' : 'text-amber-600'}`}>
              Total weight: {totalWeight}% {totalWeight === 100 ? '✓' : totalWeight > 100 ? '— exceeds 100%' : '— must equal 100%'}
            </div>
            {criteria.length === 0 && (
              <div className="border-2 border-dashed border-stone-200 rounded-xl py-10 px-6 text-center">
                <p className="text-[13px] font-medium text-stone-500 mb-1">No scoring criteria yet</p>
                <p className="text-[12px] text-stone-400">Use the quick-add chips above or click <strong>Custom</strong> to build your criteria. You must complete this before publishing.</p>
              </div>
            )}
            <div className="space-y-4">
              {criteria.map((c) => (
                <div key={c.id} className={`border rounded-xl p-4 bg-stone-50 group ${!c.label.trim() ? 'border-amber-300' : 'border-stone-200'}`}>
                  <div className="flex items-start gap-3">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <input value={c.label} onChange={e => updateCriterion(c.id, { label: e.target.value })}
                          className={`flex-1 bg-white border rounded-lg px-3 py-2 text-[13px] font-medium text-stone-900 focus:outline-none focus:border-stone-400 ${!c.label.trim() ? 'border-amber-300' : 'border-stone-200'}`}
                          placeholder="Criterion name..." />
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <input type="number" min="0" max="100" value={c.weight} onChange={e => updateCriterion(c.id, { weight: parseInt(e.target.value) || 0 })}
                            className="w-14 bg-white border border-stone-200 rounded-lg px-2 py-2 text-[13px] font-semibold text-stone-900 text-center focus:outline-none focus:border-stone-400" />
                          <span className="text-[12px] text-stone-400">%</span>
                        </div>
                      </div>
                      <input value={c.description} onChange={e => updateCriterion(c.id, { description: e.target.value })}
                        className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-[12px] text-stone-600 focus:outline-none focus:border-stone-400"
                        placeholder="Brief description of what you're evaluating..." />
                      <div>
                        <label className="block text-[11px] font-semibold text-stone-400 uppercase tracking-widest mb-1.5">What good looks like</label>
                        <textarea value={c.whatGoodLooksLike} onChange={e => updateCriterion(c.id, { whatGoodLooksLike: e.target.value })} rows={2}
                          className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-[12px] text-stone-600 focus:outline-none focus:border-stone-400 resize-none"
                          placeholder="Describe the signals or specifics that would make a strong answer stand out..." />
                      </div>
                      <div className="h-1.5 bg-stone-200 rounded-full overflow-hidden">
                        <div className="h-full bg-stone-800 rounded-full transition-all duration-300" style={{ width: `${Math.min(c.weight, 100)}%` }} />
                      </div>
                      <div className="flex items-center justify-between pt-1">
                        <div>
                          <p className="text-[11px] font-semibold text-stone-600">Deal-breaker</p>
                          <p className="text-[10px] text-stone-400">If a candidate fails this, their overall grade is capped at a C.</p>
                        </div>
                        <button type="button" onClick={() => updateCriterion(c.id, { dealBreaker: !c.dealBreaker })}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${c.dealBreaker ? 'bg-red-50 text-red-500 border border-red-200' : 'bg-stone-100 text-stone-400 border border-stone-200'}`}>
                          {c.dealBreaker ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}{c.dealBreaker ? 'On' : 'Off'}
                        </button>
                      </div>
                    </div>
                    <button onClick={() => removeCriterion(c.id)} className="flex-shrink-0 mt-1 p-1.5 text-stone-300 hover:text-red-400 hover:bg-red-50 rounded-lg transition-all"><X size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* After submit tab */}
      {activeTab === 'aftersubmit' && (
        <div className="space-y-4 mb-4">
          {/* Form branding */}
          <div className="bg-white border border-stone-200 rounded-2xl p-6">
            <p className="text-[13px] font-semibold text-stone-800 mb-1">Form branding</p>
            <p className="text-[12px] text-stone-400 mb-5">Applied to the candidate-facing application form. A logo and accent colour goes a long way.</p>
            <div className="space-y-4">
              <div>
                <label className="block text-[12px] font-medium text-stone-600 mb-1.5">Logo URL</label>
                <input value={branding.logoUrl} onChange={e => setBranding({...branding, logoUrl: e.target.value})}
                  className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2.5 text-[13px] text-stone-900 focus:outline-none focus:border-stone-400 transition-colors"
                  placeholder="https://yourcompany.com/logo.png" />
                <p className="text-[11px] text-stone-400 mt-1.5">Link to a PNG or SVG. Shown at the top of the form and on the submission screen.</p>
              </div>
              <div>
                <label className="block text-[12px] font-medium text-stone-600 mb-1.5">Brand accent colour</label>
                <div className="flex items-center gap-3">
                  <input type="color" value={branding.accentColor} onChange={e => setBranding({...branding, accentColor: e.target.value})}
                    className="w-10 h-10 rounded-lg border border-stone-200 cursor-pointer bg-stone-50 p-1" />
                  <input value={branding.accentColor} onChange={e => setBranding({...branding, accentColor: e.target.value})}
                    className="flex-1 bg-stone-50 border border-stone-200 rounded-lg px-3 py-2.5 text-[13px] text-stone-900 font-mono focus:outline-none focus:border-stone-400 transition-colors"
                    placeholder="#111111" />
                </div>
                <p className="text-[11px] text-stone-400 mt-1.5">Used for the submit button and active states.</p>
              </div>
              <div>
                <label className="block text-[12px] font-medium text-stone-600 mb-1.5">Welcome message</label>
                <textarea value={branding.welcomeMessage} onChange={e => setBranding({...branding, welcomeMessage: e.target.value})} rows={3}
                  className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2.5 text-[13px] text-stone-900 focus:outline-none focus:border-stone-400 transition-colors resize-none"
                  placeholder="e.g. Thanks for your interest in joining our team. We review every application personally and will be in touch within 5 business days." />
                <p className="text-[11px] text-stone-400 mt-1.5">Shown below the job title on the application form.</p>
              </div>
            </div>
          </div>

          {/* Welcome video */}
          <div className="bg-white border border-stone-200 rounded-2xl p-6">
            <div className="flex items-start justify-between mb-1">
              <div>
                <p className="text-[13px] font-semibold text-stone-800">Welcome video</p>
                <p className="text-[12px] text-stone-400 mt-0.5 mb-4">After a candidate submits, this plays full-screen — the first thing they see. Record a short personal intro or thank-you from your team.</p>
              </div>
            </div>

            {/* URL / Upload toggle */}
            <div className="flex gap-1 bg-stone-100 p-1 rounded-xl mb-4 w-fit">
              {(['url', 'upload'] as const).map(mode => (
                <button key={mode} onClick={() => setVideoInputMode(mode)}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[12px] font-medium transition-all ${videoInputMode === mode ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}>
                  {mode === 'url' ? <><Link size={11} />Paste a link</> : <><Upload size={11} />Upload a file</>}
                </button>
              ))}
            </div>

            {videoInputMode === 'url' && (
              <div>
                <label className="block text-[12px] font-medium text-stone-600 mb-1.5">Video URL</label>
                <input value={jobForm.welcome_video_url} onChange={e => setJobForm({...jobForm, welcome_video_url: e.target.value})}
                  className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2.5 text-[13px] text-stone-900 focus:outline-none focus:border-stone-400 transition-colors"
                  placeholder="https://loom.com/share/... or YouTube / Vimeo link" />
                <p className="text-[11px] text-stone-400 mt-1.5">Paste a Loom, YouTube, or Vimeo link. Embeds automatically.</p>
              </div>
            )}

            {videoInputMode === 'upload' && (
              <div>
                <input type="file" accept="video/*" ref={fileInputRef} className="hidden"
                  onChange={e => { if (e.target.files?.[0]) handleVideoUpload(e.target.files[0]) }} />
                {jobForm.welcome_video_url && jobForm.welcome_video_url.includes('supabase') ? (
                  <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <p className="text-[12px] font-semibold text-stone-700">Video uploaded ✓</p>
                      <p className="text-[11px] text-stone-400 mt-0.5 font-mono break-all">{jobForm.welcome_video_url.split('/').pop()}</p>
                    </div>
                    <button onClick={() => setJobForm(f => ({ ...f, welcome_video_url: '' }))}
                      className="text-[11px] text-stone-400 hover:text-red-500 transition-colors ml-4 flex-shrink-0">Remove</button>
                  </div>
                ) : (
                  <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
                    className="w-full border-2 border-dashed border-stone-300 rounded-xl py-8 flex flex-col items-center gap-2 hover:border-stone-400 hover:bg-stone-50 transition-all cursor-pointer disabled:opacity-60">
                    <Upload size={20} className="text-stone-400" />
                    <p className="text-[13px] font-medium text-stone-600">{uploading ? `Uploading...` : 'Click to upload a video'}</p>
                    <p className="text-[11px] text-stone-400">MP4, MOV, or WebM · Max 50MB</p>
                  </button>
                )}
              </div>
            )}

            {/* Current video indicator */}
            {jobForm.welcome_video_url && (
              <div className="mt-4 flex items-center justify-between bg-stone-50 border border-stone-200 rounded-xl px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-400" />
                  <p className="text-[12px] text-stone-600 font-medium">Video set</p>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => setShowPreview(true)}
                    className="flex items-center gap-1.5 text-[11px] font-semibold text-stone-600 hover:text-stone-900 transition-colors">
                    <Eye size={12} />Preview after submit screen
                  </button>
                  <button onClick={() => setJobForm(f => ({ ...f, welcome_video_url: '' }))}
                    className="text-[11px] text-stone-400 hover:text-red-500 transition-colors">Remove</button>
                </div>
              </div>
            )}

            {/* Preview button even without video */}
            {!jobForm.welcome_video_url && (
              <button onClick={() => setShowPreview(true)}
                className="mt-4 flex items-center gap-1.5 text-[12px] font-medium text-stone-500 hover:text-stone-800 transition-colors">
                <Eye size={13} />Preview after submit screen
              </button>
            )}
          </div>
        </div>
      )}

      {/* Publish footer */}
      <div className="mt-2">
        {/* Hard lock message when scoring invalid */}
        {!scoringValid && (
          <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-3">
            <AlertCircle size={15} className="text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[12px] font-semibold text-amber-800">Scoring criteria required to publish</p>
              <p className="text-[12px] text-amber-700 mt-0.5">{scoringStatus} — <button onClick={() => setActiveTab('scoring')} className="underline font-medium">Go to Scoring criteria</button></p>
            </div>
          </div>
        )}
        <div className="flex items-center gap-3">
          <button
            onClick={saveJob}
            disabled={publishBlocked || saving}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 20px', borderRadius: 999,
              backgroundColor: publishBlocked ? '#D4D4D4' : '#111111',
              color: publishBlocked ? '#888888' : '#FFFFFF',
              fontSize: 13, fontWeight: 600, fontFamily: 'inherit',
              border: 'none', cursor: publishBlocked ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s',
            }}>
            {saving ? 'Saving...' : publishBlocked && !jobForm.title ? 'Add a job title to continue' : publishBlocked ? 'Complete scoring criteria to publish' : 'Publish job posting'}
          </button>
          <Button variant="ghost" size="md" onClick={() => setStep('list')}>Cancel</Button>
        </div>
      </div>
    </div>
  )
}

export const dynamic = 'force-dynamic'
