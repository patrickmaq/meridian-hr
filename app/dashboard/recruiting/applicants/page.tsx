'use client'

import { useEffect, useState } from 'react'
import { Filter, Download, Mail, Video, CheckCircle, ChevronRight, Plus } from 'lucide-react'
import StatCard from '@/components/ui/StatCard'
import ScoreBar from '@/components/ui/ScoreBar'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { supabase, type Applicant } from '@/lib/supabase'

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
  const avgScore = applicants.length
    ? Math.round(applicants.reduce((s, a) => s + (a.score || 0), 0) / applicants.length)
    : 0

  return (
    <div className="animate-fade-up">
      <div className="grid grid-cols-4 gap-4 mb-7 stagger-1 animate-fade-up">
        <StatCard label="Total applicants" value={applicants.length} sub="Across all open roles" />
        <StatCard label="Review queue" value={reviewQueue} sub="Awaiting hiring manager" />
        <StatCard label="Shortlisted" value={shortlisted} sub="Grade A or above" />
        <StatCard label="Avg score" value={applicants.length ? `${avgScore}%` : '—'} sub="This posting" />
      </div>

      <div className="flex gap-5 stagger-2 animate-fade-up">
        {/* List */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[12px] font-medium text-stone-400 uppercase tracking-widest">All applicants</p>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm"><Filter size={12} />Filter</Button>
              <Button variant="secondary" size="sm"><Download size={12} />Export</Button>
            </div>
          </div>

          {loading ? (
            <div className="text-[13px] text-stone-400 py-8 text-center">Loading...</div>
          ) : applicants.length === 0 ? (
            <div className="text-[13px] text-stone-400 py-12 text-center border border-dashed border-stone-300 rounded-xl">
              No applicants yet. Share your public application form link to start receiving applications.
            </div>
          ) : (
            <div className="space-y-2">
              {applicants.map((a) => (
                <button key={a.id} onClick={() => setSelected(a)}
                  className={`w-full text-left flex items-center gap-3.5 px-4 py-3.5 rounded-lg border transition-all duration-150 ${
                    selected?.id === a.id ? 'bg-stone-50 border-stone-300 shadow-sm' : 'bg-stone-50 border-stone-200 hover:border-stone-300'
                  }`}>
                  <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center text-[11px] font-medium text-stone-600 flex-shrink-0">
                    {a.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-stone-800 leading-none">{a.name}</p>
                    <p className="text-[12px] text-stone-400 mt-0.5">
                      {(a as any).jobs?.title || 'Applicant'} · Applied {new Date(a.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  {a.grade && <Badge label={a.grade} variant="grade" grade={a.grade} />}
                  {selected?.id === a.id && <ChevronRight size={13} className="text-stone-300 flex-shrink-0" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Detail panel */}
        {selected && (
          <div className="w-[300px] flex-shrink-0">
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-5 sticky top-[76px]">
              <div className="flex items-center gap-3 pb-4 mb-4 border-b border-stone-200">
                <div className="w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center text-[13px] font-medium text-stone-600">
                  {selected.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-[14px] font-medium text-stone-900 leading-none">{selected.name}</p>
                  <p className="text-[12px] text-stone-400 mt-0.5">{selected.email}</p>
                </div>
              </div>

              {selected.grade ? (
                <>
                  <div className="mb-5">
                    <div className="flex items-baseline gap-2">
                      <span className="text-[42px] font-medium tracking-tighter text-stone-900 leading-none">{selected.grade}</span>
                      {selected.score && <span className="text-[12px] text-stone-400">{selected.score}/100</span>}
                    </div>
                    {selected.score_summary && (
                      <p className="text-[12px] text-stone-500 mt-1.5 leading-snug">{selected.score_summary}</p>
                    )}
                  </div>

                  {selected.score_breakdown && (
                    <div className="mb-4 pb-4 border-b border-stone-200">
                      {Object.entries(selected.score_breakdown).map(([k, v]) => (
                        <ScoreBar key={k} label={k} value={v as number} />
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="mb-4 pb-4 border-b border-stone-200">
                  <p className="text-[12px] text-stone-400">Scoring pending</p>
                </div>
              )}

              {/* Activity log */}
              {selected.activity_log && selected.activity_log.length > 0 && (
                <div className="mb-4 pb-4 border-b border-stone-200">
                  <p className="text-[11px] font-medium text-stone-400 uppercase tracking-widest mb-3">Activity log</p>
                  <div className="space-y-2.5">
                    {selected.activity_log.map((a: any, i: number) => (
                      <div key={i} className="flex items-start gap-2.5">
                        <CheckCircle size={13} className="text-stone-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-[12px] text-stone-600 leading-snug">{a.label}</p>
                          <p className="text-[11px] text-stone-400">{a.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-2">
                <Button variant="primary" size="sm" className="w-full justify-center">
                  <Mail size={12} />Contact applicant
                </Button>
                <Button variant="secondary" size="sm" className="w-full justify-center">
                  <Video size={12} />Schedule interview
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
