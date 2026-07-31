# MapISR

**Ironstate Railroad Operations** — A live railroad operations viewer.

MapISR combines Google Maps, an operations dashboard, automatic train scheduling, and a persistent railroad asset database. Viewers watch operations; administrators manage data, schedules, and assets. Trains run automatically — this is not a dispatching or CTC simulator.

## Tech Stack

- React 18 + TypeScript (strict)
- Vite
- Tailwind CSS
- React Router
- Zustand (state + persistence)
- Google Maps JavaScript API (`@react-google-maps/api`)
- Lucide React

## Getting Started

### Prerequisites

- Node.js 18+
- Google Maps JavaScript API key with Maps JavaScript API enabled

### Setup

```bash
npm install
```

Copy environment variables:

```bash
cp .env.example .env
```

Set your Google Maps API key in `.env`:

```
VITE_GOOGLE_MAPS_API_KEY=your_key_here
```

### Development

```bash
npm run dev
```

### Production Build

```bash
npm run build
npm run preview
```

## Authentication

| Role | Password | Access |
|------|----------|--------|
| Administrator | `donut` | Full access |
| Viewer | `railfan`, `dispatcher`, `freight`, `mainline`, `cabride` | Read-only |

Admin pages (Schedules, Locomotives, Settings, Admin) are hidden from viewers.

## Project Structure

```
src/
├── assets/           # Static assets
├── components/       # Reusable UI components
│   ├── ui/           # Button, Card, Modal, etc.
│   ├── layout/       # Sidebar, Header, Search
│   └── map/          # Map components
├── config/           # App constants, auth config
├── hooks/            # Custom React hooks
├── layouts/          # Page layouts
├── pages/            # Route pages
├── services/         # Business logic (no UI)
│   ├── scheduler/    # Automatic train system
│   ├── train/        # Train operations
│   ├── locomotive/   # Locomotive pool
│   ├── map/          # KMZ parsing
│   ├── timeline/     # Event logging
│   └── storage/      # LocalStorage helpers
├── stores/           # Zustand state stores
├── styles/           # Global CSS
├── types/            # TypeScript interfaces
└── utils/            # Pure utility functions
```

## Features

- **Live Map** — Renders KMZ from `public/data/railroad.kmz` with layer toggles
- **Automatic Trains** — Scheduler spawns, moves, and completes trains from schedules
- **Locomotive Pool** — Permanent roster with range generation and assignment validation
- **Power Moves** — Auto-created when locomotives need repositioning
- **Dashboard** — Active trains, upcoming departures, system health
- **Global Search** — Trains, locomotives, yards, stations (Ctrl+K)
- **Timeline** — Permanent chronological operations log
- **Persistence** — LocalStorage for all railroad data

## Assets

- `public/data/railroad.kmz` — Ironstate Railroad network map
- `public/assets/logo-full.png` — Full logo
- `public/assets/logo-bell.png` — Bell icon

## Architecture Notes

Business logic lives in `services/`, never in UI components. Zustand stores orchestrate state; services contain pure operations. The scheduler runs on a 1-second interval and updates train positions every 2 seconds.

Designed for future expansion: rolling stock, signals, track occupancy, cloud sync, mobile support, and AI-generated traffic can be added without major refactoring.

## License

Proprietary — Ironstate Railroad
