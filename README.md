# Chilli Boys Manufacturing — Plan Portal

A full-stack client portal for Chilli Boys Manufacturing, a custom metalwork and fabrication shop in El Pescadero, Baja California Sur, Mexico. Built with Next.js 13 (App Router), Tailwind CSS, and Supabase.

**Live URL:** https://plan.chilliboys.mx

---

## Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Features](#features)
4. [Project Structure](#project-structure)
5. [Getting Started](#getting-started)
6. [Environment Variables](#environment-variables)
7. [Architecture](#architecture)
8. [Data Model](#data-model)
9. [Authentication & Authorization](#authentication--authorization)
10. [Deployment](#deployment)
11. [Linting & Code Quality](#linting--code-quality)
12. [Troubleshooting](#troubleshooting)

---

## Overview

The Plan Portal lets clients:

- Browse a catalog of services, textures, and design concepts
- Create storyboards to visualize their projects
- Submit projects for quotes
- Track project status and communicate with the team

Admins and PMs can manage projects, users, and storyboards from dedicated dashboards.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 13 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Auth & Database | Supabase (Auth + PostgreSQL) |
| State | React Context (AuthProvider) |
| Analytics | Vercel Analytics + Google Analytics 4 |
| Deployment | Vercel (static export) |

---

## Features

### Public Pages
- **Landing Page** (`/`) — Blueprint-themed gate overlay with catalog preview
- **Catalog** (`/catalog`) — Browsable service categories, textures, and design concepts
- **Privacy Policy** (`/privacy`) & **Terms** (`/terms`)

### Client Flow
- **Plan Wizard** (`/plan`) — Step-by-step project questionnaire
- **Storyboard** (`/storyboard`) — Infinite canvas with pan/zoom for visual planning
  - 11 element types: text, title, shape, sticky note, gallery image, upload, AI image, service, concept, swatch
  - AI image generation via Pollinations.ai (Flux model)
  - Export/import JSON
- **Dashboard** (`/dashboard`) — View submitted projects and status

### Admin & PM Dashboards
- **Admin** (`/admin`) — Full CRUD on projects, users, storyboards; quoting; feedback threads
- **PM** (`/pm`) — Project management, read-only users, storyboard previews

### Auth
- Supabase Auth with email/password
- Role-based access: `client`, `pm`, `admin`
- Auto-profile creation on signup
- Email confirmation disabled for instant access

---

## Project Structure

```
.
├── app/                    # Next.js App Router pages
│   ├── admin/page.tsx      # Admin dashboard
│   ├── catalog/page.tsx    # Product catalog
│   ├── dashboard/page.tsx  # Client project view
│   ├── login/page.tsx      # Login
│   ├── pm/page.tsx         # PM dashboard
│   ├── plan/page.tsx       # Quote wizard
│   ├── register/page.tsx   # Signup
│   ├── storyboard/page.tsx # Storyboard canvas
│   ├── privacy/page.tsx    # Privacy policy
│   ├── terms/page.tsx      # Terms of service
│   ├── layout.tsx          # Root layout (metadata, GA, analytics)
│   ├── page.tsx            # Landing page
│   └── globals.css         # Global styles + Tailwind
├── components/             # React components
│   ├── AuthProvider.tsx    # Auth context
│   ├── StoryboardCanvas.tsx# Infinite canvas component
│   ├── Navbar.tsx          # Site navigation
│   └── Footer.tsx          # Site footer
├── lib/                    # Utilities & data layer
│   ├── data.ts             # Static catalog data
│   ├── storage.ts          # Supabase CRUD + Auth
│   └── supabase.ts         # Supabase client
├── public/                 # Static assets
│   └── og-image.png        # Social preview image
├── .eslintrc.json          # ESLint config
├── next.config.js          # Next.js config (static export)
├── tailwind.config.js      # Tailwind theme
└── tsconfig.json           # TypeScript config
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or equivalent package manager

### Installation

```bash
# Clone the repo
git clone https://github.com/ridgerunnerds/plan-chilliboys.git
cd plan-chilliboys

# Install dependencies
npm install

# Run the dev server
npm run dev
```

The app will be available at `http://localhost:3000`.

### Build for Production

```bash
npm run build
```

This generates a static export in the `out/` directory, suitable for hosting on Vercel, Netlify, or any static CDN.

---

## Environment Variables

Create a `.env.local` file in the project root:

```env
# Supabase (required for client-side auth and data)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

**Note:** Because the app uses `output: 'export'`, all Supabase calls are client-side. The anon key is public by design. Row Level Security (RLS) should be your primary security mechanism.

---

## Architecture

### Static Export

The app is configured for static export (`output: 'export'` in `next.config.js`). This means:

- No server-side rendering at runtime
- No API routes or middleware
- All Supabase calls happen in the browser
- Environment variables prefixed with `NEXT_PUBLIC_` are baked into the bundle at build time

### Authentication Flow

1. User signs up/logs in via Supabase Auth
2. `AuthProvider` checks for an active session on mount
3. `ensureProfile()` fetches or auto-creates a `profiles` row from auth metadata
4. Role-based redirects send users to their appropriate dashboard

### Data Persistence

All data is stored in Supabase PostgreSQL:

- `auth.users` — Managed by Supabase Auth
- `profiles` — Extended user data (name, role, created_at)
- `projects` — Client projects with status, quote, feedback
- `storyboards` — JSONB elements array

---

## Data Model

### User (`profiles` table)
```ts
{
  id: string          // UUID, matches auth.users
  email: string
  name: string
  role: 'client' | 'pm' | 'admin'
  created_at: string
}
```

### Project
```ts
{
  id: string
  userId: string
  userName: string
  userEmail: string
  title: string
  description: string
  status: 'pending' | 'in_review' | 'quoted' | 'approved' | 'in_progress' | 'completed'
  quote?: number
  phone?: string
  storyboardId?: string
  feedback: FeedbackMessage[]
  createdAt: string
}
```

### Storyboard
```ts
{
  id: string
  userId: string
  name: string
  elements: StoryboardElement[]
  createdAt: string
  updatedAt?: string
}
```

### StoryboardElement
```ts
{
  id: string
  type: 'text' | 'shape' | 'image' | 'note' | 'title' | 'upload' | 'service' | 'concept' | 'swatch'
  x: number
  y: number
  width?: number
  height?: number
  content?: string
  color?: string
  fontSize?: number
  fillOpacity?: number
  borderColor?: string
  borderWidth?: number
  prompt?: string           // AI image prompt
  promptHistory?: Array
  images?: Array            // Generated image revisions
  data?: {                  // Catalog item data
    name?: string
    title?: string
    description?: string
    image?: string
    color?: string
    materials?: string[]
    tags?: string[]
  }
}
```

---

## Authentication & Authorization

### Roles

| Role | Capabilities |
|------|-------------|
| `client` | Create storyboards, submit projects, view own dashboard |
| `pm` | View all projects, update status, reply to feedback, read-only users |
| `admin` | Full CRUD on projects, users, storyboards; set quotes; delete anything |

### Default Demo Accounts

On first load, `seedDemoData()` creates:

- `admin@chilliboys.mx` / `admin123` — Admin role
- `pm@chilliboys.mx` / `pm123` — PM role

**⚠️ Security Note:** Change these passwords immediately after first deployment, or remove `seedDemoData()` from `AuthProvider`.

---

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repo to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy — Vercel will run `npm run build` automatically

### Custom Domain

1. Add your domain in Vercel project settings
2. Configure DNS records as instructed by Vercel
3. The `metadataBase` in `app/layout.tsx` should match your domain for OG tags to resolve correctly

---

## Linting & Code Quality

### ESLint

Configured with `next/core-web-vitals`:

```bash
npm run lint
```

### TypeScript

```bash
npx tsc --noEmit
```

### Pre-build Checklist

```bash
npm run lint        # Should pass with no errors
npx tsc --noEmit    # Should pass with no errors
npm run build       # Should complete successfully
```

---

## Troubleshooting

### Build fails with "images.unoptimized"

Static export requires `images.unoptimized: true` in `next.config.js`. This is already configured.

### 500 errors on Supabase calls

- Verify RLS is disabled on all tables (required for anon-key client access)
- Check that `profiles` row exists for the authenticated user
- Check browser console for specific error messages

### Auth signup fails with 401

The `saveUser()` function uses raw `fetch` to `/auth/v1/signup` to avoid session conflicts. If this fails, it may be due to Supabase rate limiting.

### Storyboard canvas won't drag elements

The canvas uses refs for event handlers to avoid stale closures. If drag stops working, check that `window` event listeners are being registered (look for `isPanning || dragging` in `useEffect`).

### AI image generation hangs

Pollinations.ai requests timeout after 60 seconds. If generation is stuck, refresh and try again with a shorter prompt.

---

## License

© Chilli Boys Manufacturing. All rights reserved.
