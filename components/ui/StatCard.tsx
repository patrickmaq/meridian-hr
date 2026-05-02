import clsx from 'clsx'

interface StatCardProps {
  label: string
  value: string | number
  sub?: string
  className?: string
}

export default function StatCard({ label, value, sub, className }: StatCardProps) {
  return (
    <div className={clsx(
      'bg-stone-50 border border-stone-200 rounded-lg px-5 py-4',
      className
    )}>
      <p className="text-[11px] text-stone-400 font-medium uppercase tracking-widest mb-1.5">{label}</p>
      <p className="text-[28px] font-medium tracking-tighter text-stone-900 leading-none">{value}</p>
      {sub && <p className="text-[12px] text-stone-400 mt-1.5">{sub}</p>}
    </div>
  )
}
