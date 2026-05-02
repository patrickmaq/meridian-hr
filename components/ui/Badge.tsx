interface BadgeProps {
  label: string
  variant?: 'grade' | 'neutral'
  grade?: string
}

function gradeStyle(g: string): React.CSSProperties {
  if (g === 'A+' || g === 'A') return { backgroundColor: '#111111', color: '#FFFFFF' }
  if (g === 'B+' || g === 'B') return { backgroundColor: '#444444', color: '#FFFFFF' }
  if (g === 'C+' || g === 'C') return { backgroundColor: '#EEEEEE', color: '#555555' }
  return { backgroundColor: '#F5F5F5', color: '#999999' }
}

export default function Badge({ label, variant = 'neutral', grade }: BadgeProps) {
  const style: React.CSSProperties = variant === 'grade' && grade
    ? { ...gradeStyle(grade), fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 999, display: 'inline-flex', alignItems: 'center' }
    : { backgroundColor: '#F5F5F5', color: '#888888', border: '1px solid #E8E8E8', fontSize: 11, fontWeight: 600, padding: '4px 12px', borderRadius: 999, display: 'inline-flex', alignItems: 'center' }
  return <span style={style}>{label}</span>
}