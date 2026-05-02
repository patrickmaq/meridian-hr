'use client'

import Button from '@/components/ui/Button'

export default function SettingsPage() {
  return (
    <div className="animate-fade-up max-w-2xl">
      <div className="space-y-5 stagger-1 animate-fade-up">
        {[
          { section: 'Workspace', fields: [
            { label: 'Company name', value: 'Meridian HR', type: 'text' },
            { label: 'Admin email', value: 'patrickmaqconsulting@gmail.com', type: 'email' },
          ]},
          { section: 'AI scoring', fields: [
            { label: 'Anthropic API key', value: '', type: 'password', placeholder: 'sk-ant-...' },
            { label: 'Default scoring model', value: 'claude-sonnet-4-6', type: 'text' },
          ]},
          { section: 'Supabase', fields: [
            { label: 'Project URL', value: '', type: 'text', placeholder: 'https://xyz.supabase.co' },
            { label: 'Anon key', value: '', type: 'password', placeholder: 'eyJ...' },
          ]},
        ].map((group) => (
          <div key={group.section} className="bg-stone-50 border border-stone-200 rounded-xl p-5">
            <p className="text-[12px] font-medium text-stone-400 uppercase tracking-widest mb-4">{group.section}</p>
            <div className="space-y-3">
              {group.fields.map((f) => (
                <div key={f.label}>
                  <label className="block text-[12px] font-medium text-stone-600 mb-1.5">{f.label}</label>
                  <input
                    type={f.type}
                    defaultValue={f.value}
                    placeholder={f.placeholder}
                    className="w-full bg-white border border-stone-200 rounded-md px-3 py-2 text-[13px] text-stone-800 placeholder:text-stone-400 focus:outline-none focus:border-stone-400 transition-colors"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
        <Button variant="primary" size="md">Save changes</Button>
      </div>
    </div>
  )
}
