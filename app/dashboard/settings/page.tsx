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
      setError('Failed to save. Please try