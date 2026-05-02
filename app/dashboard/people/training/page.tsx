'use client'

import StatCard from '@/components/ui/StatCard'
import Button from '@/components/ui/Button'
import { Plus, CheckCircle, Clock, Circle } from 'lucide-react'

const trainings = [
  { title: 'Employee onboarding', desc: 'Required for all new hires', assigned: 8, completed: 6, due: 'May 15, 2026' },
  { title: 'Workplace health & safety', desc: 'Annual compliance training', assigned: 42, completed: 38, due: 'Jun 1, 2026' },
  { title: 'Sales methodology — MEDDIC', desc: 'Sales team only', assigned: 7, completed: 3, due: 'May 30, 2026' },
  { title: 'Data privacy & PIPEDA', desc: 'Required for all staff', assigned: 42, completed: 40, due: 'Apr 30, 2026' },
]

const records = [
  { name: 'Rachel Kim', course: 'Sales methodology — MEDDIC', status: 'Complete', date: 'Apr 22, 2026', initials: 'RK' },
  { name: 'Marcus Webb', course: 'Workplace health & safety', status: 'Complete', date: 'Apr 18, 2026', initials: 'MW' },
  { name: 'Tom Bradley', course: 'Employee onboarding', status: 'In progress', date: '—', initials: 'TB' },
  { name: 'Sarah Noel', course: 'Data privacy & PIPEDA', status: 'Complete', date: 'Apr 10, 2026', initials: 'SN' },
  { name: 'Andre Dupont', course: 'Workplace health & safety', status: 'Overdue', date: '—', initials: 'AD' },
]

function statusStyle(s: string) {
  if (s === 'Complete') return 'bg-stone-800 text-stone-100'
  if (s === 'In progress') return 'bg-stone-200 text-stone-600'
  return 'bg-blush-light text-stone-600 border border-blush'
}

export default function TrainingPage() {
  return (
    <div className="animate-fade-up">
      <div className="grid grid-cols-4 gap-4 mb-7 stagger-1 animate-fade-up">
        <StatCard label="Active courses" value={4} />
        <StatCard label="Completions" value={87} sub="This month" />
        <StatCard label="Completion rate" value="91%" />
        <StatCard label="Overdue" value={3} />
      </div>

      <div className="grid grid-cols-5 gap-5 stagger-2 animate-fade-up">
        <div className="col-span-2 space-y-3">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[12px] font-medium text-stone-400 uppercase tracking-widest">Courses</p>
            <Button variant="primary" size="sm"><Plus size={12} />New course</Button>
          </div>
          {trainings.map((t) => {
            const pct = Math.round((t.completed / t.assigned) * 100)
            return (
              <div key={t.title} className="bg-stone-50 border border-stone-200 rounded-lg p-4 cursor-pointer hover:border-stone-300 transition-all">
                <p className="text-[13px] font-medium text-stone-800 mb-0.5">{t.title}</p>
                <p className="text-[12px] text-stone-400 mb-3">{t.desc} · Due {t.due}</p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-[3px] bg-stone-200 rounded-full overflow-hidden">
                    <div className="h-full bg-stone-700 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-[11px] text-stone-500 flex-shrink-0">{t.completed}/{t.assigned}</span>
                </div>
              </div>
            )
          })}
        </div>

        <div className="col-span-3">
          <p className="text-[12px] font-medium text-stone-400 uppercase tracking-widest mb-4">Recent completions & status</p>
          <div className="bg-stone-50 border border-stone-200 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-stone-200">
                  <th className="text-left px-4 py-3 text-[11px] font-medium text-stone-400 uppercase tracking-widest">Employee</th>
                  <th className="text-left px-4 py-3 text-[11px] font-medium text-stone-400 uppercase tracking-widest">Course</th>
                  <th className="text-left px-4 py-3 text-[11px] font-medium text-stone-400 uppercase tracking-widest">Status</th>
                  <th className="text-left px-4 py-3 text-[11px] font-medium text-stone-400 uppercase tracking-widest">Completed</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r, i) => (
                  <tr key={r.name + r.course} className={`border-b border-stone-100 hover:bg-stone-100 transition-colors ${i === records.length - 1 ? 'border-0' : ''}`}>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-full bg-stone-200 flex items-center justify-center text-[9px] font-medium text-stone-600">
                          {r.initials}
                        </div>
                        <span className="text-[12px] font-medium text-stone-700">{r.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-[12px] text-stone-500">{r.course}</td>
                    <td className="px-4 py-3.5">
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${statusStyle(r.status)}`}>{r.status}</span>
                    </td>
                    <td className="px-4 py-3.5 text-[12px] text-stone-400">{r.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
