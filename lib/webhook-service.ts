interface WebhookPayload {
  type: "demo_booking" | "trial_signup" | "contact_form" | "newsletter_signup"
  data: {
    name?: string
    email: string
    phone?: string
    agency?: string
    message?: string
    timestamp: string
    source: string
    priority: "low" | "medium" | "high"
    status: "new" | "contacted" | "scheduled" | "closed"
    [key: string]: any
  }
}

interface WebhookResponse {
  success: boolean
  service: string
  error?: string
}

import EmailAutomation from "./email-automation"

class WebhookService {
  private static instance: WebhookService
  private webhookUrls: Map<string, string> = new Map()

  private constructor() {
    // Initialize webhook URLs from environment variables
    if (process.env.SLACK_WEBHOOK_URL) {
      this.webhookUrls.set("slack", process.env.SLACK_WEBHOOK_URL)
    }
    if (process.env.GOOGLE_SHEETS_WEBHOOK_URL) {
      this.webhookUrls.set("sheets", process.env.GOOGLE_SHEETS_WEBHOOK_URL)
    }
    if (process.env.EMAIL_WEBHOOK_URL) {
      this.webhookUrls.set("email", process.env.EMAIL_WEBHOOK_URL)
    }
    if (process.env.CALENDLY_WEBHOOK_URL) {
      this.webhookUrls.set("calendly", process.env.CALENDLY_WEBHOOK_URL)
    }
  }

  public static getInstance(): WebhookService {
    if (!WebhookService.instance) {
      WebhookService.instance = new WebhookService()
    }
    return WebhookService.instance
  }

  async sendToSlack(payload: WebhookPayload): Promise<WebhookResponse> {
    const webhookUrl = this.webhookUrls.get("slack")
    if (!webhookUrl) {
      return { success: false, service: "slack", error: "Slack webhook URL not configured" }
    }

    try {
      const slackPayload = this.formatSlackMessage(payload)
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(slackPayload),
      })

      if (!response.ok) {
        throw new Error(`Slack API error: ${response.status}`)
      }

