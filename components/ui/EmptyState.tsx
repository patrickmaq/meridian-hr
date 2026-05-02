interface EmptyStateProps {
  title: string
  subtitle: string
  action?: React.ReactNode
  illustration?: 'clipboard' | 'people' | 'search' | 'docs'
}

export default function EmptyState({ title, subtitle, action, illustration = 'clipboard' }: EmptyStateProps) {
  const images: Record<string, string> = {
    clipboard: '/illustration-applicants.png',
    people:    '/illustration-jobs.png',
    docs:      '/illustration-docs.png',
    search:    '/illustration-applicants.png',
  }

  return (
    <div style={{
      border: '2px dashed #E0E0E0',
      borderRadius: 24,
      padding: '64px 40px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      backgroundColor: '#FAFAFA',
    }}>
      <div style={{ marginBottom: 28 }}>
        <img
          src={images[illustration]}
          alt=""
          style={{ width: 140, height: 140, objectFit: 'contain' }}
        />
      </div>
      <p style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em', color: '#111111', marginBottom: 8 }}>{title}</p>
      <p style={{ fontSize: 13, color: '#AAAAAA', maxWidth: 300, lineHeight: 1.7, marginBottom: action ? 28 : 0 }}>{subtitle}</p>
      {action}
    </div>
  )
}