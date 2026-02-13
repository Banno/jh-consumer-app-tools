<!--
SPDX-FileCopyrightText: 2025 Jack Henry

SPDX-License-Identifier: Apache-2.0
-->

# @jack-henry/consumer-tools

A collection of Vite plugins and web components designed to help build consumer-facing oauth applications within the Jack Henry ecosystem.

## Overview

This package provides essential tools for developing consumer applications including:

- **Vite Plugins** for development and build-time configuration
- **Web Components** for consistent UI layouts
- **Authentication** utilities for OIDC integration

## Features

### Vite Plugins

- **Institution Assets Plugin** - Loads institution-specific assets and branding
- **Institution Theme Plugin** - Applies institution-specific CSS themes and design tokens
- **Consumer Layout Plugin** - Provides layout structure and routing configuration for consumer apps
- **Consumer Auth Plugin** - Handles OIDC authentication flow and API proxying

### Web Components

- **jh-consumer-layout** - A layout component that provides consistent structure for consumer applications
- **jh-consumer-nav** - Navigation component for consumer apps

## Installation

```bash
yarn add @jack-henry/consumer-tools
```

### Peer Dependencies

This package requires `openid-client` as a peer dependency for authentication features:

```bash
yarn add openid-client
```

## Usage

### Using Individual Plugins

```typescript
import { defineConfig } from 'vite';
import {
  institutionAssetsPlugin,
  institutionThemePlugin,
  consumerLayoutPlugin,
  consumerAuthPlugin,
} from '@jack-henry/consumer-tools/vite-plugins';

export default defineConfig({
  plugins: [
    institutionAssetsPlugin({ institutionId: 'your-institution-id' }),
    institutionThemePlugin({ institutionId: 'your-institution-id' }),
    consumerLayoutPlugin({
      rootTagName: 'your-app',
      institutionId: 'your-institution-id',
      routeConfigPath: './src/routing/route-config.ts', // Optional: path to your route configuration
    }),
    consumerAuthPlugin({
      apiBaseUrl: 'https://your-api-base-url.com',
      clientConfig: {
        client_id: 'your-client-id',
        client_secret: 'your-client-secret',
        grant_types: ['authorization_code'],
        response_types: ['code'],
        token_endpoint_auth_method: 'client_secret_post',
        redirect_uris: ['https://localhost:8445/auth/cb'],
      },
      // Optional: customize auth scope
      authScope: 'openid profile email https://api.banno.com/consumer/auth/offline_access',
      // Optional: customize API headers to copy
      apiHeadersToCopy: ['x-request-id'],
    }),
  ],
});
```

### Using the Combined Consumer Config

For convenience, you can use the default export which combines all consumer plugins:

```typescript
import { defineConfig } from 'vite';
import consumerConfig from '@jack-henry/consumer-tools/vite-plugins';

export default defineConfig({
  plugins: [
    ...consumerConfig({
      rootTagName: 'your-app',
      institutionId: 'your-institution-id',
      routeConfigPath: './src/routing/route-config.ts', // Optional: path to your route configuration
      auth: {
        apiBaseUrl: 'https://your-api-base-url.com',
        clientConfig: {
          client_id: 'your-client-id',
          client_secret: 'your-client-secret',
          grant_types: ['authorization_code'],
          response_types: ['code'],
          token_endpoint_auth_method: 'client_secret_post',
          redirect_uris: ['https://localhost:8445/auth/cb'],
        },
        // Optional: customize auth scope
        authScope: 'openid profile email https://api.banno.com/consumer/auth/offline_access',
        // Optional: customize API headers to copy
        apiHeadersToCopy: ['x-request-id'],
      },
    }),
  ],
});
```

### Using Web Components

```typescript
import '@jack-henry/consumer-tools/components/jh-consumer-layout';

// In your HTML or template
<jh-consumer-layout institutionId="your-institution-id">
  <!-- Your app content -->
</jh-consumer-layout>
```

## Contexts Provided by jh-consumer-layout

The `jh-consumer-layout` component provides three contexts using Lit's context API that child components can consume to access shared application state.

### User Context

Access the current user's authentication state and information.

**Import:**
```typescript
import { consume } from '@lit/context';
import { userContext, type UserContext } from '@jack-henry/consumer-tools/contexts/user';
```

**Usage in a Lit component:**
```typescript
@consume({ context: userContext, subscribe: true })
@property({ attribute: false })
user: UserContext;
```

