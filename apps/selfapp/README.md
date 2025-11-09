# Self App

Things that matter the most  
Priority décisions

ACT or be acted upon
Motives?
What motives did I have ?
Took me years to know this mknwo myself rad my own feelings. Almost scary — how cu intense effort.

A React application for personal self-improvement and tracking, originally built on CREAO.ai platform.

## Description

This app provides tools for personal development, habit tracking, and self-improvement metrics.

## Features

- Personal tracking and analytics
- Goal setting and monitoring
- Habit tracking
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
pnpm --filter selfapp dev

# Or from this directory
pnpm install
pnpm dev
```

The app will be available at `http://localhost:3003`

## Build

```bash
pnpm build
```

Built files will be in the `dist/` directory.

## Scripts

- `pnpm dev` - Start development server on port 3003
- `pnpm build` - Build for production
- `pnpm serve` - Preview production build
- `pnpm test` - Run tests
- `pnpm check` - Run type checking and linting
- `pnpm format` - Format code with Biome

## Project Structure

```
selfapp/
├── src/
│   ├── components/     # React components
│   ├── contexts/       # React contexts
│   ├── data/           # Data files
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
- Changed dev port to 3003 to avoid conflicts

The original CREAO.ai integration files are backed up as `*.creao.bak` files.

## Environment Variables

Create a `.env.local` file for local configuration:

```env
# API Configuration
VITE_API_URL=https://your-api-gateway-url.execute-api.us-east-1.amazonaws.com

# Cognito Configuration (optional for local dev)
VITE_COGNITO_USER_POOL_ID=us-east-1_xxxxxxxxx
VITE_COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_COGNITO_DOMAIN=your-domain.auth.us-east-1.amazoncognito.com

# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxxxxxxxxxxxxx
VITE_STRIPE_PRICE_MONTHLY=price_1xxxxxxxxxxxxxxxxxxxxxxxxx
VITE_STRIPE_PRICE_YEARLY=price_1xxxxxxxxxxxxxxxxxxxxxxxxx
VITE_STRIPE_PRICE_LIFETIME=price_1xxxxxxxxxxxxxxxxxxxxxxxxx
```

### Setting up Stripe

1. Create a Stripe account at https://stripe.com
2. Create products and prices in the Stripe Dashboard
3. Copy the Price IDs (they start with `price_1...`)
4. Add the Price IDs to your environment variables or GitHub Secrets
5. Configure the following GitHub Secrets for deployment:
   - `STRIPE_LIVE_SECRET_KEY` - Stripe secret key (sk_live_...)
   - `STRIPE_LIVE_PUBLIC_KEY` - Stripe publishable key (pk_live_...)
   - `STRIPE_WEBHOOK_SECRET` - Stripe webhook signing secret
   - `STRIPE_PRICE_MONTHLY` - Monthly subscription Price ID
   - `STRIPE_PRICE_YEARLY` - Yearly subscription Price ID
   - `STRIPE_PRICE_LIFETIME` - Lifetime subscription Price ID
   - `STRIPE_ACCT_ID` - Stripe account ID (optional)

### Price Configuration

The pricing page supports three subscription tiers:
- **Monthly**: $4.99/month
- **Yearly**: $44/year (26% savings)
- **Lifetime**: $175 one-time payment

Update the prices in `src/routes/pricing.tsx` if you need different pricing.

## Contributing

See the main repository [CONTRIBUTING.md](../../CONTRIBUTING.md) for guidelines.

## License

MIT
