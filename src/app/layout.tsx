/**
 * @file layout.tsx
 * @description Next.js root layout component.
 * Configures global typography fonts, page metadata headers (SEO title/description),
 * and mounts core wrapper providers (ErrorBoundary, ToastProvider, AuthProvider, MainLayout).
 */

import type { Metadata } from "next"
import { Geist, Geist_Mono, Plus_Jakarta_Sans, Inter } from "next/font/google"
import "./globals.css"
import { MainLayout } from "@/components/layout/MainLayout"
import { ErrorBoundary } from "@/components/ErrorBoundary"
import { ToastProvider } from "@/components/providers/ToastProvider"
import { AuthProvider } from "@/lib/hooks/AuthProvider"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
})

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
})

// Global SEO and app identity metadata tags configuration
export const metadata: Metadata = {
  title: "Calmora - Find Your Calm. Find Your Power.",
  description: "AI-powered mental wellness & personal growth platform to improve mental health, build positive habits, and maintain discipline.",
  keywords: ["mental health", "wellness", "meditation", "habits", "mindfulness"],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${plusJakartaSans.variable} ${inter.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-[#10141a] text-[#dfe2eb] antialiased">
        <ErrorBoundary>
          <ToastProvider>
            <AuthProvider>
              <MainLayout>{children}</MainLayout>
            </AuthProvider>
          </ToastProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}

