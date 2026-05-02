interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

export default function Button({ variant = 'secondary', size = 'md', style, children, ...props }: ButtonProps) {
  const base: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    fontFamily: 'inherit', fontWeight: 600, cursor: 'pointer',
    transition: 'all 0.15s', outline: 'none',
    borderRadius: 999,
  }
  const sizes: Record<string, React.CSSProperties> = {
    sm: { fontSize: 12, padding: '7px 14px' },
    md: { fontSize: 13, padding: '10px 20px' },
    lg: { fontSize: 15, padding: '13px 28px' },
  }
  const variants: Record<string, React.CSSProperties> = {
    primary:   { backgroundColor: '#111111', color: '#FFFFFF', border: 'none' },
    secondary: { backgroundColor: '#FFFFFF', color: '#111111', border: '1px solid #E0E0E0' },
    ghost:     { backgroundColor: 'transparent', color: '#888888', border: 'none' },
  }
  return (
    <button style={{ ...base, ...sizes[size], ...variants[variant], ...style }} {...props}>
      {children}
    </button>
  )
}