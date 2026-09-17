import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "PAATA - Music Player",
  description: "Stream unlimited music from Jio Saavn",
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
