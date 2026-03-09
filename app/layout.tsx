import type { Metadata } from 'next'
import './globals.css' // Wajib di-import biar Tailwind-nya jalan di semua page

export const metadata: Metadata = {
  title: 'Auto7 - SPK Logistik',
  description: 'Sistem Pendukung Keputusan Jasa Logistik On-Demand',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}