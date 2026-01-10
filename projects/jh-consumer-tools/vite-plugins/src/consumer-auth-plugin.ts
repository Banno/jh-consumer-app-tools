// SPDX-FileCopyrightText: 2025 Jack Henry
//
// SPDX-License-Identifier: Apache-2.0

import * as client from 'openid-client';
import { ViteDevServer, Plugin } from 'vite';
import { IncomingMessage, ServerResponse } from 'http';

export interface ConsumerAuthOptions {
  apiBaseUrl: string;
  clientConfig: {
    client_id: string;
    client_secret: string;
    grant_types?: string[];
    response_types?: string[];
    token_endpoint_auth_method?: string;
    redirect_uris?: string[];
  };
  authScope?: string;
  apiHeadersToCopy?: string[];
}

interface CustomIncomingMessage extends IncomingMessage {
  originalUrl: string;
}

const defaultAuthScope =
  'openid profile email https://api.banno.com/consumer/auth/offline_access https://api.banno.com/consumer/auth/user.profile.readonly';

export default function consumerAuthPlugin(options: ConsumerAuthOptions): Plugin {
  const {
    apiBaseUrl,
    clientConfig,
    authScope = options.authScope ? `${options.authScope} ${defaultAuthScope}` : defaultAuthScope,
    apiHeadersToCopy = ['x-request-id'],
  } = options;

  let config: client.Configuration;
  let code_verifier: string;
  let code_challenge: string;
  let authorizationUrl: URL;

  // This example project doesn't include any storage mechanism(e.g. a database) for access tokens.
  // Therefore, we use this as our 'storage' for the purposes of this example.
  // This method is NOT recommended for use in production systems.
  let accessToken: client.TokenEndpointResponse | null = null;

  /** Check whether the user is authenticated, and refresh access token if necessary. If token cannot be refreshed, return 401. */
  const checkAuth = async (req: IncomingMessage, res: ServerResponse, next: (err?: any) => void) => {
    if (!accessToken || !accessToken.access_token) {
      res.statusCode = 401;
      res.end();
      return;
    }

    const now = Math.floor(Date.now() / 1000);
    const expiresAt = typeof accessToken.expires_at === 'number' ? accessToken.expires_at : 0;
    const expired = expiresAt ? now >= expiresAt : false;
    if (expired && accessToken.refresh_token) {
      try {
        accessToken = await client.refreshTokenGrant(config, accessToken.refresh_token);
      } catch (err) {
        res.statusCode = 401;
        res.end();
        return;
      }
    }

    next();
  };

  /** Basic API proxy */
  const apiHandler = async (req: IncomingMessage, res: ServerResponse, next: (err?: any) => void) => {
    const request = req as CustomIncomingMessage;
    const apiResponse = await fetch(`${apiBaseUrl}${request.originalUrl}`, {
      method: 'get',
      headers: { Authorization: `Bearer ${accessToken.access_token}` },
    });
    // @ts-expect-error
    (Array.from(apiResponse.headers) as Array<Array<string>>).forEach(([key, value]) => {
      if (apiHeadersToCopy.includes(key.toLowerCase())) {
        res.setHeader(key, value);
      }
    });

    res.statusCode = apiResponse.status;
    if (apiResponse.status >= 200 && apiResponse.status < 300) {
      const data = await apiResponse.json();
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(data));
    } else {
      const body = await apiResponse.text();
      res.end(body);
    }
  };

  return {
    name: 'consumer-auth-plugin',
    config(config, env) {
      config.define = config.define || {};
      // Define the CLIENT_ID constant
      config.define.CLIENT_ID = JSON.stringify(options.clientConfig.client_id);
    },
    async configureServer(server: ViteDevServer) {
      // Initialize OIDC client
      const issuerUrl = new URL(`${apiBaseUrl}/a/consumer/api/v0/oidc`);
      config = await client.discovery(issuerUrl, clientConfig.client_id, clientConfig.client_secret);
      code_verifier = client.randomPKCECodeVerifier();
      code_challenge = await client.calculatePKCECodeChallenge(code_verifier);

      const redirect_uri = clientConfig.redirect_uris?.[0] || 'https://localhost:3000/auth/cb';

      authorizationUrl = client.buildAuthorizationUrl(config, {
        redirect_uri,
        scope: authScope,
        code_challenge,
        code_challenge_method: 'S256',
        claims: JSON.stringify({
          id_token: {
            'https://api.banno.com/consumer/claim/institution_details': null,
          },
        }),
      });

      // Auth callback handler
      server.middlewares.use(
        '/auth/cb',
        async (req: IncomingMessage, res: ServerResponse, next: (err?: any) => void) => {
          const params = new URL(`http://localhost${req.url}`).searchParams;
          const code = params.get('code');

          if (!code) {
            // initiate the auth flow in sso mode
            res.statusCode = 302;
            res.setHeader('Location', authorizationUrl.href);
            res.end();
            return;
          }

          try {
            // Construct the full callback URL using the registered redirect_uri
            const callbackUrl = new URL(redirect_uri);
            callbackUrl.search = new URL(`http://localhost${req.url}`).search;

            const tokenSet = await client.authorizationCodeGrant(config, callbackUrl, {
              pkceCodeVerifier: code_verifier,
              idTokenExpected: true,
            });

            if (tokenSet.id_token) {
              const [header, payload, signature] = tokenSet.id_token.split('.');
              if (payload) {
                const decodedPayload = JSON.parse(Buffer.from(payload, 'base64').toString('utf8'));
                console.log('Decoded id_token payload:', decodedPayload);
              }
            }
            accessToken = tokenSet;

            res.statusCode = 302;
            res.setHeader('Location', '/');
            res.end();
          } catch (err) {
            console.error(err);
            res.statusCode = 401;
            res.end();
          }
        },
      );

      // Auth initiation handler when running standalone
      server.middlewares.use('/auth', (req: IncomingMessage, res: ServerResponse, next: (err?: any) => void) => {
        res.statusCode = 302;
        res.setHeader('Location', authorizationUrl.href);
        res.end();
      });

      // User validation endpoint
      server.middlewares.use('/validate', checkAuth);
      server.middlewares.use(
        '/validate',
        async (req: IncomingMessage, res: ServerResponse, next: (err?: any) => void) => {
          try {
            const user = await client.fetchUserInfo(config, accessToken!.access_token!, client.skipSubjectCheck);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(user));
          } catch (e) {
            console.log('error validating user', e);
            res.statusCode = 401;
            res.end();
          }
        },
      );

      server.middlewares.use('/logout', (req: IncomingMessage, res: ServerResponse, next: (err?: any) => void) => {
        // Handle logout
        accessToken = null;
        res.statusCode = 302;
        res.setHeader('Location', `${apiBaseUrl}/logout`);
        res.end();
      });

      // API proxy handlers
      server.middlewares.use('/a/conversations/api', checkAuth);
      server.middlewares.use('/a/conversations/api', apiHandler);
      server.middlewares.use('/a/consumer/api', checkAuth);
      server.middlewares.use('/a/consumer/api', apiHandler);
      server.middlewares.use('/api', checkAuth);
      server.middlewares.use('/api', apiHandler);
    },
  };
}
