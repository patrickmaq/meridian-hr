'use client'

import StatCard from '@/components/ui/StatCard'
import ScoreBar from '@/components/ui/ScoreBar'
import Button from '@/components/ui/Button'
import { Plus } from 'lucide-react'

const reviews = [
  { name: 'Rachel Kim', role: 'Sr. Account Manager', cycle: 'Q1 2026', overall: 88, scores: { goals: 92, communication: 85, initiative: 90, teamwork: 82 }, status: 'Complete', initials: 'RK' },
  { name: 'Marcus Webb', role: 'Operations Manager', cycle: 'Q1 2026', overall: 79, scores: { goals: 80, communication: 75, initiative: 82, teamwork: 79 }, status: 'Complete', initials: 'MW' },
  { name: 'Ling Zhao', role: 'Marketing Lead', cycle: 'Q1 2026', overall: 91, scores: { goals: 95, communication: 88, initiative: 92, teamwork: 89 }, status: 'Complete', initials: 'LZ' },
  { name: 'Tom Bradley', role: 'Junior Developer', cycle: 'Q1 2026', overall: 72, scores: { goals: 70, communication: 74, initiative: 72, teamwork: 75 }, status: 'Draft', initials: 'TB' },
]

export default function PerformancePage() {
  return (
    <div className="animate-fade-up">
      <div className="grid grid-cols-4 gap-4 mb-7 stagger-1 animate-fade-up">
        <StatCard label="Active cycle" value="Q1 2026" />
        <StatCard label="Reviews complete" value="18 / 24" />
        <StatCard label="Team avg score" value="82%" />
        <StatCard label="Pending reviews" value={6} />
      </div>

      <div className="stagger-2 animate-fade-up">
        <div className="flex items-center justify-between mb-4">
          <p className="text-[12px] font-medium text-stone-400 uppercase tracking-widest">Q1 2026 reviews</p>
          <Button variant="primary" size="sm"><Plus size={12} />New review</Button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {reviews.map((r) => (
            <div key={r.name} className="bg-stone-50 border border-stone-200 rounded-xl p-5 hover:border-stone-300 cursor-pointer transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-full bg-stone-200 flex items-center justify-center text-[12px] font-medium text-stone-600">
                  {r.initials}
                </div>
                <div className="flex-1">
                  <p className="text-[13px] font-medium text-stone-900">{r.name}</p>
                  <p className="text-[12px] text-stone-400">{r.role}</p>
                </div>
                <div className="text-right">
                  <p className="text-[22px] font-medium tracking-tighter text-stone-900 leading-none">{r.overall}</p>
                  <p className="text-[10px] text-stone-400 mt-0.5">/100</p>
                </div>
              </div>
              <ScoreBar label="Goals & outcomes" value={r.scores.goals} />
              <ScoreBar label="Communication" value={r.scores.communication} />
              <ScoreBar label="Initiative" value={r.scores.initiative} />
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-stone-200">
                <span className="text-[11px] text-stone-400">{r.cycle}</span>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${r.status === 'Complete' ? 'bg-stone-800 text-stone-100' : 'bg-stone-200 text-stone-500'}`}>
                  {r.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
