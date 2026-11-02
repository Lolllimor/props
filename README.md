# Rentwise — house rental web app (frontend prototype)

Verified homes, every fee upfront, free inspections. A frontend-first build of the
Product, Design and Dev PRDs, running on **mock data** so every flow is clickable
before the NestJS API exists.

> "Rentwise" is a placeholder name. Change it in `src/lib/brand.ts`.

## Stack

- Next.js 16 (App Router) · React 19 · TypeScript
- Tailwind CSS v4
- [coss ui](https://coss.com/ui) (Base UI) components, vendored in `src/components/ui`
- TanStack Query over a fake API (`src/lib/api.ts`)

## Run it

```bash
npm install
npm run dev
# open http://localhost:3000
```

Node 20+ recommended.

## What's in it

| Route | Screen (Design PRD) |
| --- | --- |
| `/` | Home: area autocomplete, budget, type; freshly confirmed listings |
| `/search` | Results with filters (sidebar on desktop, drawer on mobile), sort, list/map toggle |
| `/listings/[id]` | Listing detail: gallery, verified badge with who/when, full cost breakdown, free inspection booking, save, message, report |
| `/listings/[id]/apply` | Application with ID upload and guarantor |
| `/applications/[id]` | Tenancy agreement → pay (funds held) → confirm move-in |
| `/dashboard` | Tenant: inspections, applications, saved, payments |
| `/messages` | Chat tied to a listing, with an off-platform payment warning |
| `/login` | Phone OTP + role pick |
| `/onboarding` | Owner / agent verification stepper with per-step status |
| `/landlord` | Units (30-day availability expiry), applications, inspections, agent mandates |
| `/landlord/listings/new` | 4-step listing wizard with required fee fields and 10% agency cap |

### Product rules baked in

- Inspections are always free; there is no fee field for them anywhere.
- All five fees are required when listing; agency fee over 10% of rent blocks submission.
- Listings expire 30 days after the last availability confirmation.
- Sponsored results are capped at 1 in 10 and always labelled.
- Rent is "held" until the tenant confirms move-in (escrow still needs legal sign-off).
- Agents need an approved owner mandate per listing.

### Demo shortcuts

- Any Nigerian mobile number (e.g. `08031234567`) and any 6-digit code logs you in.
- New applications auto-approve after ~4 seconds so you can reach payment.
- Document reviews in onboarding auto-approve after ~6 seconds.
- An NIN that isn't 11 digits gets rejected so you can see the "needs a fix" state.
- State lives in memory and resets on page refresh.

## Moving to the real API

Every function in `src/lib/api.ts` maps to an endpoint in the Dev PRD
(`GET /properties`, `POST /inspections`, `POST /payments/initialize`, …).
Replace each body with a `fetch` to `/api/v1/...`; the hooks in
`src/lib/queries.ts` and the pages don't change. Money is in kobo throughout.

## coss ui

Components were copied from the coss ui source (MIT). To pull updates:

```bash
npx shadcn@latest add @coss/button   # or any other component
```

Brand colours live at the bottom of `src/app/globals.css` (deep green primary,
warm off-white background, amber for warnings, red for errors).
