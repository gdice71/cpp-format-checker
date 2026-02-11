import type { Metadata } from 'next'
import './globals.css'
import { Analytics } from "@vercel/analytics/next"
import Script from 'next/script'   // ← Built-in Next.js component

export const metadata: Metadata = {
  title: 'C++ Format Checker | ME 101',
  description: 'Modern C++ code style validator for ME 101 formatting guidelines',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />

        {/* Google Analytics (gtag.js) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-3B42FTFFF2"
          strategy="afterInteractive"   // loads after page becomes interactive
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-3B42FTFFF2');
          `}
        </Script>
      </body>
    </html>
  )
}