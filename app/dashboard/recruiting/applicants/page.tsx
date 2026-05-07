'use client'

import { useEffect, useState, useMemo } from 'react'
import { Filter, Download, Mail, Video, CheckCircle, ChevronRight, X, ChevronDown } from 'lucide-react'
import StatCard from '@/components/ui/StatCard'
import ScoreBar from '@/components/ui/ScoreBar'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import EmptyState from '@/components/ui/EmptyState'
import { supabase, type Applicant, type Job } from '@/lib/supabase'

const card: React.CSSProperties = {
  backgroundColor: '#FDFCF8',
  border: '1.5px solid #E2D9CA',
  borderRadius: 20,
}

const STATUSES = ['All', 'Pending review', 'Review queue', 'Shortlisted', 'Interview', 'Offer', 'Rejected']
const GRADES = ['All', 'A+', 'A', 'B+', 'B', 'C+', 'C', 'D']
const PIPELINE_STATUSES = ['Review queue', 'Shortlisted', 'Interview', 'Offer', 'Rejected']

type Filters = {
  job: string
  status: string
  grade: string
  dateRange: string
}

export default function ApplicantsPage() {
  const [applicants, setApplicants] = useState<Applicant[]>([])
  const [jobs, setJobs] = useState<Job[]>([])
  const [selected, setSelected] = useState<Applicant | null>(null)
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [expandedAnswers, setExpandedAnswers] = useState(false)

  const [filters, setFilters] = useState<Filters>({
    job: 'All', status: 'All', grade: 'All', dateRange: 'All',
  })

  useEffect(() => { fetchApplicants(); fetchJobs() }, [])

  async function fetchApplicants() {
    const { data } = await supabase
      .from('applicants').select('*, jobs(title)').order('created_at', { ascending: false })
    const list = data || []
    setApplicants(list)
    if (list.length > 0) setSelected(list[0])
    setLoading(false)
  }

  async function fetchJobs() {
    const { data } = await supabase.from('jobs').select('id, title').order('title')
    setJobs(data || [])
  }

  async function updateStatus(applicantId: string, newStatus: string) {
    setUpdatingStatus(true)
    await supabase.from('applicants').update({ status: newStatus }).eq('id', applicantId)
    setApplicants(prev => prev.map(a => a.id === applicantId ? { ...a, status: newStatus } : a))
    if (selected?.id === applicantId) setSelected(prev => prev ? { ...prev, status: newStatus } : prev)
    setUpdatingStatus(false)
  }

  const reviewQueue = applicants.filter(a => a.status === 'Review queue').length
  const shortlisted = applicants.filter(a => a.grade === 'A+' || a.grade === 'A').length
  const avgScore = applicants.length ? Math.round(applicants.reduce((s, a) => s + (a.score || 0), 0) / applicants.length) : 0

  const filteredApplicants = useMemo(() => {
    return applicants.filter(a => {
      if (filters.job !== 'All' && (a as any).jobs?.title !== filters.job) return false
      if (filters.status !== 'All' && a.status !== filters.status) return false
      if (filters.grade !== 'All' && a.grade !== filters.grade) return false
      if (filters.dateRange !== 'All') {
        const created = new Date(a.created_at)
        const cutoff = new Date(Date.now() - (filters.dateRange === '7d' ? 7 : filters.dateRange === '30d' ? 30 : 90) * 86400000)
        if (created < cutoff) return false
      }
      return true
    })
  }, [applicants, filters])

  const activeFilterCount = Object.values(filters).filter(v => v !== 'All').length
  function clearFilters() { setFilters({ job: 'All', status: 'All', grade: 'All', dateRange: 'All' }) }

  // ── Neutral white/grey/black styles ──────────────────────────────────────
  const neutralBtn: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '6px 14px', borderRadius: 999,
    borderWidth: '1.5px', borderStyle: 'solid', borderColor: '#E5E5E5',
    backgroundColor: '#FFFFFF',
    color: '#555555',
    fontSize: 12, fontWeight: 500, cursor: 'pointer',
    transition: 'all 0.15s', fontFamily: 'inherit',
  }

  const neutralBtnActive: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '6px 14px', borderRadius: 999,
    borderWidth: '1.5px', borderStyle: 'solid', borderColor: '#111111',
    backgroundColor: '#111111', color: '#FFFFFF',
    fontSize: 12, fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'inherit', }

  const neutralSelect: React.CSSProperties = {
    width: '100%', appearance: 'none',
    backgroundColor: '#F5F5F5',
    borderWidth: '1.5px', borderStyle: 'solid', borderColor: '#E5E5E5',
    borderRadius: 10,
    padding: '7px 28px 7px 10px',
    fontSize: 12, color: '#111111',
    cursor: 'pointer', outline: 'none',
    fontFamily: 'inherit',
  }

  const neutralLabel: React.CSSProperties = {
    fontSize: 10, fontWeight: 700,
    textTransform: 'uppercase', letterSpacing: '0.08em',
    color: '#888888', display: 'block', marginBottom: 6,
  }

  const neutralPanel: React.CSSProperties = {
    backgroundColor: '#FFFFFF',
    border: '1.5px solid #E5E5E5',
    borderRadius: 16,
    padding: '16px 20px',
    marginBottom: 12,
    display: 'grid',
    gridTemplateColumns: 'repeat(4,1fr)',
    gap: 12,
  }

  return (
    <div className="animate-fade-up">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 28 }} className="stagger-1 animate-fade-up">
        <StatCard label="Total applicants" value={applicants.length} sub="Across all open roles" />
        <StatCard label="Review queue" value={reviewQueue} sub="Awaiting hiring manager" />
        <StatCard label="Shortlisted" value={shortlisted} sub="Grade A or above" />
        <StatCard label="Avg score" value={applicants.length ? `${avgScore}%` : '—'} />
      </div>

      <div style={{ display: 'flex', gap: 20 }} className="stagger-2 animate-fade-up">
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#A89780' }}>
                {activeFilterCount > 0 ? `Filtered (${filteredApplicants.length})` : 'All applicants'}
              </p>
              {activeFilterCount > 0 && (
                <button onClick={clearFilters} style={{ fontSize: 10, color: '#666', display: 'flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 999, border: '1px solid #E5E5E5', backgroundColor: '#FFF', cursor: 'pointer', fontFamily: 'inherit' }}>
                  <X size={10} />Clear
                </button>
              )}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => setShowFilters(!showFilters)}
                style={showFilters || activeFilterCount > 0 ? neutralBtnActive : neutralBtn}>
                <Filter size={12} />
                Filter
                {activeFilterCount > 0 && (
                  <span style={{ backgroundColor: '#FFFFFF', color: '#111111', borderRadius: 999, padding: '1px 6px', fontSize: 10, fontWeight: 700 }}>
                    {activeFilterCount}
                  </span>
                )}
              </button>
              <button style={neutralBtn}>
                <Download size={12} />Export
              </button>
            </div>
          </div>

          {/* Filter panel — white/grey/black */}
          {showFilters && (
            <div style={neutralPanel}>
              {[
                { key: 'job', label: 'Role', options: ['All roles', ...jobs.map(j => j.title)], values: ['All', ...jobs.map(j => j.title)] },
                { key: 'status', label: 'Status', options: STATUSES, values: STATUSES },
                { key: 'grade', label: 'Grade', options: GRADES, values: GRADES },
                { key: 'dateRange', label: 'Applied', options: ['Any time', 'Last 7 days', 'Last 30 days', 'Last 90 days'], values: ['All', '7d', '30d', '90d'] },
              ].map(({ key, label, options, values }) => (
                <div key={key}>
                  <label style={neutralLabel}>{label}</label>
                  <div style={{ position: 'relative' }}>
                    <select
                      value={filters[key as keyof Filters]}
                      onChange={e => {
                        const val = values[options.indexOf(e.target.value)] ?? e.target.value
                        setFilters(f => ({ ...f, [key]: val }))
                      }}
                      style={neutralSelect}>
                      {options.map((o, i) => <option key={i} value={values[i]}>{o}</option>)}
                    </select>
                    <ChevronDown size={12} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', color: '#888', pointerEvents: 'none' }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* List */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#A89780', fontSize: 13 }}>Loading...</div>
          ) : applicants.length === 0 ? (
            <EmptyState illustration="people" title="No applicants yet" subtitle="Share your application form link with candidates to start receiving applications." />
          ) : filteredApplicants.length === 0 ? (
            <div style={{ ...card, padding: '32px 20px', textAlign: 'center' }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#2E2218', marginBottom: 6 }}>No applicants match these filters</p>
              <p style={{ fontSize: 13, color: '#A89780', marginBottom: 16 }}>Try adjusting your filters to see more results.</p>
              <button onClick={clearFilters} style={{ fontSize: 12, fontWeight: 600, color: '#111', padding: '8px 16px', borderRadius: 999, border: '1.5px solid #111', backgroundColor: 'transparent', cursor: 'pointer', fontFamily: 'inherit' }}>Clear filters</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {filteredApplicants.map((a) => {
                const initials = a.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
                const isSelected = selected?.id === a.id
                return (
                  <button key={a.id} onClick={() => { setSelected(a); setExpandedAnswers(false) }} style={{
                    width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 14,
                    padding: '14px 18px', borderRadius: 16,
                    border: isSelected ? '2px solid #1A1208' : '1.5px solid #E2D9CA',
                    backgroundColor: '#FDFCF8', cursor: 'pointer', transition: 'all 0.15s',
                    boxShadow: isSelected ? '0 2px 12px rgba(26,18,8,0.08)' : 'none', fontFamily: 'inherit',
                  }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: '#E2D9CA', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#2E2218', flexShrink: 0 }}>{initials}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 14, fontWeight: 600, color: '#1A1208', lineHeight: 1, marginBottom: 4 }}>{a.name}</p>
                      <p style={{ fontSize: 12, color: '#A89780' }}>{(a as any).jobs?.title || 'Applicant'} · {new Date(a.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                    {a.status && (
                      <span style={{ fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 999, flexShrink: 0, backgroundColor: a.status === 'Shortlisted' ? '#F0FDF4' : a.status === 'Rejected' ? '#FEF2F2' : '#F5F0E8', color: a.status === 'Shortlisted' ? '#16A34A' : a.status === 'Rejected' ? '#DC2626' : '#8C7E6A' }}>{a.status}</span>
                    )}
                    {a.grade && <Badge label={a.grade} variant="grade" grade={a.grade} />}
                    {isSelected && <ChevronRight size={14} color="#A89780" style={{ flexShrink: 0 }} />}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Detail panel */}
        {selected && (
          <div style={{ width: 300, flexShrink: 0 }}>
            <div style={{ ...card, padding: 20, position: 'sticky', top: 80 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingBottom: 16, marginBottom: 16, borderBottom: '1.5px solid #E2D9CA' }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', backgroundColor: '#E2D9CA', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#2E2218' }}>
                  {selected.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#1A1208', lineHeight: 1 }}>{selected.name}</p>
                  <p style={{ fontSize: 12, color: '#8C7E6A', marginTop: 4 }}>{selected.email}</p>
                  {selected.phone && <p style={{ fontSize: 11, color: '#A89780', marginTop: 2 }}>{selected.phone}</p>}
                </div>
              </div>

              <div style={{ marginBottom: 16, paddingBottom: 16, borderBottom: '1.5px solid #E2D9CA' }}>
                <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#A89780', marginBottom: 8 }}>Pipeline stage</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {PIPELINE_STATUSES.map(s => (
                    <button key={s} onClick={() => updateStatus(selected.id, s)} disabled={updatingStatus}
                      style={{ fontSize: 11, fontWeight: 600, padding: '5px 10px', borderRadius: 999, cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'inherit', border: selected.status === s ? '1.5px solid #1A1208' : '1.5px solid #E2D9CA', backgroundColor: selected.status === s ? '#1A1208' : '#F5F0E8', color: selected.status === s ? '#FDFCF8' : '#8C7E6A', opacity: updatingStatus ? 0.6 : 1 }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {selected.grade ? (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                    <span style={{ fontSize: 52, fontWeight: 800, letterSpacing: '-0.05em', color: '#1A1208', lineHeight: 1 }}>{selected.grade}</span>
                    {selected.score && <span style={{ fontSize: 13, color: '#A89780' }}>{selected.score}/100</span>}
                  </div>
                  {selected.score_summary && <p style={{ fontSize: 12, color: '#8C7E6A', marginTop: 8, lineHeight: 1.6 }}>{selected.score_summary}</p>}
                </div>
              ) : (
                <div style={{ marginBottom: 16 }}><p style={{ fontSize: 12, color: '#A89780', fontStyle: 'italic' }}>Scoring pending</p></div>
              )}

              {selected.score_breakdown && (
                <div style={{ marginBottom: 16, paddingBottom: 16, borderBottom: '1.5px solid #E2D9CA' }}>
                  {Object.entries(selected.score_breakdown).map(([k, v]) => <ScoreBar key={k} label={k} value={v as number} />)}
                </div>
              )}

              {selected.answers && Object.keys(selected.answers).length > 0 && (
                <div style={{ marginBottom: 16, paddingBottom: 16, borderBottom: '1.5px solid #E2D9CA' }}>
                  <button onClick={() => setExpandedAnswers(!expandedAnswers)}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginBottom: expandedAnswers ? 12 : 0, fontFamily: 'inherit' }}>
                    <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#A89780' }}>Application answers</p>
                    <ChevronDown size={12} color="#A89780" style={{ transform: expandedAnswers ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                  </button>
                  {expandedAnswers && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {Object.entries(selected.answers).map(([qId, answer]) => (
                        <div key={qId}>
                          <p style={{ fontSize: 10, fontWeight: 600, color: '#A89780', marginBottom: 4 }}>Q{qId}</p>
                          <p style={{ fontSize: 12, color: '#2E2218', lineHeight: 1.6, backgroundColor: '#F5F0E8', borderRadius: 8, padding: '8px 10px' }}>{String(answer)}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {selected.activity_log && selected.activity_log.length > 0 && (
                <div style={{ marginBottom: 16, paddingBottom: 16, borderBottom: '1.5px solid #E2D9CA' }}>
                  <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#A89780', marginBottom: 12 }}>Activity</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {selected.activity_log.map((a: any, i: number) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                        <CheckCircle size={13} color="#A89780" style={{ marginTop: 1, flexShrink: 0 }} />
                        <div>
                          <p style={{ fontSize: 12, color: '#2E2218', lineHeight: 1.4 }}>{a.label}</p>
                          <p style={{ fontSize: 11, color: '#A89780', marginTop: 2 }}>{a.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <Button variant="primary" size="sm" style={{ width: '100%', justifyContent: 'center' }}><Mail size={13} />Contact applicant</Button>
                <Button variant="secondary" size="sm" style={{ width: '100%', justifyContent: 'center' }}><Video size={13} />Schedule interview</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export const dynamic = 'force-dynamic'
