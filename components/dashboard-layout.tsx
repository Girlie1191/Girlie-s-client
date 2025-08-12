import type React from "react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { Card } from "@/components/ui/card"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-bg-deep-dark">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8">
        <Card className="bg-card-bg border-border-neon backdrop-blur-sm">
          <div className="p-8">{children}</div>
        </Card>
      </main>

      <Footer />
    </div>
  )
}
