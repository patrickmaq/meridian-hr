'use client'

import { Plus, Search } from 'lucide-react'
import StatCard from '@/components/ui/StatCard'
import Button from '@/components/ui/Button'

const employees = [
  { name: 'Rachel Kim', role: 'Senior Account Manager', dept: 'Sales', start: 'Jan 2024', status: 'Active', initials: 'RK' },
  { name: 'Marcus Webb', role: 'Operations Manager', dept: 'Ops', start: 'Mar 2023', status: 'Active', initials: 'MW' },
  { name: 'Ling Zhao', role: 'Marketing Lead', dept: 'Marketing', start: 'Aug 2022', status: 'Active', initials: 'LZ' },
  { name: 'Tom Bradley', role: 'Junior Developer', dept: 'Technology', start: 'Feb 2025', status: 'Active', initials: 'TB' },
  { name: 'Sarah Noel', role: 'HR Coordinator', dept: 'People', start: 'Nov 2023', status: 'Active', initials: 'SN' },
  { name: 'Andre Dupont', role: 'Sales Executive', dept: 'Sales', start: 'Jun 2021', status: 'On leave', initials: 'AD' },
]

export default function EmployeesPage() {
  return (
    <div className="animate-fade-up">
      <div className="grid grid-cols-4 gap-4 mb-7 stagger-1 animate-fade-up">
        <StatCard label="Total employees" value={42} />
        <StatCard label="Departments" value={6} />
        <StatCard label="On leave" value={2} />
        <StatCard label="New this quarter" value={5} />
      </div>

      <div className="stagger-2 animate-fade-up">
        <div className="flex items-center justify-between mb-4">
          <p className="text-[12px] font-medium text-stone-400 uppercase tracking-widest">Team directory</p>
          <Button variant="primary" size="sm"><Plus size={12} />Add employee</Button>
        </div>

        <div className="bg-stone-50 border border-stone-200 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-stone-200">
                <th className="text-left px-5 py-3 text-[11px] font-medium text-stone-400 uppercase tracking-widest">Name</th>
                <th className="text-left px-5 py-3 text-[11px] font-medium text-stone-400 uppercase tracking-widest">Role</th>
                <th className="text-left px-5 py-3 text-[11px] font-medium text-stone-400 uppercase tracking-widest">Department</th>
                <th className="text-left px-5 py-3 text-[11px] font-medium text-stone-400 uppercase tracking-widest">Start date</th>
                <th className="text-left px-5 py-3 text-[11px] font-medium text-stone-400 uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((e, i) => (
                <tr key={e.name} className={`border-b border-stone-100 hover:bg-stone-100 cursor-pointer transition-colors ${i === employees.length - 1 ? 'border-0' : ''}`}>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-stone-200 flex items-center justify-center text-[10px] font-medium text-stone-600 flex-shrink-0">
                        {e.initials}
                      </div>
                      <span className="text-[13px] font-medium text-stone-800">{e.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-[13px] text-stone-500">{e.role}</td>
                  <td className="px-5 py-3.5 text-[13px] text-stone-500">{e.dept}</td>
                  <td className="px-5 py-3.5 text-[13px] text-stone-500">{e.start}</td>
                  <td className="px-5 py-3.5">
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded ${e.status === 'Active' ? 'bg-stone-800 text-stone-100' : 'bg-stone-200 text-stone-500'}`}>
                      {e.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
