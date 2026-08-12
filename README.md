# MomMind AI — Marketing Website

Public marketing site for **MomMind AI**. React 19 + Vite + Tailwind CSS v4.

Covers the product story (AI Copilot, Voice, BabyPredict, tracking, marketplace), family pricing, and the provider pitch ("no monthly fee, one-time application fee, 10% commission only on completed bookings").

This is one repo in MomMind's poly-repo platform — see [mommind-docs](https://github.com/DaitchPro-MomMind-AI/mommind-docs) for the full system architecture.

## Locale & pricing auto-detection

A visitor sees **their own country's language and price by default** — not a dropdown of every locale MomMind supports. See [`src/i18n.ts`](./src/i18n.ts):

- Country is detected from the browser locale (a sandbox stand-in for real geo-IP — see the file header and mommind-docs §7.1 for why this needs to become server-side geo-IP before launch).
- Pricing is per-country reference data (`COUNTRY_PROFILES`), matching the admin portal's Country Config — not a currency conversion of a single USD price.
- Only English copy exists today — the point of this repo's work so far is the *detection/selection mechanism*, not translated content. Non-English locales (Bangla, Japanese, etc.) fall back to English until real, human-reviewed translations are added; this product never auto-publishes machine-translated copy (mommind-docs §12).
- A "Change region" link is the only override — full manual language/currency switching is intentionally not exposed, per product requirement.

## Status

Frontend prototype — no backend. Pricing/commission numbers are reference data (`COUNTRY_PROFILES`), not live config; see mommind-docs for the plan to source this from a real `country_config` service with human-approved price changes (mommind-docs §7.2).

## Development

```bash
npm install
npm run dev
```
