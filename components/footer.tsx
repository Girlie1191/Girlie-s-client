import Link from "next/link"

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <Link href="/" className="footer-brand">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 12h3v8h14v-8h3L12 2zm0 2.83L18.17 11H5.83L12 4.83zM7 13h10v5H7v-5z" />
          </svg>
          Quotely
        </Link>
        <p>© 2025 Quotely Inc. Built by independent agents, for independent agents.</p>
        <p>Modern insurance platform - Alternative to Applied Rater, EZLynx</p>
        <div className="footer-links">
          <Link href="/features">Features</Link>
          <Link href="/demo-code">Demo Code</Link>
          <Link href="/schedule-demo">Schedule Demo</Link>
          <Link href="/migration-assistance">Migration Assistance</Link>
          <Link href="/start-trial">Start Trial</Link>
          <Link href="/privacy">Privacy Policy</Link>
          <Link href="/terms">Terms of Service</Link>
        </div>
      </div>
    </footer>
  )
}
