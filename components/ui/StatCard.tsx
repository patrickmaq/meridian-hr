interface StatCardProps {
  label: string
  value: string | number
  sub?: string
}

export default function StatCard({ label, value, sub }: StatCardProps) {
  return (
    <div style={{
      backgroundColor: '#FFFFFF',
      border: '1px solid #E8E8E8',
      borderRadius: 20,
      padding: '22px 24px',
    }}>
      <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#BBBBBB', marginBottom: 12 }}>{label}</p>
      <p style={{ fontSize: 34, fontWeight: 800, letterSpacing: '-0.04em', color: '#111111', lineHeight: 1 }}>{value}</p>
      {sub && <p style={{ fontSize: 12, color: '#AAAAAA', marginTop: 8 }}>{sub}</p>}
    </div>
  )
}