"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

interface HeroSectionProps {
  title: string
  subtitle: string
  showCTA?: boolean
}

export default function HeroSection({ title, subtitle, showCTA = true }: HeroSectionProps) {
  const [displayedTitle, setDisplayedTitle] = useState("")
  const [isTyping, setIsTyping] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    let charIndex = 0
    const typeWriter = () => {
      if (charIndex < title.length) {
        setDisplayedTitle(title.slice(0, charIndex + 1))
        charIndex++
        setTimeout(typeWriter, 70)
      } else {
        setIsTyping(false)
      }
    }

    setTimeout(typeWriter, 500)
  }, [title, mounted])

  if (!mounted) {
    return (
      <section className="hero">
        <div className="container">
          <h1 id="hero-title">{title}</h1>
          <p>{subtitle}</p>
          {showCTA && (
            <div className="cta-group">
              <Link href="/demo-code" className="cta">
                View Demo Code
              </Link>
              <Link href="/features" className="cta secondary">
                See Features
              </Link>
              <Link href="/schedule-demo" className="cta">
                Schedule Live Demo
              </Link>
            </div>
          )}
        </div>
      </section>
    )
  }

  return (
    <section className="hero">
      <div className="container">
        <h1
          id="hero-title"
          style={{
            borderRight: isTyping ? ".15em solid var(--accent-blue)" : "none",
          }}
        >
          {displayedTitle}
        </h1>
        <p>{subtitle}</p>
        {showCTA && (
          <div className="cta-group">
            <Link href="/demo-code" className="cta">
              View Demo Code
            </Link>
            <Link href="/features" className="cta secondary">
              See Features
            </Link>
            <Link href="/schedule-demo" className="cta">
              Schedule Live Demo
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
