'use client'

import { useEffect, useState } from 'react'
import { Filter, Download, Mail, Video, CheckCircle, ChevronRight } from 'lucide-react'
import StatCard from '@/components/ui/StatCard'
import ScoreBar from '@/components/ui/ScoreBar'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import EmptyState from '@/components/ui/EmptyState'
import { supabase, type Applicant } from '@/lib/supabase'

const card: React.CSSProperties = {
  backgroundColor: '#FDFCF8',
  border: '1.5px solid #E2D9CA',
  borderRadius: 20,
}

export default function ApplicantsPage() {
  const [applicants, setApplicants] = useState<Applicant[]>([])
  const [selected, setSelected] = useState<Applicant | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchApplicants() }, [])

  async function fetchApplicants() {
    const { data } = await supabase
      .from('applicants')
      .select('*, jobs(title)')
      .order('created_at', { ascending: false })
    const list = data || []
    setApplicants(list)
    if (list.length > 0) setSelected(list[0])
    setLoading(false)
  }

  const reviewQueue = applicants.filter(a => a.status === 'Review queue').length
  const shortlisted = applicants.filter(a => a.grade === 'A+' || a.grade === 'A').length
  const avgScore = applicants.length ? Math.round(applicants.reduce((s, a) => s + (a.score || 0), 0) / applicants.length) : 0

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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#A89780' }}>All applicants</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button variant="secondary" size="sm"><Filter size={12} />Filter</Button>
              <Button variant="secondary" size="sm"><Download size={12} />Export</Button>
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#A89780', fontSize: 13 }}>Loading...</div>
          ) : applicants.length === 0 ? (
            <EmptyState
              illustration="people"
              title="No applicants yet"
              subtitle="Share your application form link with candidates to start receiving applications."
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {applicants.map((a) => {
                const initials = a.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
                const isSelected = selected?.id === a.id
                return (
                  <button key={a.id} onClick={() => setSelected(a)} style={{
                    width: '100%', textAlign: 'left',
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '14px 18px', borderRadius: 16,
                    border: isSelected ? '2px solid #1A1208' : '1.5px solid #E2D9CA',
                    backgroundColor: '#FDFCF8',
                    cursor: 'pointer', transition: 'all 0.15s',
                    boxShadow: isSelected ? '0 2px 12px rgba(26,18,8,0.08)' : 'none',
                  }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: '#E2D9CA', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#2E2218', flexShrink: 0 }}>
                      {initials}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 14, fontWeight: 600, color: '#1A1208', lineHeight: 1, marginBottom: 4 }}>{a.name}</p>
                      <p style={{ fontSize: 12, color: '#A89780' }}>
                        {(a as any).jobs?.title || 'Applicant'} · {new Date(a.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                    {a.grade && <Badge label={a.grade} variant="grade" grade={a.grade} />}
                    {isSelected && <ChevronRight size={14} color="#A89780" style={{ flexShrink: 0 }} />}
                  </button>
                )
              })}
            </div>
          )}
        </div>

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
                <div style={{ marginBottom: 16 }}>
                  <p style={{ fontSize: 12, color: '#A89780', fontStyle: 'italic' }}>AI scoring pending</p>
                </div>
              )}

              {selected.score_breakdown && (
                <div style={{ marginBottom: 16, paddingBottom: 16, borderBottom: '1.5px solid #E2D9CA' }}>
                  {Object.entries(selected.score_breakdown).map(([k, v]) => (
                    <ScoreBar key={k} label={k} value={v as number} />
                  ))}
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
                <Button variant="primary" size="sm" style={{ width: '100%', justifyContent: 'center' }}>
                  <Mail size={13} />Contact applicant
                </Button>
                <Button variant="secondary" size="sm" style={{ width: '100%', justifyContent: 'center' }}>
                  <Video size={13} />Schedule interview
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export const dynamic = 'force-dynamic'