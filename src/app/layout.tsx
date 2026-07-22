import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { MainLayout } from "@/components/layout/MainLayout"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Calmora - Find Your Calm. Find Your Power.",
  description: "AI-powered mental wellness & personal growth platform to improve mental health, build positive habits, and maintain discipline.",
  keywords: ["mental health", "wellness", "meditation", "habits", "mindfulness"],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-[#0a0f1e] antialiased">
        <MainLayout>{children}</MainLayout>
      </body>
    </html>
  )
}
