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
  jhThemePlugin,
  consumerLayoutPlugin,
  consumerAuthPlugin,
} from '@jack-henry/consumer-tools/vite-plugins';

export default defineConfig({
  plugins: [
    institutionAssetsPlugin({ institutionId: 'your-institution-id' }),
    jhThemePlugin({ institutionId: 'your-institution-id' }),
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
