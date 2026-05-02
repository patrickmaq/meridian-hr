'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'
import {
  Users, Briefcase, GitBranch,
  UserCheck, TrendingUp, BookOpen,
  FileText, ClipboardList, Settings,
  ChevronRight
} from 'lucide-react'

const nav = [
  {
    label: 'Recruiting',
    items: [
      { href: '/dashboard/recruiting/applicants', label: 'Applicants', icon: Users },
      { href: '/dashboard/recruiting/jobs', label: 'Job postings', icon: Briefcase },
      { href: '/dashboard/recruiting/pipelines', label: 'Pipelines', icon: GitBranch },
    ],
  },
  {
    label: 'People',
    items: [
      { href: '/dashboard/people/employees', label: 'Employees', icon: UserCheck },
      { href: '/dashboard/people/performance', label: 'Performance', icon: TrendingUp },
      { href: '/dashboard/people/training', label: 'Training', icon: BookOpen },
    ],
  },
  {
    label: 'Documents',
    items: [
      { href: '/dashboard/docs/procedures', label: 'SOPs & procedures', icon: FileText },
      { href: '/dashboard/docs/assessments', label: 'Assessments', icon: ClipboardList },
    ],
  },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside
      style={{ width: 'var(--sidebar-width)' }}
      className="fixed top-0 left-0 h-screen bg-stone-50 border-r border-stone-200 flex flex-col z-30"
    >
      {/* Logo */}
      <div className="px-5 py-5 border-b border-stone-200">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded bg-stone-800 flex items-center justify-center flex-shrink-0">
            <span className="text-stone-50 text-[9px] font-semibold tracking-widest">M</span>
          </div>
          <div>
            <p className="text-[13px] font-medium tracking-tight text-stone-900 leading-none">Meridian</p>
            <p className="text-[10px] text-stone-400 mt-0.5 leading-none">HR Platform</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {nav.map((section) => (
          <div key={section.label} className="mb-5">
            <p className="text-[10px] font-medium text-stone-400 uppercase tracking-widest px-2 mb-1.5">
              {section.label}
            </p>
            {section.items.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(href)
              return (
                <Link
                  key={href}
                  href={href}
                  className={clsx(
                    'flex items-center gap-2.5 px-2.5 py-2 rounded text-[13px] transition-all duration-150 mb-0.5 group',
                    active
                      ? 'bg-stone-200 text-stone-900 font-medium'
                      : 'text-stone-500 hover:text-stone-800 hover:bg-stone-100'
                  )}
                >
                  <Icon size={14} strokeWidth={active ? 2 : 1.5} className="flex-shrink-0" />
                  <span className="flex-1">{label}</span>
                  {active && <ChevronRight size={11} className="text-stone-400" />}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-stone-200">
        <Link
          href="/dashboard/settings"
          className="flex items-center gap-2.5 px-2.5 py-2 rounded text-[13px] text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition-all duration-150"
        >
          <Settings size={14} strokeWidth={1.5} />
          <span>Settings</span>
        </Link>
        <div className="flex items-center gap-2.5 px-2.5 py-2 mt-1">
          <div className="w-6 h-6 rounded-full bg-stone-200 flex items-center justify-center text-[10px] font-medium text-stone-600">
            P
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-medium text-stone-700 leading-none">Patrick</p>
            <p className="text-[10px] text-stone-400 mt-0.5">Admin</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
