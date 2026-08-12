import { useEffect, useState } from 'react'
import { COUNTRY_PROFILES, STRINGS, detectCountry, formatLocalPrice, t } from './i18n'
import type { CountryProfile } from './i18n'

// ─── Config-driven content (stand-in for country_config — see docs/ARCHITECTURE.md §7/§10) ──
// Country/language/price come from i18n.ts's COUNTRY_PROFILES, auto-detected below (§7.1) —
// nothing here is a globally-fixed number, and nothing is a find-and-replace away from a real
// /country-config endpoint.

const NAV_IDS = ['features', 'how-it-works', 'ai', 'babypredict', 'marketplace', 'providers', 'pricing', 'safety', 'faq'] as const

const FEATURES = [
  { icon: '🧠', title: 'AI Mom Copilot', desc: 'Ask anything about your baby\'s day — feeding, sleep, routines — and get answers grounded in your own logged data, not guesses.' },
  { icon: '🎙️', title: 'Voice Assistant', desc: 'Log a bottle or a nap hands-free while you\'re holding the baby. Multilingual, with live transcript.' },
  { icon: '✨', title: 'BabyPredict', desc: 'Nap windows, feeding windows, and bedtime estimates from your baby\'s real routine — shown with a confidence level, never a guarantee.' },
  { icon: '📊', title: 'Tracking', desc: 'Feeding, sleep, diapers, meals, growth, and milestones in one timeline.' },
  { icon: '📅', title: 'Daily Planner', desc: 'A day view that blends what already happened with what\'s predicted next.' },
  { icon: '👨‍👩‍👧', title: 'Caregiver Collaboration', desc: 'Invite a partner, grandparent, or babysitter with permission-scoped, time-limited access.' },
  { icon: '🔄', title: 'Caregiver Handoff', desc: 'Share a clean summary of the day with whoever\'s taking over next.' },
  { icon: '🥣', title: 'Meals & Development', desc: 'Age-appropriate meal ideas and development activities, tracked alongside everything else.' },
  { icon: '📷', title: 'Private Memories', desc: 'A journal for the moments that matter, visible only to your household.' },
]

const SAFETY_POINTS = [
  'MomMind is not a doctor. It never diagnoses, never recommends medication doses, and never claims clinical certainty.',
  'High-risk medical questions are escalated to “please contact your pediatrician / emergency services” rather than answered.',
  'Child data (profile, health logs, photos, voice) is encrypted in transit and at rest, and is never used for targeted advertising.',
  'You can export or delete your household’s data at any time from the in-app Privacy Center.',
]

