'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin() {
    if (!email || !password) {
      setError('Please enter your email and password.')
      return
    }
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('Invalid email or password.')
      setLoading(false)
      return
    }
    router.push('/dashboard/recruiting/applicants')
    router.refresh()
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#F2F2F2',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      padding: '24px',
    }}>
      <div style={{ width: '100%', maxWidth: 400 }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 40, justifyContent: 'center' }}>
          <div style={{
            width: 38, height: 38, borderRadius: 11,
            backgroundColor: '#111111',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontSize: 16, fontWeight: 800, color: '#FFFFFF' }}>M</span>
          </div>
          <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.03em', color: '#111111' }}>Meridian</span>
        </div>

        {/* Card */}
        <div style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E8E8E8',
          borderRadius: 20,
          padding: '36px 32px',
        }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111111', letterSpacing: '-0.03em', marginBottom: 6 }}>
            Welcome back
          </h1>
          <p style={{ fontSize: 13, color: '#888888', marginBottom: 28, lineHeight: 1.5 }}>
            Sign in to your Meridian workspace.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#111111', display: 'block', marginBottom: 6 }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                placeholder="you@company.com"
                style={{
                  width: '100%', boxSizing: 'border-box',
                  padding: '10px 14px',
                  border: '1px solid #E8E8E8',
                  borderRadius: 10,
                  fontSize: 13,
                  color: '#111111',
                  backgroundColor: '#FAFAFA',
                  outline: 'none',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#111111', display: 'block', marginBottom: 6 }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                placeholder="••••••••"
                style={{
                  width: '100%', boxSizing: 'border-box',
                  padding: '10px 14px',
                  border: '1px solid #E8E8E8',
                  borderRadius: 10,
                  fontSize: 13,
                  color: '#111111',
                  backgroundColor: '#FAFAFA',
                  outline: 'none',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              />
            </div>

            {error && (
              <p style={{ fontSize: 12, color: '#E53935', backgroundColor: '#FFF5F5', padding: '10px 12px', borderRadius: 8, border: '1px solid #FFCDD2' }}>
                {error}
              </p>
            )}

            <button
              onClick={handleLogin}
              disabled={loading}
              style={{
                width: '100%',
                padding: '11px',
                backgroundColor: loading ? '#555555' : '#111111',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 999,
                fontSize: 13,
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                marginTop: 4,
                transition: 'background-color 0.15s',
              }}
            >
              {loading ? 'Signing in...' : 'Sign in →'}
            </button>
          </div>
        </div>

        <p style={{ fontSize: 11, color: '#BBBBBB', textAlign: 'center', marginTop: 20 }}>
          Meridian HR · Access is by invitation only.
        </p>
      </div>
    </div>
  )
}
