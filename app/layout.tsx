import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Roast My Room 🔥',
  description: 'AI judges your living situation locally',
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
