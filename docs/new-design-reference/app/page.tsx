'use client'

import { useState } from 'react'
import { ArrowLeft, ArrowRight, Check, ChevronDown, CircleHelp, FileText, LockKeyhole, MapPin, Menu, Phone, UserRound } from 'lucide-react'

type Language = 'en' | 'ur'

const steps = [
  { en: 'Your details', ur: 'آپ کی تفصیلات', short: 'Details', icon: UserRound },
  { en: 'Location', ur: 'مقام', short: 'Location', icon: MapPin },
  { en: 'Your complaint', ur: 'آپ کی شکایت', short: 'Complaint', icon: FileText },
  { en: 'Review', ur: 'جائزہ', short: 'Review', icon: Check },
]

const copy = {
  en: { service: 'Citizen facilitation portal · 24/7', brand: 'Government of Azad Jammu & Kashmir', title: "Let’s get your voice heard.", subtitle: 'Submit your complaint in four clear steps. We’ll route it directly to the right authority.', file: 'File a complaint', track: 'Track complaint', details: 'About you', required: 'Required fields', fullName: 'Full name', cnic: 'CNIC number', mobile: 'Mobile number', gender: 'Gender', namePlaceholder: 'Enter your full name', cnicPlaceholder: '00000-0000000-0', mobilePlaceholder: '0300-0000000', genderValue: 'Prefer not to say', next: 'Next step', back: 'Back', help: 'Need help? Call', safe: 'Your information is encrypted and kept confidential.', step: 'Step', of: 'of 4', language: 'اردو', pmcc: 'PMCC', pmccSub: 'Prime Minister Complaint Cell' },
  ur: { service: 'عوامی خدمت پورٹل · 24/7', brand: 'حکومت آزاد جموں و کشمیر', title: 'آپ کی آواز، ہماری ذمہ داری', subtitle: 'چار آسان مراحل میں اپنی شکایت درج کرائیں — ہم آپ کی بات براہ راست متعلقہ حکام تک پہنچائیں گے۔', file: 'شکایت درج کریں', track: 'شکایت ٹریک کریں', details: 'آپ کے بارے میں', required: 'مطلوبہ خانے', fullName: 'پورا نام', cnic: 'قومی شناختی کارڈ نمبر', mobile: 'موبائل نمبر', gender: 'جنس', namePlaceholder: 'اپنا مکمل نام درج کریں', cnicPlaceholder: '00000-0000000-0', mobilePlaceholder: '0300-0000000', genderValue: 'بتانا نہیں چاہتے', next: 'اگلا مرحلہ', back: 'واپس', help: 'مدد چاہیے؟ کال کریں', safe: 'آپ کی معلومات مکمل طور پر محفوظ اور رازدارانہ رکھی جاتی ہیں۔', step: 'مرحلہ', of: '4', language: 'EN', pmcc: 'وزیر اعظم شکایات سیل', pmccSub: 'عوامی شکایات کا مرکز' },
}

