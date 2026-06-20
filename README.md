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
4. Deploy

## Discovery & Import Pipeline

Automated bi-weekly sync via GitHub Actions (`.github/workflows/bi-weekly-provider-sync.yml`):

| Source | Data |
|--------|------|
| **CMS NPI Registry** | Licensed therapists, psychologists, counselors, social workers |
| **OpenStreetMap** | Life coaches, executive coaches, wellness centers, support groups, community centres |

```bash
# Full sync: fetch new listings, remove stale/expired (28+ days)
npm run sync:providers

# Custom limits
node scripts/sync-providers.mjs --npi-per-state=100 --osm-per-state=40
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
