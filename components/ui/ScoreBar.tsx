interface ScoreBarProps {
  label: string
  value: number
  max?: number
}

export default function ScoreBar({ label, value, max = 100 }: ScoreBarProps) {
  const pct = Math.round((value / max) * 100)
  return (
    <div className="mb-3">
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-[12px] text-stone-500">{label}</span>
        <span className="text-[12px] font-medium text-stone-700">{pct}%</span>
      </div>
      <div className="h-[3px] bg-stone-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-stone-700 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
