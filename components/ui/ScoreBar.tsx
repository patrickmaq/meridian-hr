interface ScoreBarProps {
  label: string
  value: number
  max?: number
}

export default function ScoreBar({ label, value, max = 100 }: ScoreBarProps) {
  const pct = Math.round((value / max) * 100)
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <span style={{ fontSize: 12, color: '#888888' }}>{label}</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#111111' }}>{pct}%</span>
      </div>
      <div style={{ height: 4, backgroundColor: '#F0F0F0', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{ height: '100%', backgroundColor: '#111111', borderRadius: 99, width: `${pct}%`, transition: 'width 0.5s' }} />
      </div>
    </div>
  )
}