<!--
SPDX-FileCopyrightText: 2025 Jack Henry

SPDX-License-Identifier: Apache-2.0
-->

# example-consumer-app

A consumer banking application built with [Lit](https://lit.dev) web components and Jack Henry's consumer tools.

## Getting Started

This project was created using `@jack-henry/create-consumer-app`. Your authentication configuration has been set up based on the credentials you provided during setup.

### Prerequisites

- Node.js (Latest LTS version recommended)
- Package manager: npm or yarn

### Development

Start the development server:

```bash
npm run dev
# or
yarn dev
```

The app will run at `https://localhost:8445` using HTTPS with self-signed SSL certificates. Your browser may show a security warning on first visit - this is expected for local development.

### Build

Create a production build:

```bash
npm run build
# or
yarn build
```

The built files will be in the `dist/` directory.

### Preview

Preview the production build locally:

```bash
npm run preview
# or
yarn preview
```

## Configuration

Your authentication and institution configuration is managed through environment variables and Vite configuration:

### .env

Contains all configuration values including sensitive credentials that should never be committed to version control:

```
INSTITUTION_ID=your-institution-id
CLIENT_ID=your-client-id
CLIENT_SECRET=your-client-secret
API_URL=https://your-domain.banno.com
REDIRECT_URIS=["https://localhost:8445/auth/cb"]
```

**Important**: The `.env` file is automatically added to `.gitignore` to protect your credentials.

**Note**: These environment variables do not use the `VITE_` prefix because they are only used in the Vite configuration and are never exposed to client code. This is more secure than using the `VITE_` prefix, which would make them accessible in the browser bundle.

### vite.config.ts

Reads configuration from environment variables and passes them to the consumer tools plugins:

- **Institution ID**: Your financial institution's unique identifier
- **Client ID**: OAuth client identifier for your application
- **API Base URL**: Your Banno Online domain
- **Redirect URIs**: Authorized callback URLs for OAuth flow

Example:
```typescript
consumerPlugins({
  rootTagName: 'example-consumer-app',
  institutionId: env.INSTITUTION_ID,
  onlineDomain: 'your-domain.banno.com',
  auth: {
    apiBaseUrl: env.API_URL,
    clientConfig: {
      client_id: env.CLIENT_ID,
      client_secret: env.CLIENT_SECRET,
      redirect_uris: ['https://localhost:8445/auth/cb'],
      // ...
    },
  },
})
```

## Project Structure

```
├── src/
│   ├── example-consumer-app.ts  # Main app component
│   ├── components/              # Your custom components
│   └── routing/                 # Route configuration
├── index.html                   # Entry HTML file
├── vite.config.ts              # Vite and consumer tools config
├── .env                        # Environment variables (not committed)
└── certs/                      # SSL certificates for local HTTPS
```

## Accessing Application State

The `jh-consumer-layout` component provides three contexts that your components can consume to access shared application state:

### Available Contexts

1. **[User Context](https://github.com/Banno/jh-consumer-app-tools/tree/main/projects/jh-consumer-tools#user-context)** - Access current user information and authentication state
   - User profile (name, email, etc.)
   - Authentication status (`authenticated`, `unauthenticated`, `loading`, `checking`)

2. **[Institution Context](https://github.com/Banno/jh-consumer-app-tools/tree/main/projects/jh-consumer-tools#institution-context)** - Access institution configuration and branding
   - Institution name, logo, and imagery
   - Feature flags and abilities
   - Custom links and resources

3. **[Router Context](https://github.com/Banno/jh-consumer-app-tools/tree/main/projects/jh-consumer-tools#router-context)** - Access routing functionality
   - Router instance for programmatic navigation
   - Route configuration

### Quick Example

```typescript
import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { consume } from '@lit/context';
import { userContext, type UserContext } from '@jack-henry/consumer-tools/contexts/user';

@customElement('my-component')
export class MyComponent extends LitElement {
  @consume({ context: userContext, subscribe: true })
  @property({ attribute: false })
  user: UserContext;

  render() {
    return html`
      <h1>Welcome, ${this.user.user?.given_name}!</h1>
    `;
  }
}
```

See the [Consumer Tools documentation](https://github.com/Banno/jh-consumer-app-tools/tree/main/projects/jh-consumer-tools#contexts-provided-by-jh-consumer-layout) for complete usage examples.

## Authentication Flow

This app uses OAuth 2.0 authorization code flow:

1. User navigates to the app
2. App redirects to your Jack Henry online banking application for authentication
3. User logs in at their financial institution
4. Jack Henry online banking application redirects back to your app with an authorization code
5. App exchanges code for access token
6. App can now make authenticated API requests

The consumer tools library handles this flow automatically.

## Modifying Configuration

If you need to update your OAuth client or institution configuration, all values are stored in the `.env` file:

1. Open the `.env` file in your project root
2. Update any of the following variables:
   - `INSTITUTION_ID` - Your financial institution's unique identifier
   - `CLIENT_ID` - OAuth client identifier
   - `CLIENT_SECRET` - OAuth client secret
   - `API_URL` - Your Banno Online domain
   - `REDIRECT_URIS` - Authorized callback URLs (JSON array format)
3. Restart the development server for changes to take effect

**Note**: These values are only used in `vite.config.ts` during build/dev and are never exposed to client code.

## Learn More

- [Jack Henry Consumer Tools Documentation](https://github.com/Banno/jh-consumer-app-tools)
- [Lit Documentation](https://lit.dev)
- [Vite Documentation](https://vite.dev)
- [Jack Henry Design System](https://jackhenry.design/v2/)
- [Jack Henry Developer Portal](https://jackhenry.dev)

## Support

For questions or issues with authentication setup, contact your Jack Henry implementation provider.

