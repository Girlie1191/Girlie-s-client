"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

interface WebhookService {
  name: string
  status: "connected" | "disconnected" | "error"
  lastActivity: string
  successRate: number
}

export default function WebhookStatus() {
  const [services, setServices] = useState<WebhookService[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isTesting, setIsTesting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchWebhookStatus()
    // Refresh every 30 seconds
    const interval = setInterval(fetchWebhookStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchWebhookStatus = async () => {
    try {
      const response = await fetch("/api/webhook")
      if (response.ok) {
        const data = await response.json()
        const mockServices: WebhookService[] = [
          {
            name: "Slack",
            status: data.service_status.slack ? "connected" : "disconnected",
            lastActivity: "2 minutes ago",
            successRate: 98.5,
          },
          {
            name: "Google Sheets",
            status: data.service_status.sheets ? "connected" : "disconnected",
            lastActivity: "5 minutes ago",
            successRate: 95.2,
          },
          {
            name: "Email",
            status: data.service_status.email ? "connected" : "disconnected",
            lastActivity: "1 minute ago",
            successRate: 99.1,
          },
          {
            name: "Calendly",
            status: data.service_status.calendly ? "connected" : "disconnected",
            lastActivity: "10 minutes ago",
            successRate: 92.8,
          },
        ]
        setServices(mockServices)
      }
    } catch (error) {
      console.error("Failed to fetch webhook status:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const testWebhooks = async () => {
    setIsTesting(true)
    try {
      const response = await fetch("/api/webhook-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          test: true,
          timestamp: new Date().toISOString(),
        }),
      })

      if (response.ok) {
        toast({
          title: "Webhook Test Successful",
          description: "All configured webhooks are responding correctly.",
        })
      } else {
        throw new Error("Test failed")
      }
    } catch (error) {
      toast({
        title: "Webhook Test Failed",
        description: "Some webhooks may not be configured correctly.",
        variant: "destructive",
      })
    } finally {
      setIsTesting(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "connected":
        return "text-accent-green bg-accent-green/10"
      case "error":
        return "text-red-400 bg-red-400/10"
      default:
        return "text-yellow-400 bg-yellow-400/10"
    }
  }

  return (
    <Card className="bg-card-bg border-border-neon">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-accent-blue">Webhook Status</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={testWebhooks}
            disabled={isTesting}
            className="border-accent-blue text-accent-blue hover:bg-accent-blue hover:text-bg-deep-dark bg-transparent"
          >
            {isTesting ? "Testing..." : "Test All"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="h-4 bg-slate-700 rounded animate-pulse w-20"></div>
                <div className="h-6 bg-slate-700 rounded animate-pulse w-16"></div>
              </div>
            ))}
          </div>
        ) : (
          services.map((service, index) => (
            <div key={index} className="flex items-center justify-between">
              <div>
                <div className="font-medium text-text-primary-light">{service.name}</div>
                <div className="text-xs text-text-primary-light/60">
                  {service.successRate}% success • {service.lastActivity}
                </div>
              </div>
              <Badge className={getStatusColor(service.status)}>
                {service.status === "connected" ? "Connected" : "Offline"}
              </Badge>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
