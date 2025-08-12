"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"

interface EmailStats {
  pending: number
  sent: number
  failed: number
}

interface EmailTemplate {
  id: string
  name: string
  subject: string
  variables: string[]
}

interface EmailSequence {
  id: string
  name: string
  trigger: string
  emailCount: number
}

export default function EmailAutomationPanel() {
  const [stats, setStats] = useState<EmailStats>({ pending: 0, sent: 0, failed: 0 })
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [sequences, setSequences] = useState<EmailSequence[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchEmailAutomationData()
    // Refresh every 30 seconds
    const interval = setInterval(fetchEmailAutomationData, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchEmailAutomationData = async () => {
    try {
      const response = await fetch("/api/email-automation")
      if (response.ok) {
        const data = await response.json()
        setStats(data.jobStats)
        setTemplates(data.templates)
        setSequences(data.sequences)
      }
    } catch (error) {
      console.error("Failed to fetch email automation data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const processPendingEmails = async () => {
    setIsProcessing(true)
    try {
      const response = await fetch("/api/email-automation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "process_pending" }),
      })

      if (response.ok) {
        toast({
          title: "Email Processing Complete",
          description: "All pending emails have been processed.",
        })
        fetchEmailAutomationData()
      } else {
        throw new Error("Processing failed")
      }
    } catch (error) {
      toast({
        title: "Processing Failed",
        description: "Failed to process pending emails.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  if (isLoading) {
    return (
      <Card className="bg-card-bg border-border-neon">
        <CardHeader>
          <div className="h-6 bg-slate-700 rounded animate-pulse w-48"></div>
        </CardHeader>
        <CardContent>
          <div className="h-32 bg-slate-700 rounded animate-pulse"></div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card-bg border-border-neon">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-accent-blue">Email Automation</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={processPendingEmails}
            disabled={isProcessing}
            className="border-accent-blue text-accent-blue hover:bg-accent-blue hover:text-bg-deep-dark bg-transparent"
          >
            {isProcessing ? "Processing..." : "Process Pending"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="stats" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800/50">
            <TabsTrigger
              value="stats"
              className="data-[state=active]:bg-accent-blue data-[state=active]:text-bg-deep-dark"
            >
              Stats
            </TabsTrigger>
            <TabsTrigger
              value="templates"
              className="data-[state=active]:bg-accent-blue data-[state=active]:text-bg-deep-dark"
            >
              Templates
            </TabsTrigger>
            <TabsTrigger
              value="sequences"
              className="data-[state=active]:bg-accent-blue data-[state=active]:text-bg-deep-dark"
            >
              Sequences
            </TabsTrigger>
          </TabsList>

          <TabsContent value="stats" className="mt-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-slate-800/30 rounded-lg">
                <div className="text-2xl font-bold text-yellow-400">{stats.pending}</div>
                <div className="text-sm text-text-primary-light/60">Pending</div>
              </div>
              <div className="text-center p-4 bg-slate-800/30 rounded-lg">
                <div className="text-2xl font-bold text-accent-green">{stats.sent}</div>
                <div className="text-sm text-text-primary-light/60">Sent</div>
              </div>
              <div className="text-center p-4 bg-slate-800/30 rounded-lg">
                <div className="text-2xl font-bold text-red-400">{stats.failed}</div>
                <div className="text-sm text-text-primary-light/60">Failed</div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="templates" className="mt-4">
            <div className="space-y-3">
              {templates.map((template) => (
                <div key={template.id} className="p-3 bg-slate-800/30 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-text-primary-light">{template.name}</h4>
                    <Badge variant="outline" className="text-accent-blue border-accent-blue">
                      {template.variables.length} vars
                    </Badge>
                  </div>
                  <p className="text-sm text-text-primary-light/60 mb-2">{template.subject}</p>
                  <div className="flex flex-wrap gap-1">
                    {template.variables.map((variable) => (
                      <Badge key={variable} variant="secondary" className="text-xs">
                        {variable}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="sequences" className="mt-4">
            <div className="space-y-3">
              {sequences.map((sequence) => (
                <div key={sequence.id} className="p-3 bg-slate-800/30 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-text-primary-light">{sequence.name}</h4>
                    <Badge variant="outline" className="text-accent-green border-accent-green">
                      {sequence.emailCount} emails
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="text-accent-blue bg-accent-blue/10">
                      Trigger: {sequence.trigger.replace("_", " ")}
                    </Badge>
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