function NavBar({
  dict, country, onNavigate, mobileOpen, setMobileOpen, onOpenRegionPicker,
}: {
  dict: Record<string, string>
  country: CountryProfile
  onNavigate: (id: string) => void
  mobileOpen: boolean
  setMobileOpen: (v: boolean) => void
  onOpenRegionPicker: () => void
}) {
  const navLabels: Record<(typeof NAV_IDS)[number], string> = {
    features: t(dict, 'navFeatures'), 'how-it-works': t(dict, 'navHow'), ai: t(dict, 'navAI'),
    babypredict: t(dict, 'navPredict'), marketplace: t(dict, 'navMarketplace'), providers: t(dict, 'navProviders'),
    pricing: t(dict, 'navPricing'), safety: t(dict, 'navSafety'), faq: t(dict, 'navFaq'),
  }
  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#FFFCFAcc] border-b border-[#F6EDE8]">
      <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
        <button onClick={() => onNavigate('top')} className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl coral-gradient flex items-center justify-center text-white font-display">M</div>
          <span className="font-display text-lg text-[#242424]">MomMind AI</span>
        </button>
        <nav className="hidden lg:flex items-center gap-6">
          {NAV_IDS.map(id => (
            <button key={id} onClick={() => onNavigate(id)} className="text-sm text-[#6E6E73] hover:text-[#EE674E] transition-colors">
              {navLabels[id]}
            </button>
          ))}
        </nav>
        <div className="hidden lg:flex items-center gap-3">
          <button onClick={onOpenRegionPicker} className="text-xs text-[#6E6E73] border border-[#F0E8E4] rounded-lg px-2.5 py-1.5 bg-white hover:border-[#F6B6A5]">
            {country.languageLabel} · {country.currency}
          </button>
          <button className="action-btn text-sm font-semibold text-[#EE674E] px-3 py-2">{t(dict, 'ctaProvider')}</button>
          <button className="action-btn coral-gradient text-white text-sm font-semibold px-4 py-2 rounded-xl">{t(dict, 'ctaDownload')}</button>
        </div>
        <button className="lg:hidden w-9 h-9 flex items-center justify-center" onClick={() => setMobileOpen(!mobileOpen)}>
          <span className="text-xl">{mobileOpen ? '✕' : '☰'}</span>
        </button>
      </div>
      {mobileOpen && (
        <div className="lg:hidden border-t border-[#F6EDE8] px-5 py-3 space-y-2 bg-[#FFFCFA]">
          {NAV_IDS.map(id => (
            <button key={id} onClick={() => { onNavigate(id); setMobileOpen(false) }} className="block w-full text-left text-sm text-[#6E6E73] py-1.5">
              {navLabels[id]}
            </button>
          ))}
          <button onClick={onOpenRegionPicker} className="block w-full text-left text-sm text-[#6E6E73] py-1.5 border-t border-[#F6EDE8] pt-2 mt-1">
            {country.languageLabel} · {country.currency} — {t(dict, 'changeRegion', { country: country.name })}
          </button>
          <button className="action-btn w-full coral-gradient text-white text-sm font-semibold px-4 py-2.5 rounded-xl mt-2">{t(dict, 'ctaDownload')}</button>
        </div>
      )}
    </header>
  )
}

