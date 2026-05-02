'use client'

import { usePathname } from 'next/navigation'
import { Bell, Search } from 'lucide-react'

const routeTitles: Record<string, { title: string; subtitle: string }> = {
  '/dashboard/recruiting/applicants': { title: 'Applicants', subtitle: 'Review and score incoming applications' },
  '/dashboard/recruiting/jobs':       { title: 'Job postings', subtitle: 'Manage open roles and application forms' },
  '/dashboard/recruiting/pipelines':  { title: 'Pipelines', subtitle: 'Track candidates through hiring stages' },
  '/dashboard/people/employees':      { title: 'Employees', subtitle: 'Your team directory' },
  '/dashboard/people/performance':    { title: 'Performance', subtitle: 'Reviews, goals, and feedback' },
  '/dashboard/people/training':       { title: 'Training', subtitle: 'Track training progress and completions' },
  '/dashboard/docs/procedures':       { title: 'SOPs & procedures', subtitle: 'Operating documents and reference material' },
  '/dashboard/docs/assessments':      { title: 'Assessments', subtitle: 'Tests and evaluation tools' },
  '/dashboard/settings':              { title: 'Settings', subtitle: 'Workspace configuration' },
}

export default function Topbar() {
  const pathname = usePathname()
  const meta = routeTitles[pathname] ?? { title: 'Meridian', subtitle: '' }

  return (
    <header
      style={{ height: 'var(--topbar-height)', marginLeft: 'var(--sidebar-width)' }}
      className="fixed top-0 right-0 bg-stone-50/90 backdrop-blur-sm border-b border-stone-200 flex items-center px-7 z-20"
    >
      <div className="flex-1">
        <h1 className="text-[15px] font-medium tracking-tight text-stone-900 leading-none">{meta.title}</h1>
        {meta.subtitle && (
          <p className="text-[12px] text-stone-400 mt-0.5 leading-none">{meta.subtitle}</p>
        )}
      </div>
      <div className="flex items-center gap-2">
        <button className="w-8 h-8 rounded flex items-center justify-center text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-all">
          <Search size={15} />
        </button>
        <button className="w-8 h-8 rounded flex items-center justify-center text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-all relative">
          <Bell size={15} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-stone-500" />
        </button>
      </div>
    </header>
  )
}
