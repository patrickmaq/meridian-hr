'use client'

import { ChevronRight } from 'lucide-react'

const stages = [
  {
    name: 'Applied',
    count: 24,
    color: 'bg-stone-200',
    candidates: [
      { name: 'Sofia Reyes', role: 'Sr. Account Manager', grade: 'A+' },
      { name: 'James Mercer', role: 'Sr. Account Manager', grade: 'B+' },
      { name: 'Priya Kapoor', role: 'Sr. Account Manager', grade: 'B' },
    ],
  },
  {
    name: 'Screening',
    count: 8,
    color: 'bg-stone-400',
    candidates: [
      { name: 'Daniel Chen', role: 'Marketing Coord.', grade: 'C+' },
      { name: 'Amara Levin', role: 'Marketing Coord.', grade: 'C' },
    ],
  },
  {
    name: 'Interview',
    count: 4,
    color: 'bg-stone-600',
    candidates: [
      { name: 'Marcus Webb', role: 'Ops Manager', grade: 'A' },
    ],
  },
  {
    name: 'Offer',
    count: 1,
    color: 'bg-stone-800',
    candidates: [
      { name: 'Rachel Kim', role: 'Sr. Account Manager', grade: 'A+' },
    ],
  },
]

export default function PipelinesPage() {
  return (
    <div className="animate-fade-up">
      <p className="text-[12px] font-medium text-stone-400 uppercase tracking-widest mb-5 stagger-1 animate-fade-up">
        Hiring pipeline — all roles
      </p>
      <div className="grid grid-cols-4 gap-4 stagger-2 animate-fade-up">
        {stages.map((stage) => (
          <div key={stage.name} className="bg-stone-50 border border-stone-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-4">
              <div className={`w-2 h-2 rounded-full ${stage.color}`} />
              <p className="text-[13px] font-medium text-stone-700">{stage.name}</p>
              <span className="ml-auto text-[12px] text-stone-400">{stage.count}</span>
            </div>
            <div className="space-y-2">
              {stage.candidates.map((c) => (
                <div key={c.name} className="bg-white border border-stone-200 rounded-lg px-3 py-2.5 cursor-pointer hover:border-stone-300 transition-all">
                  <p className="text-[12px] font-medium text-stone-800 leading-none">{c.name}</p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-[11px] text-stone-400">{c.role}</p>
                    <span className="text-[10px] font-medium bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded">{c.grade}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