export default function Page() {
  const [language, setLanguage] = useState<Language>('en')
  const [step, setStep] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const t = copy[language]
  const rtl = language === 'ur'

  return (
    <main className="app-shell" dir={rtl ? 'rtl' : 'ltr'}>
      <header className="site-header">
        <div className="nav-bar">
          <div className="brand-lockup"><div className="brand-mark">PM</div><div><strong>{t.pmcc}</strong><span>{t.pmccSub}</span></div></div>
          <div className="nav-actions">
            <button className="link-button" type="button"><span className="desktop-only">{rtl ? '↑' : '↑ '}</span>{t.track}</button>
            <button className="primary-button nav-cta" type="button" onClick={() => setStep(0)}>{t.file}</button>
            <button className="language-toggle" type="button" aria-label="Switch language" onClick={() => setLanguage(rtl ? 'en' : 'ur')}><span>{t.language}</span><span className="toggle-dot">◐</span></button>
            <button className="menu-button" type="button" aria-label="Open menu"><Menu /></button>
          </div>
        </div>
      </header>

      <section className="workspace">
        <div className="intro">
          <div className="eyebrow"><span className="eyebrow-dot" /> {rtl ? 'آپ کی بات اہم ہے' : 'A direct line to action'}</div>
          <h1>{t.title}</h1>
          <p>{t.subtitle}</p>
        </div>

        <nav className="progress" aria-label="Complaint steps">
          {steps.map((item, index) => <div className={`progress-step ${index === step ? 'active' : ''} ${index < step ? 'complete' : ''}`} key={item.en}>
            <div className="step-line" />
            <div className="step-circle">{index < step ? <Check aria-hidden="true" /> : <item.icon aria-hidden="true" />}</div>
            <div className="step-label"><strong><span className="step-number">0{index + 1}</span>{rtl ? item.ur : item.en}</strong><span>{rtl ? item.en : item.short}</span></div>
          </div>)}
        </nav>

        <section className="form-card" dir={rtl ? 'rtl' : 'ltr'} aria-labelledby="form-title">
          <div className="card-topline"><span className="step-badge">{t.step} {step + 1} {t.of}</span><span className="required"><b>*</b> {t.required}</span></div>
          {!submitted ? <>
            <div className="card-heading"><div><span className="section-kicker">{rtl ? 'پہلا قدم' : 'First step'}</span><h2 id="form-title">{step === 0 ? t.details : rtl ? steps[step].ur : steps[step].en}</h2></div><CircleHelp className="help-icon" aria-hidden="true" /></div>
            {step === 0 && <div className="fields">
              <Field label={t.fullName} required icon={<UserRound />} placeholder={t.namePlaceholder} rtl={rtl} />
              <Field label={t.cnic} required icon={<span className="hash-icon">#</span>} placeholder={t.cnicPlaceholder} rtl={rtl} inputMode="numeric" />
              <Field label={t.mobile} required icon={<Phone />} placeholder={t.mobilePlaceholder} rtl={rtl} inputMode="tel" />
              <Field label={t.gender} optional icon={<ChevronDown />} placeholder={t.genderValue} rtl={rtl} />
            </div>}
            {step === 1 && <div className="empty-step"><MapPin /><div><strong>{rtl ? 'اپنا مقام منتخب کریں' : 'Where did this happen?'}</strong><p>{rtl ? 'اپنی شکایت سے متعلق ضلع اور تحصیل منتخب کریں۔' : 'Select the district and tehsil related to your complaint.'}</p></div></div>}
            {step === 2 && <div className="empty-step"><CircleHelp /><div><strong>{rtl ? 'اپنی شکایت کی تفصیل بتائیں' : 'Tell us what happened'}</strong><p>{rtl ? 'واقعے کی مختصر اور واضح تفصیل درج کریں۔' : 'Add a short, clear description of the issue.'}</p></div></div>}
            {step === 3 && <div className="empty-step"><Check /><div><strong>{rtl ? 'اپنی معلومات کا جائزہ لیں' : 'Review your information'}</strong><p>{rtl ? 'جمع کرانے سے پہلے اپنی معلومات کی تصدیق کریں۔' : 'Confirm your details before submitting your complaint.'}</p></div></div>}
            <div className="card-footer"><span className="safe-note"><LockKeyhole /> {t.safe}</span><div className="footer-actions">{step > 0 && <button className="secondary-button" type="button" onClick={() => setStep(step - 1)}><ArrowLeft data-icon="inline-start" /> {t.back}</button>}<button className="primary-button" type="button" onClick={() => step < 3 ? setStep(step + 1) : setSubmitted(true)}>{step === 3 ? (rtl ? 'جمع کرائیں' : 'Submit complaint') : t.next} <ArrowRight data-icon="inline-end" /></button></div></div>
          </> : <div className="success-state"><div className="success-icon"><Check /></div><h2>{rtl ? 'شکایت کامیابی سے جمع ہو گئی' : 'Complaint submitted successfully'}</h2><p>{rtl ? 'آپ کی شکایت متعلقہ ادارے کو بھیج دی گئی ہے۔' : 'Your complaint has been sent to the relevant authority.'}</p><button className="primary-button" type="button" onClick={() => { setSubmitted(false); setStep(0) }}>{rtl ? 'نئی شکایت درج کریں' : 'File another complaint'}</button></div>}
        </section>
        <p className="help-line">{t.help} <strong>0800-786-01</strong> · {rtl ? 'اردو اور انگریزی میں دستیاب' : 'Available in English and Urdu'}</p>
      </section>
      <footer className="site-footer"><span>AJK · {rtl ? 'شہریوں کے لیے بنایا گیا' : 'Built for citizens'}</span><span>PMCC <b>Public service, made simpler.</b></span></footer>
    </main>
  )
}

function Field({ label, required, optional, icon, placeholder, rtl, inputMode }: { label: string; required?: boolean; optional?: boolean; icon: React.ReactNode; placeholder: string; rtl: boolean; inputMode?: 'numeric' | 'tel' }) {
  return <label className="field"><span className="field-label">{label} {required && <b>*</b>} {optional && <em>({rtl ? 'اختیاری' : 'optional'})</em>}</span><span className="input-wrap">{icon}<input placeholder={placeholder} dir={rtl ? 'rtl' : 'ltr'} inputMode={inputMode} autoComplete={label.toLowerCase().includes('name') ? 'name' : undefined} /></span></label>
}
