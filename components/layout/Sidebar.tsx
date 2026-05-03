'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Users, Briefcase, GitBranch,
  UserCheck, TrendingUp, BookOpen,
  FileText, ClipboardList, Settings, LogOut,
} from 'lucide-react'
import { createClient } from '@/lib/supabase-browser'
import { useEffect, useState } from 'react'

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
  const router = useRouter()
  const supabase = createClient()
  const [userEmail, setUserEmail] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email ?? null)
    })
  }, [])

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const initials = userEmail ? userEmail[0].toUpperCase() : '?'
  const displayName = userEmail ? userEmail.split('@')[0] : 'User'

  return (
    <aside style={{
      width: 'var(--sidebar-width)',
      backgroundColor: '#FFFFFF',
      borderRight: '1px solid #E8E8E8',
      position: 'fixed', top: 0, left: 0,
      height: '100vh',
      display: 'flex', flexDirection: 'column',
      zIndex: 30,
    }}>
      {/* Logo */}
      <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid #F0F0F0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            backgroundColor: '#111111',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <span style={{ fontSize: 14, fontWeight: 800, color: '#FFFFFF' }}>M</span>
          </div>
          <div>
            <p style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1, color: '#111111' }}>Meridian</p>
            <p style={{ fontSize: 10, marginTop: 3, lineHeight: 1, color: '#AAAAAA' }}>HR Platform</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '16px 12px' }}>
        {nav.map((section) => (
          <div key={section.label} style={{ marginBottom: 20 }}>
            <p style={{
              fontSize: 10, fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '0.08em',
              padding: '0 10px', marginBottom: 4, color: '#CCCCCC',
            }}>
              {section.label}
            </p>
            {section.items.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(href)
              return (
                <Link key={href} href={href} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '9px 10px', borderRadius: 10,
                  fontSize: 13, fontWeight: active ? 600 : 400,
                  marginBottom: 1,
                  backgroundColor: active ? '#111111' : 'transparent',
                  color: active ? '#FFFFFF' : '#666666',
                  textDecoration: 'none',
                  transition: 'all 0.15s',
                }}>
                  <Icon size={15} strokeWidth={active ? 2.5 : 1.8} style={{ flexShrink: 0 }} />
                  {label}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div style={{ padding: '12px', borderTop: '1px solid #F0F0F0' }}>
        <Link href="/dashboard/settings" style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '9px 10px', borderRadius: 10,
          fontSize: 13, color: '#888888',
          textDecoration: 'none', marginBottom: 8,
        }}>
          <Settings size={15} strokeWidth={1.8} />
          Settings
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px' }}>
          <div style={{
            width: 30, height: 30, borderRadius: '50%',
            backgroundColor: '#111111',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 700, color: '#FFFFFF', flexShrink: 0,
          }}>{initials}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 600, lineHeight: 1, color: '#111111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{displayName}</p>
            <p style={{ fontSize: 10, marginTop: 3, color: '#AAAAAA' }}>Admin</p>
          </div>
          <button
            onClick={handleSignOut}
            title="Sign out"
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: 4, borderRadius: 6, color: '#CCCCCC',
              display: 'flex', alignItems: 'center',
              transition: 'color 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = '#111111')}
            onMouseLeave={e => (e.currentTarget.style.color = '#CCCCCC')}
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  )
}