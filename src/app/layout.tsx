import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Anonasong - Anonymous Music Gardens',
  description: 'Leave songs as digital flowers in personal gardens. A poetic space for musical expression without social complexity.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className} style={{ overflow: 'hidden', height: '100vh' }}>
        <Header />
        <div style={{ paddingTop: '4rem', height: 'calc(100vh - 4rem)', overflow: 'auto' }}>
          {children}
        </div>
      </body>
    </html>
  )
}