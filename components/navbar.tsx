"use client"

import Link from "next/link"
import { useState } from "react"

export default function Navbar() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  return (
    <header className="navbar">
      <div className="container">
        <Link href="/" className="navbar-brand">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 12h3v8h14v-8h3L12 2zm0 2.83L18.17 11H5.83L12 4.83zM7 13h10v5H7v-5z" />
          </svg>
          Quotely
        </Link>

        <nav className="navbar-links">
          <Link href="/features">Features</Link>
          <Link href="/demo-code">Demo Code</Link>
          <Link href="/schedule-demo">Schedule Demo</Link>
          <Link href="/migration-assistance">Migration Assistance</Link>
          <Link href="/start-trial">Start Trial</Link>
        </nav>

        <input
          type="checkbox"
          id="mobile-nav-toggle"
          checked={mobileNavOpen}
          onChange={(e) => setMobileNavOpen(e.target.checked)}
          aria-label="Toggle mobile navigation"
        />
        <label htmlFor="mobile-nav-toggle" className="menu-toggle">
          &#9776;
        </label>

        <div
          className="mobile-nav-overlay"
          style={{
            display: mobileNavOpen ? "block" : "none",
            opacity: mobileNavOpen ? "1" : "0",
          }}
        ></div>

        <div
          className="mobile-nav-content"
          style={{
            left: mobileNavOpen ? "0" : "-300px",
          }}
        >
          <label htmlFor="mobile-nav-toggle" className="close-button" onClick={() => setMobileNavOpen(false)}>
            &times;
          </label>
          <Link href="/" onClick={() => setMobileNavOpen(false)}>
            Home
          </Link>
          <Link href="/features" onClick={() => setMobileNavOpen(false)}>
            Features
          </Link>
          <Link href="/demo-code" onClick={() => setMobileNavOpen(false)}>
            Demo Code
          </Link>
          <Link href="/schedule-demo" onClick={() => setMobileNavOpen(false)}>
            Schedule Demo
          </Link>
          <Link href="/migration-assistance" onClick={() => setMobileNavOpen(false)}>
            Migration Assistance
          </Link>
          <Link href="/start-trial" onClick={() => setMobileNavOpen(false)}>
            Start Trial
          </Link>
        </div>
      </div>
    </header>
  )
}
