'use client'

import { useState } from 'react'

const steps = [
  { number: '01', title: 'Your details', caption: 'Who are you?' },
  { number: '02', title: 'Location', caption: 'Where is it?' },
  { number: '03', title: 'Your complaint', caption: 'What happened?' },
  { number: '04', title: 'Review', caption: 'Ready to send' },
]

export default function Page() {
  const [gender, setGender] = useState('Female')
  const [submitted, setSubmitted] = useState(false)

  return (
    <main className="portal-shell">
      <div className="utility-bar"><span>GOVERNMENT OF AZAD JAMMU & KASHMIR</span><span>Public service portal · 24/7</span></div>
      <header className="site-header">
        <a className="brand-lockup" href="#top" aria-label="PMCC home">
          <div className="seal" aria-hidden="true"><span>PM</span><i>CC</i></div>
          <div><p className="brand-name">PMCC</p><p className="brand-urdu" lang="ur" dir="rtl">وزیراعظم رابطہ مرکز</p></div>
        </a>
        <nav className="header-actions" aria-label="Main navigation">
          <a className="nav-link active" href="#complaint">File a complaint</a>
          <a className="nav-link" href="#track">Track complaint <span aria-hidden="true">↗</span></a>
          <button className="language-button" type="button" aria-label="Change language"><span>EN</span><span lang="ur">اردو</span></button>
        </nav>
      </header>

      <div className="content-wrap" id="top">
        <section className="intro" aria-labelledby="page-title">
          <div><p className="overline">Complaint submission · 01 / 04</p><h1 id="page-title">Let&apos;s get your<br /><em>voice heard.</em></h1></div>
          <p className="intro-copy">Start by telling us a little about yourself. Your information is kept secure and used only to follow up on your complaint.</p>
        </section>

        <section className="journey" aria-label="Complaint submission progress">
          <div className="journey-line" aria-hidden="true" />
          {steps.map((step, index) => <div className={`journey-step ${index === 0 ? 'current' : ''}`} key={step.number} aria-current={index === 0 ? 'step' : undefined}><span>{step.number}</span><div><strong>{step.title}</strong><small>{step.caption}</small></div></div>)}
        </section>

        <section className="form-card" id="complaint" aria-labelledby="form-title">
          <div className="section-heading"><div><p className="section-kicker">Step one</p><h2 id="form-title">About you</h2></div><p className="required-note"><span>*</span> Required fields</p></div>
          <form onSubmit={(event) => { event.preventDefault(); setSubmitted(true) }}>
            <div className="form-grid">
              <label>Full name <span>*</span><input required defaultValue="Mahnoor" placeholder="Enter your full name" /></label>
              <label>CNIC number <span>*</span><input required inputMode="numeric" defaultValue="55555-5555555-5" placeholder="00000-0000000-0" /></label>
              <label>Mobile number <span>*</span><input required type="tel" defaultValue="0300-9999999" placeholder="03XX-XXXXXXX" /></label>
              <label>Gender <em>Optional</em><select value={gender} onChange={(event) => setGender(event.target.value)}><option value="">Prefer not to say</option><option>Male</option><option>Female</option><option>Other</option></select></label>
            </div>
            <div className="form-footer"><p><span className="privacy-dot" aria-hidden="true" /> Your details are protected and never shared publicly.</p><button className="continue-button" type="submit">Continue <span aria-hidden="true">→</span></button></div>
            {submitted && <p className="success-message" role="status">Your details are saved. Location is the next step.</p>}
          </form>
        </section>
        <p className="help-line">Need help? Call <strong>0800-786-01</strong> · Available in English and Urdu</p>
      </div>
      <footer className="site-footer"><span className="footer-mark" aria-hidden="true">AJK</span><span lang="ur" dir="rtl">حکومتِ آزاد جموں و کشمیر</span><span className="footer-note">Built for citizens</span></footer>
    </main>
  )
}
