# TasteID

A minimalist, visual-first social network for curators of personal taste.

## Features

- **3x3 Collection Grid**: Showcase your favorite movies, music, games, anime, and books
- **Tinder-Style Swiper**: Discover and save content from other profiles
- **Customizable Profiles**: Accent colors and background textures
- **TMDB Integration**: Search and add movies/TV shows

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Animations**: Framer Motion
- **State**: Zustand
- **Database**: Prisma ORM (SQLite for dev, PostgreSQL for prod)
- **Auth**: NextAuth.js (coming soon)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your TMDB API key

# Generate Prisma client
npx prisma generate

# Create database
npx prisma db push

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Demo Profile

Visit [http://localhost:3000/profile/demo](http://localhost:3000/profile/demo) to see a sample profile with the swiper interface.

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Database connection string |
| `NEXTAUTH_SECRET` | Secret for NextAuth.js |
| `TMDB_API_KEY` | TMDB API key for movie search |

## Project Structure

```
src/
├── app/                 # Next.js App Router pages
│   ├── page.tsx         # Landing page
│   └── profile/
│       └── demo/
│           └── page.tsx # Demo profile page
├── components/
│   ├── profile/         # Profile components (header, grid, cards)
│   ├── swiper/          # Swiper overlay components
│   └── search/          # Search modal components
├── stores/              # Zustand state stores
├── lib/                 # Utilities (TMDB client, demo data)
└── types/               # TypeScript type definitions
```

## License

MIT
