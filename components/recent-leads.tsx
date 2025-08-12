"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface Lead {
  id: string
  name: string
  email: string
  type: "demo_booking" | "trial_signup" | "contact_form"
  agency?: string
  timestamp: string
  status: "new" | "contacted" | "scheduled" | "closed"
  priority: "low" | "medium" | "high"
  source: string
}

export default function RecentLeads() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchRecentLeads()
  }, [])

  const fetchRecentLeads = async () => {
    try {
      const response = await fetch("/api/dashboard/leads")
      if (response.ok) {
        const data = await response.json()
        setLeads(data.leads || [])
      } else {
        // Mock data for demonstration
        const mockLeads: Lead[] = [
          {
            id: "1",
            name: "Sarah Johnson",
            email: "sarah@insuranceplus.com",
            type: "demo_booking",
            agency: "Insurance Plus LLC",
            timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
            status: "new",
            priority: "high",
            source: "website_demo_form",
          },
          {
            id: "2",
            name: "Mike Chen",
            email: "mike@chenagency.com",
            type: "trial_signup",
            agency: "Chen Insurance Agency",
            timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
            status: "contacted",
            priority: "high",
            source: "website_trial_form",
          },
          {
            id: "3",
            name: "Lisa Rodriguez",
            email: "lisa@secureinsure.com",
            type: "contact_form",
            agency: "Secure Insurance Co",
            timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
            status: "new",
            priority: "medium",
            source: "website_contact_form",
          },
        ]
        setLeads(mockLeads)
      }
    } catch (error) {
      console.error("Failed to fetch recent leads:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "demo_booking":
        return "text-accent-green bg-accent-green/10"
      case "trial_signup":
        return "text-accent-purple bg-accent-purple/10"
      default:
        return "text-accent-blue bg-accent-blue/10"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "text-yellow-400 bg-yellow-400/10"
      case "contacted":
        return "text-blue-400 bg-blue-400/10"
      case "scheduled":
        return "text-accent-green bg-accent-green/10"
      case "closed":
        return "text-gray-400 bg-gray-400/10"
      default:
        return "text-gray-400 bg-gray-400/10"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-400"
      case "medium":
        return "text-yellow-400"
      default:
        return "text-gray-400"
    }
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60))

    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`
    }
  }

  return (
    <Card className="bg-card-bg border-border-neon">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-accent-blue">Recent Leads</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchRecentLeads}
            className="border-accent-blue text-accent-blue hover:bg-accent-blue hover:text-bg-deep-dark bg-transparent"
          >
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-slate-700 rounded-full animate-pulse"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-700 rounded animate-pulse"></div>
                  <div className="h-3 bg-slate-700 rounded animate-pulse w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : leads.length === 0 ? (
          <div className="text-center py-8 text-text-primary-light/60">
            <p>No recent leads found.</p>
            <p className="text-sm mt-2">Leads will appear here as they come in through your campaign.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {leads.map((lead) => (
              <div
                key={lead.id}
                className="flex items-center space-x-4 p-3 rounded-lg hover:bg-slate-800/30 transition-colors"
              >
                <Avatar>
                  <AvatarFallback className="bg-accent-blue/20 text-accent-blue">
                    {lead.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-text-primary-light truncate">{lead.name}</p>
                    <div className={`w-2 h-2 rounded-full ${getPriorityColor(lead.priority)}`}></div>
                  </div>
                  <p className="text-sm text-text-primary-light/60 truncate">{lead.email}</p>
                  {lead.agency && <p className="text-xs text-text-primary-light/50 truncate">{lead.agency}</p>}
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge className={getTypeColor(lead.type)}>{lead.type.replace("_", " ")}</Badge>
                  <Badge variant="outline" className={getStatusColor(lead.status)}>
                    {lead.status}
                  </Badge>
                  <span className="text-xs text-text-primary-light/50">{formatTimeAgo(lead.timestamp)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