      return { success: true, service: "slack" }
    } catch (error) {
      return {
        success: false,
        service: "slack",
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  async sendToGoogleSheets(payload: WebhookPayload): Promise<WebhookResponse> {
    const webhookUrl = this.webhookUrls.get("sheets")
    if (!webhookUrl) {
      return { success: false, service: "sheets", error: "Google Sheets webhook URL not configured" }
    }

    try {
      const sheetsPayload = this.formatSheetsData(payload)
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sheetsPayload),
      })

      if (!response.ok) {
        throw new Error(`Google Sheets API error: ${response.status}`)
      }

      return { success: true, service: "sheets" }
    } catch (error) {
      return {
        success: false,
        service: "sheets",
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  async sendEmail(payload: WebhookPayload): Promise<WebhookResponse> {
    const webhookUrl = this.webhookUrls.get("email")
    if (!webhookUrl) {
      return { success: false, service: "email", error: "Email webhook URL not configured" }
    }

    try {
      const emailPayload = this.formatEmailData(payload)
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(emailPayload),
      })

      if (!response.ok) {
        throw new Error(`Email API error: ${response.status}`)
      }

      return { success: true, service: "email" }
    } catch (error) {
      return {
        success: false,
        service: "email",
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  async sendToCalendly(payload: WebhookPayload): Promise<WebhookResponse> {
    const webhookUrl = this.webhookUrls.get("calendly")
    if (!webhookUrl) {
      return { success: false, service: "calendly", error: "Calendly webhook URL not configured" }
    }

    try {
      const calendlyPayload = this.formatCalendlyData(payload)
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(calendlyPayload),
      })

      if (!response.ok) {
        throw new Error(`Calendly API error: ${response.status}`)
      }

      return { success: true, service: "calendly" }
    } catch (error) {
      return {
        success: false,
        service: "calendly",
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  async broadcastWebhook(payload: WebhookPayload): Promise<WebhookResponse[]> {
    const promises = [this.sendToSlack(payload), this.sendToGoogleSheets(payload), this.sendEmail(payload)]

    // Only send to Calendly for demo bookings
    if (payload.type === "demo_booking") {
      promises.push(this.sendToCalendly(payload))
    }

    const emailAutomation = EmailAutomation.getInstance()
    try {
      await emailAutomation.triggerSequence(payload.type, {
        email: payload.data.email,
        name: payload.data.name || "",
        agency: payload.data.agency,
        leadId: `${payload.type}_${Date.now()}`,
        customVariables: {
          message: payload.data.message || "",
          phone: payload.data.phone || "",
        },
      })
    } catch (error) {
      console.error("Failed to trigger email automation:", error)
    }

    const results = await Promise.allSettled(promises)
    return results.map((result) =>
      result.status === "fulfilled" ? result.value : { success: false, service: "unknown", error: "Promise rejected" },
    )
  }

  private formatSlackMessage(payload: WebhookPayload) {
    const { type, data } = payload
    const emoji = this.getEmojiForType(type)
    const priority = data.priority === "high" ? "🔥 HIGH PRIORITY" : ""

    return {
      text: `${emoji} New ${type.replace("_", " ")} from ${data.name || data.email}`,
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*${priority} New ${type.replace("_", " ").toUpperCase()}*\n\n${this.formatDataForSlack(data)}`,
          },
        },
        {
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: `Source: ${data.source} | Time: ${new Date(data.timestamp).toLocaleString()}`,
            },
          ],
        },
      ],
    }
  }

  private formatSheetsData(payload: WebhookPayload) {
    return {
      timestamp: payload.data.timestamp,
      type: payload.type,
      name: payload.data.name || "",
      email: payload.data.email,
      phone: payload.data.phone || "",
      agency: payload.data.agency || "",
      message: payload.data.message || "",
      source: payload.data.source,
      priority: payload.data.priority,
      status: payload.data.status,
    }
  }

  private formatEmailData(payload: WebhookPayload) {
    const { type, data } = payload
    const subject = `New ${type.replace("_", " ")} from ${data.name || data.email}${data.agency ? ` - ${data.agency}` : ""}`

    return {
      to: process.env.DEMO_NOTIFICATION_EMAIL || "demo@quotely.com",
      subject,
      html: this.generateEmailHTML(payload),
      priority: data.priority === "high" ? "high" : "normal",
    }
  }

  private formatCalendlyData(payload: WebhookPayload) {
    return {
      invitee_email: payload.data.email,
      invitee_name: payload.data.name,
      event_type: "demo_booking",
      custom_questions: {
        agency: payload.data.agency,
        phone: payload.data.phone,
        message: payload.data.message,
      },
    }
  }

  private getEmojiForType(type: string): string {
    const emojiMap: Record<string, string> = {
      demo_booking: "🎯",
      trial_signup: "🚀",
      contact_form: "📧",
      newsletter_signup: "📰",
    }
    return emojiMap[type] || "📝"
  }

  private formatDataForSlack(data: any): string {
    const fields = []
    if (data.name) fields.push(`*Name:* ${data.name}`)
    if (data.email) fields.push(`*Email:* ${data.email}`)
    if (data.phone) fields.push(`*Phone:* ${data.phone}`)
    if (data.agency) fields.push(`*Agency:* ${data.agency}`)
    if (data.message) fields.push(`*Message:* ${data.message}`)
    return fields.join("\n")
  }

  private generateEmailHTML(payload: WebhookPayload): string {
    const { type, data } = payload
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #00E0FF; border-bottom: 2px solid #00E0FF; padding-bottom: 10px;">
          New ${type.replace("_", " ").toUpperCase()} Request
        </h2>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          ${data.name ? `<p><strong>Name:</strong> ${data.name}</p>` : ""}
          <p><strong>Email:</strong> ${data.email}</p>
          ${data.phone ? `<p><strong>Phone:</strong> ${data.phone}</p>` : ""}
          ${data.agency ? `<p><strong>Agency:</strong> ${data.agency}</p>` : ""}
          ${data.message ? `<p><strong>Message:</strong> ${data.message}</p>` : ""}
          <p><strong>Priority:</strong> ${data.priority.toUpperCase()}</p>
          <p><strong>Source:</strong> ${data.source}</p>
          <p><strong>Submitted:</strong> ${new Date(data.timestamp).toLocaleString()}</p>
        </div>
        <p style="color: #666; font-size: 12px;">
          This is an automated notification from your Quotely webhook integration.
        </p>
      </div>
    `
  }

  getConfiguredServices(): string[] {
    return Array.from(this.webhookUrls.keys())
  }

  isServiceConfigured(service: string): boolean {
    return this.webhookUrls.has(service)
  }
}

export default WebhookService
export type { WebhookPayload, WebhookResponse }
