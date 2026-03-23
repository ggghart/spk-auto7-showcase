import type { Metadata } from 'next'
import './globals.css' // Wajib di-import biar Tailwind-nya jalan di semua page

export const metadata: Metadata = {
  title: 'Auto7 - SPK Logistik',
  description: 'Portal Sistem Pendukung Keputusan (SPK) internal Auto7 Carwash untuk optimasi pemilihan jasa logistik on-demand. Tingkatkan efisiensi rantai pasok dengan algoritma cerdas AHP dan TOPSIS.',
  icons: {
    icon: '/auto7.png', 
    shortcut: '/auto7.png',
    apple: '/auto7.png',
  },
  openGraph: {
    title: 'Auto7 - SPK Logistik',
    description: 'Portal Sistem Pendukung Keputusan (SPK) internal Auto7 Carwash untuk optimasi pemilihan jasa logistik on-demand. Tingkatkan efisiensi rantai pasok dengan algoritma cerdas AHP dan TOPSIS.',
    url: 'https://spk-auto7-carwash.vercel.app/', // Nanti ganti sama domain asli lu kalau udah di-hosting
    siteName: 'Auto7 Carwash',
    images: [
      {
        url: '/og-image.png', // Pastiin nama file gambar lu bener dan ada di folder public/
        width: 1200,
        height: 630,
        alt: 'Preview Portal SPK Auto7',
      },
    ],
    locale: 'id_ID',
    type: 'website',
  },
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