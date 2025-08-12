"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface LeadStats {
  total: number
  today: number
  thisWeek: number
  demoBookings: number
  trialSignups: number
  contactForms: number
  conversionRate: number
}

export default function LeadOverview() {
  const [stats, setStats] = useState<LeadStats>({
    total: 0,
    today: 0,
    thisWeek: 0,
    demoBookings: 0,
    trialSignups: 0,
    contactForms: 0,
    conversionRate: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchLeadStats()
  }, [])

  const fetchLeadStats = async () => {
    try {
      const response = await fetch("/api/dashboard/stats")
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error("Failed to fetch lead stats:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const statCards = [
    {
      title: "Total Leads",
      value: stats.total,
      change: `+${stats.today} today`,
      color: "text-accent-blue",
      bgColor: "bg-accent-blue/10",
    },
    {
      title: "Demo Bookings",
      value: stats.demoBookings,
      change: "High Priority",
      color: "text-accent-green",
      bgColor: "bg-accent-green/10",
    },
    {
      title: "Trial Signups",
      value: stats.trialSignups,
      change: "Ready to Convert",
      color: "text-accent-purple",
      bgColor: "bg-accent-purple/10",
    },
    {
      title: "Conversion Rate",
      value: `${stats.conversionRate}%`,
      change: `${stats.thisWeek} this week`,
      color: "text-accent-blue",
      bgColor: "bg-accent-blue/10",
    },
  ]

  if (isLoading) {
    return (
      <>
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="bg-card-bg border-border-neon">
            <CardHeader className="pb-2">
              <div className="h-4 bg-slate-700 rounded animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-slate-700 rounded animate-pulse mb-2"></div>
              <div className="h-3 bg-slate-700 rounded animate-pulse w-2/3"></div>
            </CardContent>
          </Card>
        ))}
      </>
    )
  }

  return (
    <>
      {statCards.map((card, index) => (
        <Card key={index} className="bg-card-bg border-border-neon hover:border-accent-blue/50 transition-colors">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-text-primary-light/80">{card.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${card.color} mb-1`}>{card.value}</div>
            <Badge variant="secondary" className={`${card.bgColor} ${card.color} border-0`}>
              {card.change}
            </Badge>
          </CardContent>
        </Card>
      ))}
    </>
  )
}
