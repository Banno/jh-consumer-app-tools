<!--
SPDX-FileCopyrightText: 2025 Jack Henry

SPDX-License-Identifier: Apache-2.0
-->

# JH Consumer App Tools

A monorepo containing tools and libraries for building consumer-facing applications within the Jack Henry ecosystem. This repository provides everything needed to quickly scaffold and develop consumer applications with integrated authentication, theming, and layout components.

## Packages

### [@jack-henry/consumer-tools](./projects/jh-consumer-tools)

A comprehensive toolkit providing Vite plugins and web components for consumer application development.

**Key Features:**
- 🔌 **Vite Plugins** for institution branding, theming, layout, and OIDC authentication
- 🧩 **Web Components** for consistent UI layouts and navigation
- 🔐 **Authentication** utilities with OAuth/OIDC integration
- 🎨 **Theming** support for institution-specific styling

[View Documentation →](./projects/jh-consumer-tools/README.md)

### [@jack-henry/create-consumer-app](./projects/create-consumer-app)

A CLI tool for scaffolding new consumer applications with pre-configured settings.

**Key Features:**
- 🚀 **Quick Setup** with interactive prompts
- 📦 **Package Manager Support** for npm, yarn v1, and yarn v4
- 🔒 **SSL Certificates** automatically generated for local development
- ⚙️ **Pre-configured** with @jack-henry/consumer-tools integration

[View Documentation →](./projects/create-consumer-app/README.md)

## Quick Start

### Creating a New Consumer Application

Use the CLI tool to generate a new project:

```bash
# npm
npm create @jack-henry/consumer-app my-app

# yarn
yarn create @jack-henry/consumer-app my-app

# pnpm
pnpm create @jack-henry/consumer-app my-app
```

The CLI will guide you through configuration including institution ID, OIDC credentials, and API endpoints.

### Adding to an Existing Project

Install the consumer tools package:

```bash
yarn add @jack-henry/consumer-tools openid-client
```

Configure your `vite.config.ts`:

```typescript
import { defineConfig } from 'vite';
import consumerConfig from '@jack-henry/consumer-tools/vite-plugins';

export default defineConfig({
  plugins: [
    ...consumerConfig({
      rootTagName: 'my-app',
      institutionId: 'your-institution-id',
      routeConfigPath: './src/routing/route-config.ts',
      auth: {
        apiBaseUrl: 'https://your-api-base-url.com',
        clientConfig: {
          client_id: 'your-client-id',
          client_secret: 'your-client-secret',
          // ... additional OIDC config
        },
      },
    }),
  ],
});
```

## Development

This is a Lerna monorepo using Yarn workspaces.

### Prerequisites

- Node.js 18+
- Yarn

### Setup

```bash
# Install dependencies
yarn install

# Build all packages
yarn build

# Run type checking
yarn typecheck

# Format code
yarn format
```

### Project Structure

```
jh-consumer-app-tools/
├── projects/
│   ├── create-consumer-app/       # CLI scaffolding tool
│   │   ├── bin/                   # CLI entry point
│   │   ├── example-consumer-app/  # Template project
│   │   └── src/                   # Generator logic
│   └── jh-consumer-tools/         # Core library
│       ├── components/            # Web components
│       ├── vite-plugins/          # Vite plugins
│       ├── contexts/              # Shared contexts
│       ├── controllers/           # Application controllers
│       └── utils/                 # Utility functions
└── package.json                   # Root package config
```

## Publishing

Releases are managed with Lerna:

```bash
yarn release
```

This will:
- Version bump packages based on conventional commits
- Generate changelogs
- Create GitHub releases
- Publish to the configured registry

## Contributing

This repository follows conventional commits for automated versioning and changelog generation.

### Commit Message Format

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
**Scopes:** `consumer-tools`, `create-consumer-app`

## License

Licensed under the Apache License, Version 2.0. See individual packages for additional licensing information.

## Repository

[GitHub - Banno/jh-consumer-app-tools](https://github.com/Banno/digital-ux)

