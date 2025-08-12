"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface AnalyticsData {
  sourceBreakdown: { source: string; count: number; percentage: number }[]
  dailyLeads: { date: string; count: number }[]
  conversionFunnel: { stage: string; count: number; rate: number }[]
}

export default function LeadAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    sourceBreakdown: [],
    dailyLeads: [],
    conversionFunnel: [],
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const response = await fetch("/api/dashboard/analytics")
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      } else {
        // Mock data for demonstration
        const mockAnalytics: AnalyticsData = {
          sourceBreakdown: [
            { source: "Website Demo Form", count: 45, percentage: 52.3 },
            { source: "Website Trial Form", count: 28, percentage: 32.6 },
            { source: "Contact Form", count: 13, percentage: 15.1 },
          ],
          dailyLeads: [
            { date: "2025-01-06", count: 8 },
            { date: "2025-01-07", count: 12 },
            { date: "2025-01-08", count: 15 },
            { date: "2025-01-09", count: 11 },
            { date: "2025-01-10", count: 18 },
            { date: "2025-01-11", count: 14 },
            { date: "2025-01-12", count: 22 },
          ],
          conversionFunnel: [
            { stage: "Visitors", count: 1250, rate: 100 },
            { stage: "Form Views", count: 320, rate: 25.6 },
            { stage: "Form Starts", count: 180, rate: 14.4 },
            { stage: "Form Submits", count: 86, rate: 6.9 },
            { stage: "Demos Scheduled", count: 45, rate: 3.6 },
          ],
        }
        setAnalytics(mockAnalytics)
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <Card className="bg-card-bg border-border-neon">
        <CardHeader>
          <div className="h-6 bg-slate-700 rounded animate-pulse w-32"></div>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-slate-700 rounded animate-pulse"></div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card-bg border-border-neon">
      <CardHeader>
        <CardTitle className="text-accent-blue">Lead Analytics</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="sources" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800/50">
            <TabsTrigger
              value="sources"
              className="data-[state=active]:bg-accent-blue data-[state=active]:text-bg-deep-dark"
            >
              Lead Sources
            </TabsTrigger>
            <TabsTrigger
              value="trends"
              className="data-[state=active]:bg-accent-blue data-[state=active]:text-bg-deep-dark"
            >
              Daily Trends
            </TabsTrigger>
            <TabsTrigger
              value="funnel"
              className="data-[state=active]:bg-accent-blue data-[state=active]:text-bg-deep-dark"
            >
              Conversion Funnel
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sources" className="mt-6">
            <div className="space-y-4">
              {analytics.sourceBreakdown.map((source, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-text-primary-light">{source.source}</span>
                      <span className="text-sm text-text-primary-light/60">{source.count} leads</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2">
                      <div
                        className="bg-accent-blue h-2 rounded-full transition-all duration-300"
                        style={{ width: `${source.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="ml-4 text-right">
                    <span className="text-lg font-bold text-accent-blue">{source.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="trends" className="mt-6">
            <div className="space-y-4">
              <div className="grid grid-cols-7 gap-2">
                {analytics.dailyLeads.map((day, index) => (
                  <div key={index} className="text-center">
                    <div className="text-xs text-text-primary-light/60 mb-2">
                      {new Date(day.date).toLocaleDateString("en-US", { weekday: "short" })}
                    </div>
                    <div
                      className="bg-accent-blue/20 rounded-t mx-auto transition-all duration-300 hover:bg-accent-blue/40"
                      style={{
                        height: `${Math.max((day.count / Math.max(...analytics.dailyLeads.map((d) => d.count))) * 100, 10)}px`,
                        width: "20px",
                      }}
                    ></div>
                    <div className="text-sm font-medium text-text-primary-light mt-2">{day.count}</div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="funnel" className="mt-6">
            <div className="space-y-3">
              {analytics.conversionFunnel.map((stage, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-accent-blue/20 flex items-center justify-center text-accent-blue font-bold text-sm">
                      {index + 1}
                    </div>
                    <span className="font-medium text-text-primary-light">{stage.stage}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-accent-blue">{stage.count.toLocaleString()}</div>
                    <div className="text-xs text-text-primary-light/60">{stage.rate}%</div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
