# Alpha Primus

**Become Your Own Leader**

Alpha Primus is a production-ready marketplace and discovery platform connecting people with therapists, coaches, support groups, retreats, and personal growth experiences across the United States.

> Alpha Primus is NOT a healthcare provider. It is solely a discovery platform for independent providers.

## Tech Stack

- **Frontend:** Next.js 15+ App Router, TypeScript, Tailwind CSS, ShadCN UI
- **Backend:** Next.js Server Actions & API Routes
- **Database:** Supabase PostgreSQL + Prisma ORM
- **Auth:** Supabase Auth (cookie-based sessions, no localStorage)
- **Storage:** Supabase Storage
- **Hosting:** Vercel
- **Search:** PostgreSQL Full Text Search (via Prisma)

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Setup

Copy `.env.example` to `.env.local` and fill in your Supabase credentials:

```bash
cp .env.example .env.local
```

## Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Run `npx prisma db push` to sync the schema
3. Apply storage migration: `supabase/migrations/001_initial_setup.sql`
4. Create storage buckets: `provider-images`, `event-images`, `retreat-images`, `user-uploads`

## Deployment (Vercel)

1. Push to GitHub
2. Import project in [vercel.com](https://vercel.com)
3. Add environment variables from `.env.example`
4. Set `NEXT_PUBLIC_SITE_URL` to your production URL (required for PWA scope and SEO)
5. Deploy

## Progressive Web App (PWA)

Alpha Primus installs as a PWA on Android and iOS after deployment over HTTPS.

**Users can install:**
- **Android (Chrome):** Menu → *Install app*, or use the in-app install banner
- **iPhone (Safari):** Share → *Add to Home Screen*

**Features:** home-screen icon, standalone layout, offline fallback page, cached pages for faster repeat visits.

PWA assets are generated at build time (`npm run build` uses webpack + Serwist). Service worker is disabled in `npm run dev` so local development is not cached.

## AI Wellness Guide (Groq + Supabase)

Personalized recommendations at `/guide` based on:
- **Activity tracking** — searches, provider/retreat/event views, category clicks
- **Wellness check-ins** — mood, stress, challenges
- **Groq AI** — suggests therapists, events, retreats from real catalog data

### Supabase setup

1. Run migration `supabase/migrations/002_user_activity_ai.sql` in the Supabase SQL editor (or `supabase db push`)
2. Add env vars to Vercel/local:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (server only — activity writes)
   - `GROQ_API_KEY` (server only — never `NEXT_PUBLIC_`)

Tables created: `user_profiles`, `user_activity_events`, `user_wellness_checkins`, `user_ai_recommendations` (all with RLS).

### How it works

| Layer | Role |
|-------|------|
| Browser | Anonymous `session_id` in localStorage + optional Supabase auth |
| `/api/activity` | Logs browsing events to Supabase |
| `/api/wellness-checkin` | Saves mood/stress check-ins |
| `/api/ai/recommendations` | Reads activity + Groq → personalized next steps |

Sign in at `/auth/login` to attach activity to your account across devices.

## Discovery & Import Pipeline

Automated bi-weekly sync via GitHub Actions (`.github/workflows/bi-weekly-provider-sync.yml`):

| Schedule | Sync mode | SerpAPI calls |
|----------|-----------|---------------|
| **1st of month** | Providers (NPI + 15 Google Maps categories × 5 states) | 75 |
| **15th of month** | Retreats & events (10 queries × 5 states) | 50 |

**Monthly SerpAPI total: 125 / 180** (55 headroom for manual runs). Each run is hard-capped at 90 calls.

| Source | Data |
|--------|------|
| **CMS NPI Registry** | Licensed therapists, psychologists, counselors, social workers |
| **SerpAPI Google Maps** | Coaches, clinics, wellness centers, support groups, retreats, workshops |

Set `SERPAPI_KEY` in GitHub repo secrets and locally in `.env.local` for sync runs.

```bash
npm run sync:providers          # providers mode (default)
npm run sync:retreats-events    # retreats + events only
```

Manual CSV/JSON import:

```bash
npx tsx scripts/discovery/import-csv.ts data/sample.csv
npx tsx scripts/discovery/import-json.ts data/sample.json
```

## Project Structure

```
app/                  # Next.js App Router pages
components/           # UI components (home, providers, search, layout)
data/                 # Seed data (providers, retreats, events, reviews)
lib/                  # Data layer, SEO, Supabase clients, types
prisma/               # Database schema
scripts/discovery/    # Import pipeline & maintenance scripts
supabase/             # SQL migrations & RLS policies
.github/workflows/    # Monthly maintenance automation
```

## License

Private — All rights reserved.
