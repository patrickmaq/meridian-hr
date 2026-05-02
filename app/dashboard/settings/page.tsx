'use client'

import { useEffect, useState } from 'react'
import Button from '@/components/ui/Button'
import { supabase } from '@/lib/supabase'
import { CheckCircle, AlertCircle } from 'lucide-react'

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadKey() {
      const { data } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'anthropic_api_key')
        .single()
      if (data?.value) setApiKey(data.value)
    }
    loadKey()
  }, [])

  async function handleSave() {
    setSaving(true)
    setSaved(false)
    setError('')
    const { error: err } = await supabase
      .from('settings')
      .upsert({ key: 'anthropic_api_key', value: apiKey, updated_at: new Date().toISOString() }, { onConflict: 'key' })
    setSaving(false)
    if (err) {
      setError('Save failed. Try again.')
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
  }

  const card: React.CSSProperties = {
    backgroundColor: '#FDFCF8',
    border: '1.5px solid #E2D9CA',
    borderRadius: 16,
    padding: '20px 24px',
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    backgroundColor: '#fff',
    border: '1.5px solid #E2D9CA',
    borderRadius: 10,
    padding: '10px 14px',
    fontSize: 13,
    color: '#1A1208',
    fontFamily: 'inherit',
    outline: 'none',
    boxSizing: 'border-box',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 12,
    fontWeight: 600,
    color: '#8C7E6A',
    marginBottom: 6,
  }

  return (
    <div className="animate-fade-up" style={{ maxWidth: 560 }}>
      <div className="stagger-1 animate-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={card}>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#A89780', marginBottom: 16 }}>Workspace</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={labelStyle}>Company name</label>
              <input style={inputStyle} type="text" defaultValue="Meridian HR" />
            </div>
            <div>
              <label style={labelStyle}>Admin email</label>
              <input style={inputStyle} type="email" defaultValue="patrickmaqconsulting@gmail.com" />
            </div>
          </div>
        </div>
        <div style={card}>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#A89780', marginBottom: 4 }}>AI Scoring</p>
          <p style={{ fontSize: 12, color: '#A89780', marginBottom: 16, lineHeight: 1.5 }}>
            Candidates are automatically scored when they submit an application. Add your Anthropic API key to enable this feature.
          </p>
          <div>
            <label style={labelStyle}>Anthropic API key</label>
            <input
              style={inputStyle}
              type="password"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder="sk-ant-..."
            />
            <p style={{ fontSize: 11, color: '#A89780', marginTop: 6 }}>
              Get your key at console.anthropic.com
            </p>
          </div>
          {saved && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12, color: '#5a7a5a', fontSize: 12 }}>
              <CheckCircle size={13} />
              API key saved.
            </div>
          )}
          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12, color: '#a05a5a', fontSize: 12 }}>
              <AlertCircle size={13} />
              {error}
            </div>
          )}
        </div>
        <div>
          <Button variant="primary" size="md" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save changes'}
          </Button>
        </div>
      </div>
    </div>
  )
}
