# Chilli Boys Manufacturing — Plan Portal

Client portal for [Chilli Boys Manufacturing](https://chilliboys.mx), a custom metalwork and fabrication shop in El Pescadero, Baja California Sur, Mexico.

**Live URL:** https://plan.chilliboys.mx

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
