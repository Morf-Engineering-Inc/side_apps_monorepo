# Side Apps Monorepo

A monorepo optimized for AI copilot development, supporting multiple JavaScript/TypeScript projects, Python agents, and Docker containerization.

## 🏗️ Structure

```
side_apps_monorepo/
├── apps/                  # Full-stack applications
│   ├── example-app/       # Example Express.js API (port 3000)
│   ├── gospelstudy/       # Gospel study & scripture analysis (port 3001)
│   ├── policybillsapp/    # Policy & bills tracking (port 3002)
│   └── selfapp/           # Personal self-improvement tracking (port 3003)
├── packages/              # Shared libraries and utilities
│   └── shared-utils/      # Common utilities
├── agents/                # Python AI agents and scripts
│   └── example-agent/     # Example Python agent
├── docker/                # Docker configurations
│   ├── node/              # Node.js Dockerfiles
│   └── python/            # Python Dockerfiles
└── package.json           # Root workspace configuration
```

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- Python >= 3.9 (for agents)
- Docker (optional, for containerization)

### Quick Setup

```bash
# Clone the repository
git clone https://github.com/murffious/side_apps_monorepo.git
cd side_apps_monorepo

# Run automated setup
./scripts/setup.sh
```

### Manual Installation

```bash
# Install pnpm if you haven't already
npm install -g pnpm

# Install dependencies
pnpm install
```

## 📦 Applications

### React Applications (from CREAO.ai)

#### 🕊️ Gospel Study (Port 3001)

Scripture study and analysis application with AI-powered insights.

```bash
pnpm --filter gospelstudy dev
```

[View Documentation](apps/gospelstudy/README.md)

#### 🏛️ Policy Bills App (Port 3002)

Track and analyze legislative bills and policy documents.

```bash
pnpm --filter policybillsapp dev
```

[View Documentation](apps/policybillsapp/README.md)

#### 🎯 Self App (Port 3003)

Personal self-improvement and habit tracking application.

```bash
pnpm --filter selfapp dev
```

[View Documentation](apps/selfapp/README.md)

#### 🔧 Example App (Port 3000)

Simple Express.js API demonstrating monorepo structure.

```bash
pnpm --filter example-app dev
```

[View Documentation](apps/example-app/README.md)

### Workspaces

This monorepo uses pnpm workspaces to manage multiple packages:

- **apps/**: Independent applications (web apps, APIs, CLIs)
- **packages/**: Shared libraries used across apps
- **agents/**: Python-based AI agents and automation scripts

## 🛠️ Common Commands

```bash
# Run all apps in development mode
pnpm dev

# Build all packages and apps
pnpm build

# Run tests across all workspaces
pnpm test

# Lint all code
pnpm lint

# Format code with Prettier
pnpm format

# Clean all build artifacts and node_modules
pnpm clean
```

## 📝 Working with Individual Workspaces

```bash
# Run commands in a specific workspace
pnpm --filter example-app dev
pnpm --filter shared-utils test

# Add a dependency to a specific workspace
pnpm --filter example-app add express

# Add a dev dependency to a specific workspace
pnpm --filter shared-utils add -D jest
```

## 🐍 Python Agents

Python agents are located in the `agents/` directory. Each agent has its own virtual environment:

```bash
# Navigate to an agent
cd agents/example-agent

# Create virtual environment
python -m venv venv

# Activate virtual environment
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the agent
python main.py
```

## 🐳 Docker

Docker configurations are organized in the `docker/` directory:

```bash
# Build and run a Node.js app
docker build -f docker/node/Dockerfile -t my-node-app .
docker run -p 3000:3000 my-node-app

# Build and run a Python agent
docker build -f docker/python/Dockerfile -t my-python-agent .
docker run my-python-agent
```

## 🔄 CREAO.ai Migration

Three applications (gospelstudy, policybillsapp, selfapp) were migrated from the CREAO.ai platform to run standalone:

### What Was Changed

- ✅ Removed CREAO.ai-specific URL parsing and routing
- ✅ Replaced CREAO.ai authentication with standalone stub for local development
- ✅ Updated package.json with unique names and ports (3001-3003)
- ✅ Configured for standalone development mode
- ✅ Preserved all original functionality and components

### Original Files

Original CREAO.ai integration files are backed up as `*.creao.bak` and `*.creao.ts.bak` in case you need to reference the original implementation.

### Running Standalone

Each app now runs independently without CREAO.ai platform dependencies:

```bash
# All apps run on different ports to avoid conflicts
pnpm --filter gospelstudy dev      # Port 3001
pnpm --filter policybillsapp dev   # Port 3002
pnpm --filter selfapp dev          # Port 3003
```

## 🤖 AI Copilot Optimization

This monorepo is structured to work seamlessly with AI coding assistants:

- **Clear structure**: Organized directories make it easy for AI to navigate
- **Consistent patterns**: Standardized configurations across projects
- **Comprehensive docs**: Each package includes its own README
- **Type safety**: TypeScript support for better AI code suggestions
- **Modular design**: Isolated workspaces prevent cross-contamination

## 📚 Adding New Projects

### Adding a New JavaScript/TypeScript App

```bash
mkdir apps/my-new-app
cd apps/my-new-app
pnpm init
```

Then update the `package.json` with appropriate scripts and dependencies.

### Adding a New Shared Package

```bash
mkdir packages/my-package
cd packages/my-package
pnpm init
```

### Adding a New Python Agent

```bash
mkdir agents/my-agent
cd agents/my-agent
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

## 🔧 Configuration Files

- `package.json`: Root package configuration
- `pnpm-workspace.yaml`: Workspace definitions
- `.prettierrc`: Code formatting rules
- `.gitignore`: Files to ignore in git
- `tsconfig.json`: TypeScript configuration (per-project)

## 📚 Documentation

Comprehensive guides available in the [`docs/`](./docs) directory:

- **[Certificate Verification](./docs/CERTIFICATE_VERIFICATION.md)** - Guide for validating ACM certificates
- **[Namecheap DNS Setup](./docs/NAMECHEAP_DNS_SETUP.md)** - Quick DNS configuration reference
- **[Custom Domain Setup](./docs/CUSTOM_DOMAIN_SETUP.md)** - Complete domain configuration guide
- **[Cognito Setup](./docs/COGNITO_SETUP.md)** - Authentication configuration
- **[Stripe Setup](./docs/STRIPE_SETUP.md)** - Payment processing and subscription configuration
- **[Terraform Infrastructure](./terraform/README.md)** - Infrastructure deployment guide

See the [Documentation Index](./docs/README.md) for a complete list.

## 📄 License

MIT
