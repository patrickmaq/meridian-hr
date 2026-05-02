import clsx from 'clsx'

type Grade = 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | string
type Variant = 'grade' | 'status' | 'neutral'

interface BadgeProps {
  label: string
  variant?: Variant
  grade?: Grade
  className?: string
}

function gradeStyle(g: string) {
  if (g === 'A+' || g === 'A') return 'bg-stone-800 text-stone-100'
  if (g === 'B+' || g === 'B') return 'bg-stone-600 text-stone-100'
  if (g === 'C+' || g === 'C') return 'bg-stone-300 text-stone-700'
  return 'bg-stone-200 text-stone-500'
}

export default function Badge({ label, variant = 'neutral', grade, className }: BadgeProps) {
  return (
    <span className={clsx(
      'inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-medium',
      variant === 'grade' && grade ? gradeStyle(grade) : 'bg-stone-100 text-stone-500 border border-stone-200',
      className
    )}>
      {label}
    </span>
  )
}
