/**
 * Locale + pricing auto-detection for the marketing site.
 *
 * Frontend mirror of the `country_config` table (docs/ARCHITECTURE.md §3/§7.1).
 * `detectCountry()` uses the browser's locale as a stand-in for real geo-IP —
 * that's what's available client-side in this sandbox. It is NOT reliable in
 * production (a Bangladeshi visitor on an English-language OS wouldn't be
 * detected as Bangladesh); real deployment needs server-side IP geolocation
 * (e.g. Cloudflare's CF-IPCountry header or MaxMind), with browser locale only
 * as a secondary signal or manual-override default.
 */

export type CountryCode = "US" | "GB" | "BD" | "JP"

export interface CountryProfile {
  code: CountryCode
  name: string
  /** BCP-47 primary language subtag driving which STRINGS dict is used. */
  language: "en" | "bn" | "ja"
  languageLabel: string
  currency: string
  symbol: string
  plus: number
  family: number
  providerFee: number
  /** local price ÷ US base price — documents the PPP adjustment, not computed live. */
  pppFactor: number
}

// Kept in sync with the admin portal's Country Config mock table
// (apps/admin-portal/src/App.tsx) so the same country shows the same reference
// price in both apps.
export const COUNTRY_PROFILES: CountryProfile[] = [
  { code: "US", name: "United States", language: "en", languageLabel: "English", currency: "USD", symbol: "$", plus: 14.99, family: 24.99, providerFee: 25, pppFactor: 1 },
  { code: "GB", name: "United Kingdom", language: "en", languageLabel: "English", currency: "GBP", symbol: "£", plus: 12.99, family: 21.99, providerFee: 20, pppFactor: 0.87 },
  { code: "BD", name: "Bangladesh", language: "bn", languageLabel: "বাংলা", currency: "BDT", symbol: "৳", plus: 499, family: 899, providerFee: 1000, pppFactor: 33.3 },
  { code: "JP", name: "Japan", language: "ja", languageLabel: "日本語", currency: "JPY", symbol: "¥", plus: 1800, family: 3200, providerFee: 3000, pppFactor: 120 },
]

const LOCALE_TO_COUNTRY: Record<string, CountryCode> = {
  bn: "BD", "bn-bd": "BD", "bn-in": "BD",
  ja: "JP", "ja-jp": "JP",
  "en-gb": "GB",
}

/** Browser-locale heuristic — see file header. Defaults to US/English. */
export function detectCountry(): CountryProfile {
  const fallback = COUNTRY_PROFILES[0]
  if (typeof navigator === "undefined") return fallback
  const langs = navigator.languages?.length ? navigator.languages : [navigator.language]
  for (const raw of langs) {
    if (!raw) continue
    const lower = raw.toLowerCase()
    const code = LOCALE_TO_COUNTRY[lower] ?? LOCALE_TO_COUNTRY[lower.split("-")[0]]
    if (code) return COUNTRY_PROFILES.find(c => c.code === code) ?? fallback
  }
  return fallback
}

export function formatLocalPrice(profile: CountryProfile, plan: "plus" | "family"): string {
  const amount = profile[plan]
  return `${profile.symbol}${amount.toLocaleString(profile.language)}`
}

type Dict = Record<string, string>

// Only English is filled in. The point of this file is the *mechanism* —
// detect country → select language + local price, no dropdown of every
// locale shown by default (§7.1) — not translated copy. Bangladesh/Japan
// were an illustrative example, not a request to ship Bangla/Japanese
// content; bn/ja intentionally fall back to English at lookup time (t())
// until real, human-reviewed translations exist (mombestie-docs §12 — this
// product does not auto-publish AI-drafted translations).
export const STRINGS: Record<"en" | "bn" | "ja", Dict> = {
  en: {
    navFeatures: "Features", navHow: "How It Works", navAI: "AI Assistant", navPredict: "BabyPredict",
    navMarketplace: "Marketplace", navProviders: "For Providers", navPricing: "Pricing", navSafety: "Safety & Privacy", navFaq: "FAQ",
    heroEyebrow: "Global AI-powered platform for mothers & children",
    heroTitle: "Every feeding, every nap, every milestone — understood, not just logged.",
    heroSubtitle: "MomBestie AI combines baby tracking, an AI copilot, a voice assistant, routine predictions, and a vetted family services marketplace into one app built for parents of newborns and toddlers, everywhere.",
    ctaDownload: "Download the App", ctaProvider: "Become a Provider",
    pricingEyebrow: "Family plans", pricingTitle: "Simple pricing", pricingSubtitle: "Pricing shown for your country automatically.",
    planFree: "Free", planPlus: "Plus", planFamily: "Family", getStarted: "Get Started", startTrial: "Start Free Trial",
    regionNote: "Showing {country} pricing and language automatically.",
    changeRegion: "Not in {country}? Change region",
    regionPickerTitle: "Choose your country",
  },
  bn: {},
  ja: {},
}

export function t(dict: Dict, key: string, vars?: Record<string, string>): string {
  let s = dict[key] ?? STRINGS.en[key] ?? key
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.replace(`{${k}}`, v)
  return s
}
