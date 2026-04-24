import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import { Toaster } from '@/components/ui/Toaster';

export const metadata: Metadata = {
  title: 'פלטפורמת גיוס | Recruitment Platform',
  description: 'Advanced job aggregation and candidate scoring platform',
  viewport: 'width=device-width, initial-scale=1, viewport-fit=cover',
  themeColor: '#2563eb',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <body>
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Toaster />
      </body>
    </html>
  );
}