function RegionPicker({ dict, current, onSelect, onClose }: { dict: Record<string, string>; current: CountryProfile; onSelect: (c: CountryProfile) => void; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4" onClick={onClose}>
      <div className="w-full max-w-sm bg-white rounded-3xl p-6" onClick={e => e.stopPropagation()}>
        <p className="font-display text-lg text-[#242424] mb-4">{t(dict, 'regionPickerTitle')}</p>
        <div className="space-y-2">
          {COUNTRY_PROFILES.map(c => (
            <button key={c.code} onClick={() => { onSelect(c); onClose() }}
              className={`action-btn w-full flex items-center justify-between px-4 py-3 rounded-xl text-left ${c.code === current.code ? 'bg-[#FFD6C9] text-[#C94930]' : 'bg-[#FFF8F4] text-[#242424]'}`}>
              <span className="text-sm font-medium">{c.name}</span>
              <span className="text-xs text-[#6E6E73]">{c.languageLabel} · {c.currency}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function Section({ id, eyebrow, title, subtitle, children }: { id: string; eyebrow?: string; title: string; subtitle?: string; children?: React.ReactNode }) {
  return (
    <section id={id} className="max-w-6xl mx-auto px-5 py-16 scroll-mt-20">
      <div className="max-w-2xl mb-10">
        {eyebrow && <p className="text-xs font-bold text-[#EE674E] uppercase tracking-wider mb-2">{eyebrow}</p>}
        <h2 className="font-display text-3xl text-[#242424] mb-3">{title}</h2>
        {subtitle && <p className="text-[#6E6E73] leading-relaxed">{subtitle}</p>}
      </div>
      {children}
    </section>
  )
}

export default function App() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [country, setCountry] = useState<CountryProfile>(() => detectCountry())
  const [regionPickerOpen, setRegionPickerOpen] = useState(false)
  const dict = STRINGS[country.language]

  // Locale auto-detection (§7.1): the page renders in the detected country's
  // language and shows only that country's price by default — no dropdown of
  // every supported locale/currency. RegionPicker is the sole override, and it
  // exists so a wrongly-detected visitor (e.g. traveling) isn't trapped, not
  // because "only your country's option" was softened.
  useEffect(() => {
    document.documentElement.lang = country.language
  }, [country])

  const scrollTo = (id: string) => {
    if (id === 'top') { window.scrollTo({ top: 0, behavior: 'smooth' }); return }
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-[#FFFCFA]">
      <NavBar dict={dict} country={country} onNavigate={scrollTo} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} onOpenRegionPicker={() => setRegionPickerOpen(true)} />
      {regionPickerOpen && <RegionPicker dict={dict} current={country} onSelect={setCountry} onClose={() => setRegionPickerOpen(false)} />}

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute top-[-80px] right-[-60px] w-80 h-80 rounded-full opacity-30" style={{ background: 'radial-gradient(circle, #F6B6A5, transparent)' }} />
        <div className="max-w-6xl mx-auto px-5 pt-16 pb-20 relative">
          <p className="text-xs font-bold text-[#EE674E] uppercase tracking-wider mb-3">{t(dict, 'heroEyebrow')}</p>
          <h1 className="font-display text-4xl sm:text-5xl text-[#242424] max-w-2xl leading-tight mb-5">
            {t(dict, 'heroTitle')}
          </h1>
          <p className="text-[#6E6E73] max-w-xl mb-3 leading-relaxed">
            {t(dict, 'heroSubtitle')}
          </p>
          <button onClick={() => setRegionPickerOpen(true)} className="text-xs text-[#EE674E] underline decoration-dotted mb-6 inline-block">
            {t(dict, 'regionNote', { country: country.name })} {t(dict, 'changeRegion', { country: country.name })}
          </button>
          <div className="flex flex-wrap gap-3">
            <button className="action-btn coral-gradient text-white font-semibold px-6 py-3 rounded-2xl">{t(dict, 'ctaDownload')}</button>
            <button onClick={() => scrollTo('providers')} className="action-btn bg-white border-2 border-[#F6B6A5] text-[#EE674E] font-semibold px-6 py-3 rounded-2xl">{t(dict, 'ctaProvider')}</button>
          </div>
        </div>
      </section>

      <Section id="features" eyebrow="Everything in one place" title="Built for the whole first few years" subtitle="Not a single-purpose tracker — a companion that grows with your child.">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map(f => (
            <div key={f.title} className="glass-card rounded-2xl p-5">
              <div className="text-2xl mb-3">{f.icon}</div>
              <h3 className="font-semibold text-[#242424] mb-1.5">{f.title}</h3>
              <p className="text-sm text-[#6E6E73] leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section id="how-it-works" eyebrow="How it works" title="From first log to caregiver handoff">
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            { step: '1', title: 'Log in seconds', desc: 'Tap or say what happened — a feed, a nap, a diaper change.' },
            { step: '2', title: 'MomMind learns the pattern', desc: 'BabyPredict turns your history into confident, labeled predictions.' },
            { step: '3', title: 'Share the day', desc: 'Hand off a clean summary to a partner, grandparent, or babysitter.' },
          ].map(s => (
            <div key={s.step}>
              <div className="w-10 h-10 rounded-full coral-gradient text-white flex items-center justify-center font-display mb-3">{s.step}</div>
              <h3 className="font-semibold text-[#242424] mb-1">{s.title}</h3>
              <p className="text-sm text-[#6E6E73]">{s.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section id="ai" eyebrow="AI Mom Copilot & Voice" title="Ask MomMind, hands-free if you need to" subtitle="MomMind always identifies itself as AI and always flags health topics for a real doctor — see Safety & Privacy below.">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="glass-card-strong rounded-2xl p-6">
            <p className="text-xs font-semibold text-[#EE674E] uppercase tracking-wide mb-2">Chat</p>
            <p className="text-sm text-[#242424]">"Maya drank five ounces."</p>
            <p className="text-sm text-[#6E6E73] mt-2">"Got it — logged a 5 oz bottle for Maya at 2:15 PM."</p>
          </div>
          <div className="glass-card-strong rounded-2xl p-6">
            <p className="text-xs font-semibold text-[#EE674E] uppercase tracking-wide mb-2">Voice</p>
            <p className="text-sm text-[#6E6E73]">Streaming speech-to-text, barge-in support, and multilingual replies — built for when your hands are full. MomMind says who it is at the start of every session.</p>
          </div>
        </div>
      </Section>

      <Section id="babypredict" eyebrow="BabyPredict" title="Routine intelligence, shown honestly" subtitle="Predictions always carry a confidence level and are never presented as medical guidance.">
        <div className="glass-card rounded-2xl p-6 max-w-md">
          <p className="text-xs font-semibold text-[#EE674E] uppercase tracking-wide mb-2">Example prediction</p>
          <p className="font-display text-2xl text-[#242424]">Next nap: 9:35–10:05 AM</p>
          <p className="text-sm text-[#6E6E73] mt-1">82% confidence · based on 7 days of logged data</p>
        </div>
      </Section>

      <Section id="marketplace" eyebrow="Family services marketplace" title="Vetted help, when you need it" subtitle="Babysitters, postpartum support, meal prep, and more — every provider is verified before they can accept a booking.">
        <div className="grid sm:grid-cols-4 gap-4">
          {['Babysitters', 'Postpartum Support', 'Meal Preparation', 'Baby Photographers'].map(c => (
            <div key={c} className="glass-card rounded-2xl p-4 text-center">
              <p className="text-sm font-semibold text-[#242424]">{c}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section id="providers" eyebrow="For Providers" title="Grow your business with MomMind" subtitle="No monthly subscription — pay a one-time application fee, keep control of your services, and MomMind takes a commission only on completed bookings.">
        <div className="grid sm:grid-cols-3 gap-4 max-w-3xl">
          <div className="glass-card rounded-2xl p-5">
            <p className="text-xs font-semibold text-[#6E6E73] uppercase tracking-wide mb-1">One-time fee</p>
            <p className="font-display text-2xl text-[#242424]">{country.symbol}{country.providerFee.toLocaleString(country.language)}</p>
            <p className="text-xs text-[#6E6E73] mt-1">Application &amp; verification, once</p>
          </div>
          <div className="glass-card rounded-2xl p-5">
            <p className="text-xs font-semibold text-[#6E6E73] uppercase tracking-wide mb-1">No monthly fee</p>
            <p className="font-display text-2xl text-[#242424]">{country.symbol}0/mo</p>
            <p className="text-xs text-[#6E6E73] mt-1">Ever</p>
          </div>
          <div className="glass-card rounded-2xl p-5">
            <p className="text-xs font-semibold text-[#6E6E73] uppercase tracking-wide mb-1">Commission</p>
            <p className="font-display text-2xl text-[#242424]">10%</p>
            <p className="text-xs text-[#6E6E73] mt-1">Only on completed bookings</p>
          </div>
        </div>
        <p className="text-xs text-[#6E6E73] mt-4 max-w-lg">
          Pricing shown for {country.name} ({country.currency}), detected automatically. Actual fees and commission are
          set per country by MomMind's Country Configuration and may differ — see the Admin Portal.
        </p>
        <button className="action-btn coral-gradient text-white font-semibold px-6 py-3 rounded-2xl mt-6">Start Provider Registration</button>
      </Section>

      <Section id="pricing" eyebrow={t(dict, 'pricingEyebrow')} title={t(dict, 'pricingTitle')} subtitle={t(dict, 'pricingSubtitle')}>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { name: t(dict, 'planFree'), price: null, features: ['Core tracking', 'Basic timeline', '1 caregiver'] },
            { name: t(dict, 'planPlus'), price: formatLocalPrice(country, 'plus'), features: ['Everything in Free', 'AI Copilot', 'BabyPredict', 'Unlimited caregivers'], highlight: true },
            { name: t(dict, 'planFamily'), price: formatLocalPrice(country, 'family'), features: ['Everything in Plus', 'Voice Assistant', 'Marketplace priority support', 'Multiple children'] },
          ].map(p => (
            <div key={p.name} className={`rounded-2xl p-6 ${p.highlight ? 'glass-card-strong border-2 border-[#EE674E]' : 'glass-card'}`}>
              <p className="font-semibold text-[#242424] mb-1">{p.name}</p>
              <p className="font-display text-3xl text-[#242424] mb-4">{p.price === null ? t(dict, 'planFree') : `${p.price}/mo`}</p>
              <ul className="space-y-2 mb-6">
                {p.features.map(f => <li key={f} className="text-sm text-[#6E6E73]">✓ {f}</li>)}
              </ul>
              <button className={`action-btn w-full py-2.5 rounded-xl font-semibold text-sm ${p.highlight ? 'coral-gradient text-white' : 'bg-[#FFD6C9] text-[#C94930]'}`}>
                {p.price === null ? t(dict, 'getStarted') : t(dict, 'startTrial')}
              </button>
            </div>
          ))}
        </div>
      </Section>

      <Section id="safety" eyebrow="Safety, privacy & security" title="Your child's data is not a product" subtitle="MomMind is a parenting companion, not a medical provider.">
        <div className="space-y-3 max-w-2xl">
          {SAFETY_POINTS.map(p => (
            <div key={p} className="flex gap-3">
              <span className="text-[#55A67A] mt-0.5">✓</span>
              <p className="text-sm text-[#6E6E73] leading-relaxed">{p}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section id="faq" eyebrow="FAQ" title="Common questions">
        <div className="space-y-4 max-w-2xl">
          {[
            { q: 'Is MomMind available where I live?', a: 'MomMind is built to be country-configurable from day one. Availability, pricing, and marketplace access vary by country — check the app for your region.' },
            { q: 'Does MomMind replace my pediatrician?', a: 'No. MomMind never diagnoses or recommends treatment. High-risk questions are escalated to “contact your pediatrician” rather than answered.' },
            { q: 'How is my data used?', a: 'Never for targeted advertising. You can export or delete it at any time from the Privacy Center.' },
          ].map(f => (
            <div key={f.q} className="glass-card rounded-2xl p-5">
              <p className="font-semibold text-[#242424] mb-1.5">{f.q}</p>
              <p className="text-sm text-[#6E6E73] leading-relaxed">{f.a}</p>
            </div>
          ))}
        </div>
      </Section>

      <footer className="border-t border-[#F6EDE8] bg-white">
        <div className="max-w-6xl mx-auto px-5 py-10 grid sm:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg coral-gradient flex items-center justify-center text-white text-sm font-display">M</div>
              <span className="font-display text-[#242424]">MomMind AI</span>
            </div>
            <p className="text-xs text-[#6E6E73]">A global AI-powered platform for mothers and children.</p>
          </div>
          {[
            { title: 'Product', links: ['Features', 'AI Assistant', 'BabyPredict', 'Pricing'] },
            { title: 'Providers', links: ['Become a Provider', 'Provider Pricing', 'Provider Login'] },
            { title: 'Company', links: ['About', 'Safety & Privacy', 'Help / FAQ', 'Contact'] },
          ].map(col => (
            <div key={col.title}>
              <p className="text-xs font-semibold text-[#242424] uppercase tracking-wide mb-3">{col.title}</p>
              <ul className="space-y-2">
                {col.links.map(l => <li key={l}><a href="#" className="text-sm text-[#6E6E73] hover:text-[#EE674E]">{l}</a></li>)}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-[#F6EDE8] py-4 text-center text-xs text-[#6E6E73]">
          © {new Date().getFullYear()} MomMind AI. Legal entity, terms, and privacy notices vary by country — see Legal.
        </div>
      </footer>
    </div>
  )
}
