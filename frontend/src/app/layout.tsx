import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from '@/components/ui/Toaster'
import { AccessibilityWidget } from '@/components/AccessibilityWidget'

export const metadata: Metadata = {
  title: 'JobCor | פלטפורמת גיוס',
  description: 'פלטפורמת גיוס מתקדמת עם סנכרון Gmail אוטומטי',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
        <Toaster />
        <AccessibilityWidget />
      </body>
    </html>
  )
}
