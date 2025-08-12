"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

interface FormData {
  name: string
  email: string
  phone: string
  agency: string
  message: string
}

export default function DemoBookingForm() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    agency: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const { toast } = useToast()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/demo-booking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          timestamp: new Date().toISOString(),
          source: "website_demo_form",
        }),
      })

      if (response.ok) {
        setIsSubmitted(true)
        toast({
          title: "Demo Request Submitted!",
          description: "We'll contact you within 24 hours to schedule your personalized demo.",
        })

        // Reset form
        setFormData({
          name: "",
          email: "",
          phone: "",
          agency: "",
          message: "",
        })
      } else {
        throw new Error("Failed to submit demo request")
      }
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "Please try again or contact us directly at demo@quotely.com",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="demo-form">
        <div className="text-center py-12">
          <div className="mb-6">
            <svg className="mx-auto h-16 w-16 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-accent-blue mb-4">Demo Request Received!</h3>
          <p className="text-lg mb-6">
            Thank you for your interest in Quotely. Our team will contact you within 24 hours to schedule your
            personalized demo.
          </p>
          <p className="text-sm opacity-75">
            In the meantime, feel free to explore our features or start a free trial.
          </p>
          <div className="mt-8 flex gap-4 justify-center">
            <Button
              onClick={() => setIsSubmitted(false)}
              variant="outline"
              className="bg-transparent border-accent-blue text-accent-blue hover:bg-accent-blue hover:text-bg-deep-dark"
            >
              Submit Another Request
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="demo-form">
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <div>
            <Label htmlFor="name" className="text-accent-blue font-semibold text-lg">
              Full Name *
            </Label>
            <Input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="mt-2 bg-slate-800/40 border-accent-blue/20 text-text-primary-light focus:border-accent-blue focus:ring-accent-blue"
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <Label htmlFor="email" className="text-accent-blue font-semibold text-lg">
              Work Email *
            </Label>
            <Input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="mt-2 bg-slate-800/40 border-accent-blue/20 text-text-primary-light focus:border-accent-blue focus:ring-accent-blue"
              placeholder="your.email@agency.com"
            />
          </div>

          <div>
            <Label htmlFor="phone" className="text-accent-blue font-semibold text-lg">
              Phone Number
            </Label>
            <Input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="mt-2 bg-slate-800/40 border-accent-blue/20 text-text-primary-light focus:border-accent-blue focus:ring-accent-blue"
              placeholder="(555) 123-4567"
            />
          </div>

          <div>
            <Label htmlFor="agency" className="text-accent-blue font-semibold text-lg">
              Agency Name *
            </Label>
            <Input
              type="text"
              id="agency"
              name="agency"
              value={formData.agency}
              onChange={handleInputChange}
              required
              className="mt-2 bg-slate-800/40 border-accent-blue/20 text-text-primary-light focus:border-accent-blue focus:ring-accent-blue"
              placeholder="Your Insurance Agency"
            />
          </div>

          <div>
            <Label htmlFor="message" className="text-accent-blue font-semibold text-lg">
              Your Message / Specific Interests
            </Label>
            <Textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              rows={5}
              className="mt-2 bg-slate-800/40 border-accent-blue/20 text-text-primary-light focus:border-accent-blue focus:ring-accent-blue resize-none"
              placeholder="Tell us about your current setup, specific needs, or questions about Quotely..."
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-accent-blue text-bg-deep-dark hover:bg-white font-bold text-lg py-6 transition-all duration-300 hover:shadow-lg hover:shadow-accent-blue/50"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-bg-deep-dark"></div>
                Submitting Request...
              </div>
            ) : (
              "Request Demo"
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
