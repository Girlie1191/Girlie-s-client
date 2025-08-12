interface EmailTemplate {
  id: string
  name: string
  subject: string
  htmlContent: string
  textContent: string
  variables: string[]
}

interface EmailSequence {
  id: string
  name: string
  trigger: "demo_booking" | "trial_signup" | "contact_form" | "newsletter_signup"
  emails: {
    delay: number // hours
    templateId: string
    condition?: string
  }[]
}

interface EmailJob {
  id: string
  recipientEmail: string
  recipientName: string
  templateId: string
  scheduledFor: Date
  status: "pending" | "sent" | "failed"
  variables: Record<string, string>
  sequenceId?: string
  leadId?: string
}

class EmailAutomation {
  private static instance: EmailAutomation
  private templates: Map<string, EmailTemplate> = new Map()
  private sequences: Map<string, EmailSequence> = new Map()
  private jobs: EmailJob[] = []

  private constructor() {
    this.initializeTemplates()
    this.initializeSequences()
  }

  public static getInstance(): EmailAutomation {
    if (!EmailAutomation.instance) {
      EmailAutomation.instance = new EmailAutomation()
    }
    return EmailAutomation.instance
  }

  private initializeTemplates() {
    const templates: EmailTemplate[] = [
      {
        id: "welcome_demo",
        name: "Demo Booking Confirmation",
        subject: "Your Quotely Demo is Confirmed - Let's Transform Your Agency!",
        htmlContent: this.generateWelcomeDemoHTML(),
        textContent: this.generateWelcomeDemoText(),
        variables: ["name", "agency", "demo_link", "calendar_link"],
      },
      {
        id: "demo_followup_1",
        name: "Demo Follow-up Day 1",
        subject: "Ready to see Quotely in action, {{name}}?",
        htmlContent: this.generateDemoFollowup1HTML(),
        textContent: this.generateDemoFollowup1Text(),
        variables: ["name", "agency", "demo_link"],
      },
      {
        id: "trial_welcome",
        name: "Trial Welcome Email",
        subject: "Welcome to Quotely - Your Free Trial Starts Now!",
        htmlContent: this.generateTrialWelcomeHTML(),
        textContent: this.generateTrialWelcomeText(),
        variables: ["name", "agency", "login_link", "setup_guide"],
      },
      {
        id: "trial_onboarding_1",
        name: "Trial Onboarding Day 3",
        subject: "Getting the most out of your Quotely trial",
        htmlContent: this.generateTrialOnboarding1HTML(),
        textContent: this.generateTrialOnboarding1Text(),
        variables: ["name", "agency", "tutorial_link", "support_link"],
      },
      {
        id: "trial_reminder",
        name: "Trial Ending Reminder",
        subject: "Your Quotely trial ends in 3 days - Don't lose your progress!",
        htmlContent: this.generateTrialReminderHTML(),
        textContent: this.generateTrialReminderText(),
        variables: ["name", "agency", "upgrade_link", "trial_end_date"],
      },
      {
        id: "contact_response",
        name: "Contact Form Auto-Response",
        subject: "We received your message - Here's what happens next",
        htmlContent: this.generateContactResponseHTML(),
        textContent: this.generateContactResponseText(),
        variables: ["name", "message", "response_time"],
      },
    ]

    templates.forEach((template) => {
      this.templates.set(template.id, template)
    })
  }

  private initializeSequences() {
    const sequences: EmailSequence[] = [
      {
        id: "demo_sequence",
        name: "Demo Booking Sequence",
        trigger: "demo_booking",
        emails: [
          { delay: 0, templateId: "welcome_demo" }, // Immediate
          { delay: 24, templateId: "demo_followup_1" }, // 1 day later
        ],
      },
      {
        id: "trial_sequence",
        name: "Trial Onboarding Sequence",
        trigger: "trial_signup",
        emails: [
          { delay: 0, templateId: "trial_welcome" }, // Immediate
          { delay: 72, templateId: "trial_onboarding_1" }, // 3 days later
          { delay: 168, templateId: "trial_reminder" }, // 7 days later (assuming 10-day trial)
        ],
      },
      {
        id: "contact_sequence",
        name: "Contact Form Response",
        trigger: "contact_form",
        emails: [{ delay: 0, templateId: "contact_response" }], // Immediate
      },
    ]

    sequences.forEach((sequence) => {
      this.sequences.set(sequence.id, sequence)
    })
  }

