import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Meridian HR',
  description: 'People operations, simplified.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