**Interface:**
```typescript
interface UserContext {
  user: User | null;  // User object with profile information
  state: 'unauthenticated' | 'authenticated' | 'loading' | 'checking';
}

interface User {
  sub: string;                // User ID (subject)
  given_name: string;         // First name
  family_name: string;        // Last name
  name: string;               // Full name
  email: string;              // Email address
  nickname: string;           // Username/nickname
  picture: string;            // Profile picture URL
  preferred_username: string; // Preferred display name
  // ... additional OAuth user claims
}
```

**States:**
- `unauthenticated` - User is not logged in
- `loading` - Initial authentication check in progress
- `checking` - Re-validating authentication status
- `authenticated` - User is logged in and validated

### Institution Context

Access the current financial institution's configuration and branding.

**Import:**
```typescript
import { consume } from '@lit/context';
import { institutionContext, type InstitutionContext } from '@jack-henry/consumer-tools/contexts/institution';
```

**Usage in a Lit component:**
```typescript
@consume({ context: institutionContext, subscribe: true })
@property({ attribute: false })
institution: InstitutionContext;
```

**Interface:**
```typescript
interface InstitutionContext {
  institution: Institution | null;  // Institution configuration
  state: 'initial' | 'loading' | 'ready' | 'error';
}

interface Institution {
  // Branding
  name: string;
  logo: string;
  images: {
    logoUrl: string;
    faviconUrl: string;
    // ... additional branding images
  };

  // Features and abilities
  abilities: {
    billPay: boolean;
    mobileDeposit: boolean;
    cardControls: boolean;
    // ... many more feature flags
  };

  // Links and resources
  links: InstitutionLink[];

  // ... extensive configuration options
}
```

**States:**
- `initial` - Not yet loaded
- `loading` - Fetching institution data
- `ready` - Institution data loaded successfully
- `error` - Failed to load institution data

### Router Context

Access the router instance and route configuration.

**Import:**
```typescript
import { consume } from '@lit/context';
import { routerContext, type RouterContext } from '@jack-henry/consumer-tools/contexts/router';
```

**Usage in a Lit component:**
```typescript
@consume({ context: routerContext, subscribe: true })
@property({ attribute: false })
routerContext: RouterContext;
```

**Interface:**
```typescript
interface RouterContext {
  router: Router | null;      // Router instance for programmatic navigation
  config: RouteConfig | null; // Your application's route configuration
}
```

**Usage example:**
```typescript
// Navigate programmatically
this.routerContext.router.go('/dashboard');

// Access route configuration
const routes = this.routerContext.config;
```

### Complete Component Example

Here's a complete example of a component consuming all three contexts:

```typescript
import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { consume } from '@lit/context';
import { userContext, type UserContext } from '@jack-henry/consumer-tools/contexts/user';
import { institutionContext, type InstitutionContext } from '@jack-henry/consumer-tools/contexts/institution';
import { routerContext, type RouterContext } from '@jack-henry/consumer-tools/contexts/router';

@customElement('my-dashboard')
export class MyDashboard extends LitElement {
  @consume({ context: userContext, subscribe: true })
  @property({ attribute: false })
  user: UserContext;

  @consume({ context: institutionContext, subscribe: true })
  @property({ attribute: false })
  institution: InstitutionContext;

  @consume({ context: routerContext, subscribe: true })
  @property({ attribute: false })
  routerContext: RouterContext;

  render() {
    if (this.user.state !== 'authenticated') {
      return html`<p>Please log in</p>`;
    }

    return html`
      <h1>Welcome, ${this.user.user.given_name}!</h1>
      <p>Banking with ${this.institution.institution?.name}</p>
      <button @click=${() => this.routerContext.router.go('/settings')}>
        Go to Settings
      </button>
    `;
  }
}
```

> **Note:** `router.go` is used as an example of programmatic navigation, but that is only here for demonstration purposes. In most cases you should use `<a href="/settings">` for navigation to ensure proper accessibility, bookmarking, and expected web behavior.

## Consumer Auth Plugin Details

The Consumer Auth Plugin provides OIDC authentication functionality for consumer applications, handling the OAuth flow, token management, and API proxying for Banno consumer APIs.

### Configuration Options

#### `apiBaseUrl` (required)

The base URL for the API endpoints.

#### `clientConfig` (required)

