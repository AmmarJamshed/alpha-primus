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

```bash
npx tsx scripts/discovery/import-csv.ts data/sample.csv
npx tsx scripts/discovery/import-json.ts data/sample.json
npx tsx scripts/discovery/validate-websites.ts
npx tsx scripts/discovery/generate-report.ts
```

Imported records go to `scripts/discovery/output/import-queue.json` for admin approval.

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