  async triggerSequence(
    trigger: EmailSequence["trigger"],
    recipientData: {
      email: string
      name: string
      agency?: string
      leadId?: string
      customVariables?: Record<string, string>
    },
  ): Promise<void> {
    const sequence = Array.from(this.sequences.values()).find((seq) => seq.trigger === trigger)
    if (!sequence) {
      console.warn(`No sequence found for trigger: ${trigger}`)
      return
    }

    const baseVariables = {
      name: recipientData.name,
      agency: recipientData.agency || "",
      demo_link: "https://calendly.com/quotely-demo",
      calendar_link: "https://calendly.com/quotely-demo",
      login_link: "https://app.quotely.com/login",
      setup_guide: "https://docs.quotely.com/getting-started",
      tutorial_link: "https://docs.quotely.com/tutorials",
      support_link: "https://quotely.com/support",
      upgrade_link: "https://app.quotely.com/upgrade",
      trial_end_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      response_time: "24 hours",
      ...recipientData.customVariables,
    }

    for (const emailConfig of sequence.emails) {
      const scheduledFor = new Date(Date.now() + emailConfig.delay * 60 * 60 * 1000)

      const job: EmailJob = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        recipientEmail: recipientData.email,
        recipientName: recipientData.name,
        templateId: emailConfig.templateId,
        scheduledFor,
        status: "pending",
        variables: baseVariables,
        sequenceId: sequence.id,
        leadId: recipientData.leadId,
      }

      this.jobs.push(job)

      // If delay is 0, send immediately
      if (emailConfig.delay === 0) {
        await this.sendEmail(job)
      }
    }

