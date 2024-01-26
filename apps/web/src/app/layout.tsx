
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import NavBar from '@/components/NavBar'
import AuthButton from '@/components/AuthButton'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Scriptsifter',
  description: 'Sift your scripts',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <NavBar />
        {children}
      </body>
    </html>
  )
}
