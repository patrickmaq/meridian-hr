'use client'

import { Plus, ClipboardList, ChevronRight } from 'lucide-react'
import StatCard from '@/components/ui/StatCard'
import Button from '@/components/ui/Button'

const assessments = [
  { title: 'Sales aptitude test', role: 'Sales team', questions: 24, avgScore: '71%', completions: 18 },
  { title: 'Communication skills assessment', role: 'All roles', questions: 15, avgScore: '84%', completions: 42 },
  { title: 'Operations knowledge test', role: 'Ops team', questions: 30, avgScore: '68%', completions: 9 },
  { title: 'Technical skills — web fundamentals', role: 'Technology', questions: 40, avgScore: '77%', completions: 5 },
]

export default function AssessmentsPage() {
  return (
    <div className="animate-fade-up">
      <div className="grid grid-cols-3 gap-4 mb-7 stagger-1 animate-fade-up">
        <StatCard label="Active assessments" value={4} />
        <StatCard label="Total completions" value={74} />
        <StatCard label="Avg score" value="75%" />
      </div>

      <div className="stagger-2 animate-fade-up">
        <div className="flex items-center justify-between mb-4">
          <p className="text-[12px] font-medium text-stone-400 uppercase tracking-widest">All assessments</p>
          <Button variant="primary" size="sm"><Plus size={12} />Create assessment</Button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {assessments.map((a) => (
            <div key={a.title} className="bg-stone-50 border border-stone-200 rounded-xl p-5 hover:border-stone-300 cursor-pointer transition-all group">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-[14px] font-medium text-stone-900 mb-0.5">{a.title}</p>
                  <p className="text-[12px] text-stone-400">{a.role}</p>
                </div>
                <ChevronRight size={14} className="text-stone-300 group-hover:text-stone-500 transition-colors mt-0.5" />
              </div>
              <div className="grid grid-cols-3 gap-3 pt-3 border-t border-stone-200">
                <div>
                  <p className="text-[18px] font-medium tracking-tight text-stone-800 leading-none">{a.questions}</p>
                  <p className="text-[10px] text-stone-400 mt-0.5">questions</p>
                </div>
                <div>
                  <p className="text-[18px] font-medium tracking-tight text-stone-800 leading-none">{a.avgScore}</p>
                  <p className="text-[10px] text-stone-400 mt-0.5">avg score</p>
                </div>
                <div>
                  <p className="text-[18px] font-medium tracking-tight text-stone-800 leading-none">{a.completions}</p>
                  <p className="text-[10px] text-stone-400 mt-0.5">completions</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