    console.log(`Email sequence '${sequence.name}' triggered for ${recipientData.email}`)
  }

  async sendEmail(job: EmailJob): Promise<boolean> {
    const template = this.templates.get(job.templateId)
    if (!template) {
      console.error(`Template not found: ${job.templateId}`)
      job.status = "failed"
      return false
    }

    try {
      const htmlContent = this.replaceVariables(template.htmlContent, job.variables)
      const textContent = this.replaceVariables(template.textContent, job.variables)
      const subject = this.replaceVariables(template.subject, job.variables)

      const emailPayload = {
        to: job.recipientEmail,
        subject,
        html: htmlContent,
        text: textContent,
        from: process.env.FROM_EMAIL || "demo@quotely.com",
        replyTo: process.env.REPLY_TO_EMAIL || "demo@quotely.com",
      }

      // Send via webhook (integrates with existing webhook system)
      const webhookUrl = process.env.EMAIL_WEBHOOK_URL
      if (webhookUrl) {
        const response = await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(emailPayload),
        })

        if (response.ok) {
          job.status = "sent"
          console.log(`Email sent successfully to ${job.recipientEmail}: ${subject}`)
          return true
        } else {
          throw new Error(`Email service responded with status: ${response.status}`)
        }
      } else {
        console.warn("EMAIL_WEBHOOK_URL not configured, email not sent")
        job.status = "failed"
        return false
      }
    } catch (error) {
      console.error(`Failed to send email to ${job.recipientEmail}:`, error)
      job.status = "failed"
      return false
    }
  }

  async processPendingJobs(): Promise<void> {
    const now = new Date()
    const pendingJobs = this.jobs.filter((job) => job.status === "pending" && job.scheduledFor <= now)

    for (const job of pendingJobs) {
      await this.sendEmail(job)
    }
  }

  private replaceVariables(content: string, variables: Record<string, string>): string {
    let result = content
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, "g")
      result = result.replace(regex, value)
    })
    return result
  }

  // Template generators
  private generateWelcomeDemoHTML(): string {
    return `
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0F172A; color: #E2E8F0;">
        <div style="background: linear-gradient(135deg, #A020F0 0%, #0F172A 100%); padding: 40px 20px; text-align: center;">
          <h1 style="color: #00E0FF; font-size: 2.5rem; margin: 0; text-shadow: 0 0 20px #00E0FF;">Quotely</h1>
          <h2 style="color: white; font-size: 1.8rem; margin: 20px 0 0 0;">Your Demo is Confirmed!</h2>
        </div>
        
        <div style="padding: 40px 20px;">
          <p style="font-size: 1.1rem; line-height: 1.6; margin-bottom: 20px;">Hi {{name}},</p>
          
          <p style="font-size: 1.1rem; line-height: 1.6; margin-bottom: 20px;">
            Thank you for scheduling a demo of Quotely! We're excited to show you how our modern insurance platform can transform {{agency}}'s workflow.
          </p>
          
          <div style="background: rgba(0, 224, 255, 0.1); border: 1px solid #00E0FF; border-radius: 15px; padding: 25px; margin: 30px 0;">
            <h3 style="color: #00E0FF; margin: 0 0 15px 0;">What to Expect:</h3>
            <ul style="margin: 0; padding-left: 20px; line-height: 1.8;">
              <li>30-60 second quote generation (vs 3-5 minutes with EZLynx)</li>
              <li>Modern interface that works on any device</li>
              <li>Seamless integrations with TurboRater, Momentom AMP, and Gail</li>
              <li>Transparent pricing with no hidden fees</li>
              <li>Full REST API access included</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 40px 0;">
            <a href="{{demo_link}}" style="background: #00E0FF; color: #0F172A; padding: 15px 30px; text-decoration: none; border-radius: 10px; font-weight: bold; display: inline-block; box-shadow: 0 0 20px rgba(0, 224, 255, 0.5);">
              Join Your Demo
            </a>
          </div>
          
          <p style="font-size: 1rem; line-height: 1.6; margin-bottom: 20px;">
            Need to reschedule? <a href="{{calendar_link}}" style="color: #00E0FF;">Click here</a> to choose a different time.
          </p>
          
          <p style="font-size: 1rem; line-height: 1.6;">
            Best regards,<br>
            The Quotely Team
          </p>
        </div>
        
        <div style="background: rgba(15, 23, 42, 0.9); padding: 20px; text-align: center; font-size: 0.9rem; color: #94A3B8;">
          <p>© 2025 Quotely Inc. Built by independent agents, for independent agents.</p>
        </div>
      </div>
    `
  }

  private generateWelcomeDemoText(): string {
    return `
Hi {{name}},

Thank you for scheduling a demo of Quotely! We're excited to show you how our modern insurance platform can transform {{agency}}'s workflow.

What to Expect:
- 30-60 second quote generation (vs 3-5 minutes with EZLynx)
- Modern interface that works on any device
- Seamless integrations with TurboRater, Momentom AMP, and Gail
- Transparent pricing with no hidden fees
- Full REST API access included

Join your demo: {{demo_link}}

Need to reschedule? Visit: {{calendar_link}}

Best regards,
The Quotely Team

© 2025 Quotely Inc. Built by independent agents, for independent agents.
    `
  }

  private generateDemoFollowup1HTML(): string {
    return `
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0F172A; color: #E2E8F0;">
        <div style="background: linear-gradient(135deg, #A020F0 0%, #0F172A 100%); padding: 30px 20px; text-align: center;">
          <h1 style="color: #00E0FF; font-size: 2rem; margin: 0;">Ready for Your Demo?</h1>
        </div>
        
        <div style="padding: 30px 20px;">
          <p style="font-size: 1.1rem; line-height: 1.6; margin-bottom: 20px;">Hi {{name}},</p>
          
          <p style="font-size: 1.1rem; line-height: 1.6; margin-bottom: 20px;">
            Your Quotely demo is coming up! We wanted to make sure you're all set and answer any questions you might have.
          </p>
          
          <div style="background: rgba(0, 224, 255, 0.1); border-left: 4px solid #00E0FF; padding: 20px; margin: 25px 0;">
            <p style="margin: 0; font-style: italic;">
              "Quotely has revolutionized our quoting process! It's incredibly fast and intuitive. Our clients love the speed." - Jane D., Independent Agent
            </p>
          </div>
          
          <p style="font-size: 1.1rem; line-height: 1.6; margin-bottom: 20px;">
            During our demo, we'll show you exactly how {{agency}} can:
          </p>
          
          <ul style="margin: 0 0 25px 20px; line-height: 1.8;">
            <li>Cut quote time from 5 minutes to under 60 seconds</li>
            <li>Eliminate the need to switch between multiple systems</li>
            <li>Quote on mobile devices with full functionality</li>
            <li>Access transparent pricing with no surprise fees</li>
          </ul>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{demo_link}}" style="background: #00E0FF; color: #0F172A; padding: 15px 30px; text-decoration: none; border-radius: 10px; font-weight: bold; display: inline-block;">
              Join Demo Now
            </a>
          </div>
          
          <p style="font-size: 1rem; line-height: 1.6;">
            See you soon!<br>
            The Quotely Team
          </p>
        </div>
      </div>
    `
  }

  private generateDemoFollowup1Text(): string {
    return `
Hi {{name}},

Your Quotely demo is coming up! We wanted to make sure you're all set and answer any questions you might have.

During our demo, we'll show you exactly how {{agency}} can:
- Cut quote time from 5 minutes to under 60 seconds
- Eliminate the need to switch between multiple systems
- Quote on mobile devices with full functionality
- Access transparent pricing with no surprise fees

Join your demo: {{demo_link}}

See you soon!
The Quotely Team
    `
  }

  private generateTrialWelcomeHTML(): string {
    return `
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0F172A; color: #E2E8F0;">
        <div style="background: linear-gradient(135deg, #A020F0 0%, #0F172A 100%); padding: 40px 20px; text-align: center;">
          <h1 style="color: #00E0FF; font-size: 2.5rem; margin: 0;">Welcome to Quotely!</h1>
          <h2 style="color: white; font-size: 1.5rem; margin: 15px 0 0 0;">Your Free Trial Starts Now</h2>
        </div>
        
        <div style="padding: 40px 20px;">
          <p style="font-size: 1.1rem; line-height: 1.6; margin-bottom: 20px;">Hi {{name}},</p>
          
          <p style="font-size: 1.1rem; line-height: 1.6; margin-bottom: 25px;">
            Welcome to Quotely! Your free trial is now active and {{agency}} is ready to experience the future of insurance quoting.
          </p>
          
          <div style="background: rgba(0, 255, 128, 0.1); border: 1px solid #00FF80; border-radius: 15px; padding: 25px; margin: 30px 0;">
            <h3 style="color: #00FF80; margin: 0 0 15px 0;">🚀 Quick Start Guide:</h3>
            <ol style="margin: 0; padding-left: 20px; line-height: 1.8;">
              <li>Log in to your account</li>
              <li>Complete your agency profile</li>
              <li>Connect your preferred integrations</li>
              <li>Generate your first quote in under 60 seconds!</li>
            </ol>
          </div>
          
          <div style="text-align: center; margin: 40px 0;">
            <a href="{{login_link}}" style="background: #00E0FF; color: #0F172A; padding: 15px 30px; text-decoration: none; border-radius: 10px; font-weight: bold; display: inline-block; margin-right: 15px;">
              Access Your Account
            </a>
            <a href="{{setup_guide}}" style="background: transparent; color: #00E0FF; border: 2px solid #00E0FF; padding: 13px 28px; text-decoration: none; border-radius: 10px; font-weight: bold; display: inline-block;">
              Setup Guide
            </a>
          </div>
          
          <p style="font-size: 1rem; line-height: 1.6; margin-bottom: 20px;">
            Questions? Our support team is here to help you get the most out of your trial.
          </p>
          
          <p style="font-size: 1rem; line-height: 1.6;">
            Happy quoting!<br>
            The Quotely Team
          </p>
        </div>
      </div>
    `
  }

  private generateTrialWelcomeText(): string {
    return `
Hi {{name}},

Welcome to Quotely! Your free trial is now active and {{agency}} is ready to experience the future of insurance quoting.

Quick Start Guide:
1. Log in to your account
2. Complete your agency profile
3. Connect your preferred integrations
4. Generate your first quote in under 60 seconds!

Access your account: {{login_link}}
Setup guide: {{setup_guide}}

Questions? Our support team is here to help you get the most out of your trial.

Happy quoting!
The Quotely Team
    `
  }

  private generateTrialOnboarding1HTML(): string {
    return `
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0F172A; color: #E2E8F0;">
        <div style="padding: 30px 20px;">
          <h2 style="color: #00E0FF; font-size: 1.8rem; margin-bottom: 20px;">Getting the Most Out of Your Trial</h2>
          
          <p style="font-size: 1.1rem; line-height: 1.6; margin-bottom: 20px;">Hi {{name}},</p>
          
          <p style="font-size: 1.1rem; line-height: 1.6; margin-bottom: 25px;">
            How's your Quotely trial going? We wanted to share some tips to help {{agency}} maximize your experience.
          </p>
          
          <div style="background: rgba(0, 224, 255, 0.1); border-radius: 15px; padding: 25px; margin: 30px 0;">
            <h3 style="color: #00E0FF; margin: 0 0 15px 0;">💡 Pro Tips:</h3>
            <ul style="margin: 0; padding-left: 20px; line-height: 1.8;">
              <li>Try the mobile interface - quote from anywhere!</li>
              <li>Set up your integrations for seamless workflow</li>
              <li>Use the API to connect with your existing tools</li>
              <li>Test different quote scenarios to see the speed difference</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{tutorial_link}}" style="background: #00E0FF; color: #0F172A; padding: 15px 30px; text-decoration: none; border-radius: 10px; font-weight: bold; display: inline-block; margin-right: 15px;">
              Watch Tutorials
            </a>
            <a href="{{support_link}}" style="background: transparent; color: #00E0FF; border: 2px solid #00E0FF; padding: 13px 28px; text-decoration: none; border-radius: 10px; font-weight: bold; display: inline-block;">
              Get Support
            </a>
          </div>
          
          <p style="font-size: 1rem; line-height: 1.6;">
            Questions? We're here to help!<br>
            The Quotely Team
          </p>
        </div>
      </div>
    `
  }

  private generateTrialOnboarding1Text(): string {
    return `
Hi {{name}},

How's your Quotely trial going? We wanted to share some tips to help {{agency}} maximize your experience.

Pro Tips:
- Try the mobile interface - quote from anywhere!
- Set up your integrations for seamless workflow
- Use the API to connect with your existing tools
- Test different quote scenarios to see the speed difference

Watch tutorials: {{tutorial_link}}
Get support: {{support_link}}

Questions? We're here to help!
The Quotely Team
    `
  }

  private generateTrialReminderHTML(): string {
    return `
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0F172A; color: #E2E8F0;">
        <div style="background: linear-gradient(135deg, #FF6B6B 0%, #0F172A 100%); padding: 30px 20px; text-align: center;">
          <h1 style="color: white; font-size: 1.8rem; margin: 0;">Don't Lose Your Progress!</h1>
          <p style="color: #FFD166; font-size: 1.1rem; margin: 10px 0 0 0;">Trial ends {{trial_end_date}}</p>
        </div>
        
        <div style="padding: 30px 20px;">
          <p style="font-size: 1.1rem; line-height: 1.6; margin-bottom: 20px;">Hi {{name}},</p>
          
          <p style="font-size: 1.1rem; line-height: 1.6; margin-bottom: 25px;">
            Your Quotely trial ends in just 3 days! Don't let {{agency}} go back to slow, outdated quoting systems.
          </p>
          
          <div style="background: rgba(255, 107, 107, 0.1); border: 1px solid #FF6B6B; border-radius: 15px; padding: 25px; margin: 30px 0;">
            <h3 style="color: #FF6B6B; margin: 0 0 15px 0;">⚡ What You'll Miss:</h3>
            <ul style="margin: 0; padding-left: 20px; line-height: 1.8;">
              <li>Lightning-fast 30-60 second quotes</li>
              <li>Modern, mobile-ready interface</li>
              <li>Seamless integrations with all your tools</li>
              <li>Transparent pricing with no hidden fees</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 40px 0;">
            <a href="{{upgrade_link}}" style="background: #00FF80; color: #0F172A; padding: 18px 35px; text-decoration: none; border-radius: 10px; font-weight: bold; display: inline-block; font-size: 1.1rem;">
              Continue with Quotely
            </a>
          </div>
          
          <p style="font-size: 1rem; line-height: 1.6;">
            Questions about upgrading? Reply to this email and we'll help you choose the perfect plan.
          </p>
          
          <p style="font-size: 1rem; line-height: 1.6;">
            Don't go back to the old way,<br>
            The Quotely Team
          </p>
        </div>
      </div>
    `
  }

  private generateTrialReminderText(): string {
    return `
Hi {{name}},

Your Quotely trial ends in just 3 days! Don't let {{agency}} go back to slow, outdated quoting systems.

What You'll Miss:
- Lightning-fast 30-60 second quotes
- Modern, mobile-ready interface
- Seamless integrations with all your tools
- Transparent pricing with no hidden fees

Continue with Quotely: {{upgrade_link}}

Questions about upgrading? Reply to this email and we'll help you choose the perfect plan.

Don't go back to the old way,
The Quotely Team
    `
  }

  private generateContactResponseHTML(): string {
    return `
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0F172A; color: #E2E8F0;">
        <div style="padding: 30px 20px;">
          <h2 style="color: #00E0FF; font-size: 1.8rem; margin-bottom: 20px;">We Received Your Message</h2>
          
          <p style="font-size: 1.1rem; line-height: 1.6; margin-bottom: 20px;">Hi {{name}},</p>
          
          <p style="font-size: 1.1rem; line-height: 1.6; margin-bottom: 25px;">
            Thank you for contacting Quotely! We've received your message and our team will respond within {{response_time}}.
          </p>
          
          <div style="background: rgba(0, 224, 255, 0.1); border-left: 4px solid #00E0FF; padding: 20px; margin: 25px 0;">
            <p style="margin: 0; font-weight: bold; color: #00E0FF;">Your Message:</p>
            <p style="margin: 10px 0 0 0; font-style: italic;">"{{message}}"</p>
          </div>
          
          <p style="font-size: 1rem; line-height: 1.6; margin-bottom: 20px;">
            In the meantime, feel free to explore our resources or schedule a demo to see Quotely in action.
          </p>
          
          <p style="font-size: 1rem; line-height: 1.6;">
            Best regards,<br>
            The Quotely Team
          </p>
        </div>
      </div>
    `
  }

  private generateContactResponseText(): string {
    return `
Hi {{name}},

Thank you for contacting Quotely! We've received your message and our team will respond within {{response_time}}.

Your Message: "{{message}}"

In the meantime, feel free to explore our resources or schedule a demo to see Quotely in action.

Best regards,
The Quotely Team
    `
  }

  // Utility methods
  getTemplates(): EmailTemplate[] {
    return Array.from(this.templates.values())
  }

  getSequences(): EmailSequence[] {
    return Array.from(this.sequences.values())
  }

  getPendingJobs(): EmailJob[] {
    return this.jobs.filter((job) => job.status === "pending")
  }

  getJobStats(): { pending: number; sent: number; failed: number } {
    return {
      pending: this.jobs.filter((job) => job.status === "pending").length,
      sent: this.jobs.filter((job) => job.status === "sent").length,
      failed: this.jobs.filter((job) => job.status === "failed").length,
    }
  }
}

export default EmailAutomation
export type { EmailTemplate, EmailSequence, EmailJob }
