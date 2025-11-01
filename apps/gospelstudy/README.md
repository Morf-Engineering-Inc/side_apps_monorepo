# Gospel Study App

A React application for scripture study and analysis, originally built on CREAO.ai platform.

## Description

This app provides tools for studying and analyzing gospel scriptures with modern UI components.

## Features

- Scripture reading and study tools
- Analysis and note-taking capabilities
- Modern, responsive UI with Radix UI components
- TypeScript for type safety
- Vite for fast development

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **TanStack Router** - Routing
- **TanStack Query** - Data fetching
- **Radix UI** - UI components
- **Tailwind CSS** - Styling (via styles.css)
- **Biome** - Formatting and linting

## Development

```bash
# From repository root
pnpm install

# Run this app
pnpm --filter gospelstudy dev

# Or from this directory
pnpm install
pnpm dev
```

The app will be available at `http://localhost:3001`

## Build

```bash
pnpm build
```

Built files will be in the `dist/` directory.

## Scripts

- `pnpm dev` - Start development server on port 3001
- `pnpm build` - Build for production
- `pnpm serve` - Preview production build
- `pnpm test` - Run tests
- `pnpm check` - Run type checking and linting
- `pnpm format` - Format code with Biome

## Project Structure

```
gospelstudy/
├── src/
│   ├── components/     # React components
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utility libraries
│   ├── routes/         # Route components
│   ├── types/          # TypeScript types
│   ├── main.tsx        # App entry point
│   └── styles.css      # Global styles
├── config/             # Configuration files
├── public/             # Static assets
└── package.json        # Dependencies and scripts
```

## Adapting from CREAO.ai

This app has been adapted to run standalone outside of CREAO.ai:
- Removed CREAO.ai-specific URL parsing
- Replaced authentication with standalone stub
- Updated package.json for monorepo
- Changed dev port to 3001 to avoid conflicts

The original CREAO.ai integration files are backed up as `*.creao.bak` files.

## Environment Variables

Create a `.env.local` file for local configuration:

```env
VITE_API_BASE_PATH=http://localhost:3000/api
```

## Contributing

See the main repository [CONTRIBUTING.md](../../CONTRIBUTING.md) for guidelines.

## License

MIT
