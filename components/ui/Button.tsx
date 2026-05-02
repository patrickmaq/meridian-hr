import clsx from 'clsx'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md'
  children: React.ReactNode
}

export default function Button({ variant = 'secondary', size = 'md', className, children, ...props }: ButtonProps) {
  return (
    <button
      className={clsx(
        'inline-flex items-center gap-1.5 font-medium rounded transition-all duration-150 cursor-pointer',
        size === 'sm' && 'text-[12px] px-3 py-1.5',
        size === 'md' && 'text-[13px] px-4 py-2',
        variant === 'primary' && 'bg-stone-900 text-stone-50 hover:bg-stone-700',
        variant === 'secondary' && 'bg-stone-50 border border-stone-200 text-stone-700 hover:bg-stone-100 hover:border-stone-300',
        variant === 'ghost' && 'text-stone-500 hover:text-stone-800 hover:bg-stone-100',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
