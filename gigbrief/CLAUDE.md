# GigBrief — Comedy Talent Manager Operations Dashboard

## Project State
**All 4 phases complete.** Full-stack application built and functional.

## Tech Stack
- **Frontend:** React 19 + Vite 8, Tailwind CSS 3, Radix UI primitives, Lucide icons
- **Backend:** Node.js + Express 5
- **Database:** PostgreSQL 16 + Prisma 5 ORM
- **AI Parsing:** Anthropic Claude API (claude-sonnet-4-20250514)
- **State Management:** TanStack React Query

## Running the App
```bash
# Start PostgreSQL
pg_ctlcluster 16 main start

# Push schema and seed
npm run db:push
npm run db:seed

# Start server (port 3001)
npm run dev:server

# Start client (port 5173, proxies /api to 3001)
cd client && npm run dev
```

## Architecture
- `client/` — React SPA with route-based pages
- `server/` — Express API with RESTful routes
- `prisma/` — Schema and seed data
- All AI parsing goes through review before saving
- Checklist items auto-created per gig (11 default items)

## Key Features
- Dashboard with smart alerts (7-day lookahead)
- Full CRUD for Comedians and Gigs
- Multi-contact and multi-showtime support per gig
- AI-powered advance parsing (paste text → structured data)
- AI-powered calendar parsing (bulk import with duplicate detection)
- Import review screen with confidence scoring
- One-sheet generation (comedian vs manager views)
- Calendar view (month + week)
- Global search across comedians and gigs
- Confirmation checklist with progress tracking

## Design System
- Dark command-center theme (#0a0a0f base)
- Accent: Blue #3b82f6, Amber #f59e0b, Red #ef4444, Green #22c55e
- JetBrains Mono for data, Inter for labels
- Status badges, progress bars, collapsible panels

## API Endpoints
- `GET/POST /api/comedians` — List/Create
- `GET/PUT/DELETE /api/comedians/:id` — CRUD
- `GET/POST /api/gigs` — List/Create (auto-checklist)
- `GET/PUT/DELETE /api/gigs/:id` — CRUD
- `POST /api/gigs/:id/showtimes` — Add showtime
- `POST /api/gigs/:id/contacts` — Add contact
- `PUT /api/gigs/checklist/:id` — Toggle checklist
- `POST /api/parse/advance` — AI advance parser
- `POST /api/parse/calendar` — AI calendar parser
- `POST /api/parse/import` — Bulk import reviewed gigs
- `GET /api/search?q=` — Global search
- `POST /api/onesheet/generate/:gigId` — Generate one-sheet
- `POST /api/onesheet/mark-sent/:gigId` — Mark sent
- `GET /api/dashboard/stats` — Dashboard data with alerts
- `GET/POST /api/uploads` — File uploads

## Seed Data
- 2 comedians: John Heffron, Test Comic
- 3 gigs each with varied statuses, contacts, showtimes, checklists

## Future Work (Placeholders)
- Google Calendar sync
- Email sharing
- Role-based access control
- Mobile responsive optimization
