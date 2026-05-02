'use client'

import { usePathname } from 'next/navigation'
import { Bell, Search } from 'lucide-react'

const routeTitles: Record<string, { title: string; subtitle: string }> = {
  '/dashboard/recruiting/applicants': { title: 'Applicants', subtitle: 'Review and score incoming applications' },
  '/dashboard/recruiting/jobs':       { title: 'Job postings', subtitle: 'Manage open roles and application forms' },
  '/dashboard/recruiting/pipelines':  { title: 'Pipelines', subtitle: 'Track candidates through hiring stages' },
  '/dashboard/people/employees':      { title: 'Employees', subtitle: 'Your team directory' },
  '/dashboard/people/performance':    { title: 'Performance', subtitle: 'Reviews, goals, and feedback' },
  '/dashboard/people/training':       { title: 'Training', subtitle: 'Track training progress' },
  '/dashboard/docs/procedures':       { title: 'SOPs & procedures', subtitle: 'Operating documents and reference material' },
  '/dashboard/docs/assessments':      { title: 'Assessments', subtitle: 'Tests and evaluation tools' },
  '/dashboard/settings':              { title: 'Settings', subtitle: 'Workspace configuration' },
}

export default function Topbar() {
  const pathname = usePathname()
  const meta = routeTitles[pathname] ?? { title: 'Meridian', subtitle: '' }

  return (
    <header style={{
      height: 'var(--topbar-height)',
      marginLeft: 'var(--sidebar-width)',
      position: 'fixed', top: 0, right: 0,
      backgroundColor: '#FFFFFF',
      borderBottom: '1px solid #E8E8E8',
      display: 'flex', alignItems: 'center',
      padding: '0 32px', zIndex: 20,
    }}>
      <div style={{ flex: 1 }}>
        <h1 style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1, color: '#111111' }}>{meta.title}</h1>
        {meta.subtitle && <p style={{ fontSize: 12, color: '#AAAAAA', marginTop: 3, lineHeight: 1 }}>{meta.subtitle}</p>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <button style={{
          width: 36, height: 36, borderRadius: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#AAAAAA', background: 'none', border: 'none', cursor: 'pointer',
        }}>
          <Search size={16} />
        </button>
        <button style={{
          width: 36, height: 36, borderRadius: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#AAAAAA', background: 'none', border: 'none', cursor: 'pointer',
          position: 'relative',
        }}>
          <Bell size={16} />
          <span style={{
            position: 'absolute', top: 8, right: 8,
            width: 6, height: 6, borderRadius: '50%',
            backgroundColor: '#111111',
          }} />
        </button>
      </div>
    </header>
  )
}