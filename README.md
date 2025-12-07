# Flashclip
Multi-target application: **Flashclip**
Multi-target project built with AGL Code Generator.

**Targets:** mobile, web, backend, iot
## Quick Start

### Install Dependencies

```bash
bun install
```

### Development

- `bun run dev:mobile` - Start Expo development server
- `bun run dev:web` - Start React web development server
- `bun run dev:backend` - Start backend server

### Build

```bash
bun run build    # Build all packages
bun run build:all # Build all targets + packages
```

## Project Structure

```
Flashclip/
├── packages/
│   ├── types/              # Shared type definitions
│   └── api-client/         # Auto-generated API client
├── apps/
│   ├── mobile/             # Expo app
│   ├── web/                # React + Vite app
│   └── backend/            # Node.js backend
└── README.md
```

## Workspaces

This is a monorepo using Bun workspaces. All packages share dependencies via:
- `packages/types` - Shared TypeScript interfaces used across all targets
- `packages/api-client` - Auto-generated API client for mobile/web

## Generated

This project was generated using AGL Code Generator.
