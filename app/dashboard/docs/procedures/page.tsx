'use client'

import { Upload, FileText, ChevronRight, Plus } from 'lucide-react'
import Button from '@/components/ui/Button'

const docs = [
  { title: 'Employee onboarding checklist', updated: 'Apr 28, 2026', category: 'Onboarding', size: '84 KB' },
  { title: 'Remote work policy', updated: 'Mar 15, 2026', category: 'Policy', size: '52 KB' },
  { title: 'Sales call standards & script guide', updated: 'Feb 20, 2026', category: 'Sales', size: '210 KB' },
  { title: 'Customer escalation procedure', updated: 'Jan 10, 2026', category: 'Operations', size: '96 KB' },
  { title: 'Health & safety manual', updated: 'Dec 5, 2025', category: 'Compliance', size: '1.2 MB' },
  { title: 'Brand voice & communications guide', updated: 'Nov 22, 2025', category: 'Marketing', size: '340 KB' },
]

export default function ProceduresPage() {
  return (
    <div className="animate-fade-up">
      {/* Upload zone */}
      <div className="stagger-1 animate-fade-up border-2 border-dashed border-stone-300 rounded-xl py-10 px-6 flex flex-col items-center text-center mb-7 hover:border-stone-400 transition-colors cursor-pointer group">
        <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center mb-3 group-hover:bg-stone-200 transition-colors">
          <Upload size={18} className="text-stone-500" />
        </div>
        <p className="text-[14px] font-medium text-stone-700 mb-1">Upload a document</p>
        <p className="text-[12px] text-stone-400">Drop any PDF, Word doc, or file here — or click to browse</p>
      </div>

      <div className="stagger-2 animate-fade-up">
        <div className="flex items-center justify-between mb-4">
          <p className="text-[12px] font-medium text-stone-400 uppercase tracking-widest">All documents</p>
          <Button variant="secondary" size="sm"><Plus size={12} />New document</Button>
        </div>

        <div className="space-y-2">
          {docs.map((d) => (
            <div key={d.title} className="bg-stone-50 border border-stone-200 rounded-lg px-5 py-3.5 flex items-center gap-4 hover:border-stone-300 cursor-pointer transition-all group">
              <FileText size={16} className="text-stone-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-stone-800">{d.title}</p>
                <p className="text-[12px] text-stone-400">Updated {d.updated} · {d.size}</p>
              </div>
              <span className="text-[11px] bg-stone-100 text-stone-500 border border-stone-200 px-2 py-0.5 rounded">{d.category}</span>
              <ChevronRight size={13} className="text-stone-300 group-hover:text-stone-500 transition-colors" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