The OIDC client configuration object containing:

- `client_id`: Your OIDC client ID
- `client_secret`: Your OIDC client secret
- `grant_types`: OAuth grant types (typically `['authorization_code']`)
- `response_types`: OAuth response types (typically `['code']`)
- `token_endpoint_auth_method`: Authentication method for token endpoint
- `redirect_uris`: Array of allowed redirect URIs

#### `authScope` (optional)

The OAuth scope to request. Defaults to:

```
'openid profile email https://api.banno.com/consumer/auth/offline_access https://api.banno.com/consumer/auth/accounts.readonly https://api.banno.com/consumer/auth/conversations.readonly'
```

#### `apiHeadersToCopy` (optional)

Array of HTTP headers to copy from API responses. Defaults to `['x-request-id']`.

### Endpoints

The plugin sets up the following endpoints:

- `/auth` - Initiates the OAuth flow
- `/auth/cb` - OAuth callback endpoint
- `/validate` - Returns current user information
- `/a/conversations/api/*` - Proxies to conversations API with authentication
- `/a/consumer/api/*` - Proxies to consumer API with authentication

### Authentication Flow

1. Navigate to `/auth` to start the OAuth flow
2. User is redirected to the OAuth provider
3. After successful authentication, user is redirected back to `/auth/cb`
4. The plugin stores the access token and redirects to `/`
5. Subsequent API calls are automatically authenticated

### ⚠️ Development vs Production

This plugin includes in-memory token storage which is **NOT suitable for production use**. For production applications, implement proper token storage mechanisms (database, secure session storage, etc.).

## Consumer Layout Plugin Details

The Consumer Layout Plugin provides layout structure and routing configuration for consumer applications by automatically wrapping your app's root element with the `jh-consumer-layout` web component.

### Configuration Options

#### `rootTagName` (required)

The name of your application's root custom element tag. The plugin will automatically wrap this element with `jh-consumer-layout`.

#### `institutionId` (required)

The institution ID that will be passed to both the layout component and your root application element.

#### `routeConfigPath` (optional)

Path to a route configuration file that exports routing information for your application. When provided, the plugin will:

1. Import the route configuration module
2. Wait for the `jh-consumer-layout` component to be defined
3. Automatically set the `routeConfig` property on the layout component

### Route Configuration

If you provide a `routeConfigPath`, your route configuration file should export a default object with your routing information:

```typescript
// src/routing/route-config.ts
export default {
  routes: [
    {
      path: '/',
      component: 'home-view',
      title: 'Home',
    },
    {
      path: '/profile',
      component: 'profile-view',
      title: 'Profile',
    },
  ],
};
```

The route configuration is automatically applied to the `jh-consumer-layout` component when the page loads, enabling navigation and routing functionality.

### HTML Transformation

The plugin performs the following transformations to your HTML:

1. **If your root tag exists**: Wraps it with `jh-consumer-layout`
2. **If no root tag found**: Creates both the layout wrapper and your root tag inside the `<body>`
3. **If route config provided**: Injects a module script that loads and applies the routing configuration

Example transformation:

```html
<!-- Before -->
<body>
  <your-app></your-app>
</body>

<!-- After -->
<body>
  <jh-consumer-layout institution-id="your-institution-id">
    <your-app institution-id="your-institution-id"></your-app>
  </jh-consumer-layout>

  <!-- If routeConfigPath is provided -->
  <script type="module">
    import routeConfig from './src/routing/route-config.ts';
    customElements.whenDefined('jh-consumer-layout').then(() => {
      const consumerLayout = document.querySelector('jh-consumer-layout');
      if (consumerLayout) {
        consumerLayout.routeConfig = routeConfig;
      }
    });
  </script>
</body>
```

## Available Exports

### Components

- `@jack-henry/consumer-tools/components/*` - Individual consumer application web components

### Vite Plugins

- `@jack-henry/consumer-tools/vite-plugins` - All Vite plugins and configurations

## Development

### Building

```bash
yarn build
```

### Testing

```bash
yarn test
```

### Development Mode

```bash
yarn dev
```

## Migration

If you're migrating from inline OIDC configuration to the consumer auth plugin, see the [Migration Guide](./vite-plugins/MIGRATION.md) for detailed instructions.

## License

UNLICENSED

## Repository

[GitHub - Banno/digital-ux](https://github.com/Banno/digital-ux)
