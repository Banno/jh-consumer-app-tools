// SPDX-FileCopyrightText: 2025 Jack Henry
//
// SPDX-License-Identifier: Apache-2.0

import {
  Issuer,
  custom,
  generators,
  AuthorizationParameters,
  TokenSet,
  ClientAuthMethod,
  type Client,
} from 'openid-client';
import { ViteDevServer, Plugin } from 'vite';
import { IncomingMessage, ServerResponse } from 'http';

export interface ConsumerAuthOptions {
  apiBaseUrl: string;
  clientConfig: {
    client_id: string;
    client_secret: string;
    grant_types?: string[];
    response_types?: string[];
    token_endpoint_auth_method?: ClientAuthMethod;
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

  let client: Client;
  let code_verifier: string;
  let code_challenge: string;
  let authConfig: AuthorizationParameters;

  // This example project doesn't include any storage mechanism(e.g. a database) for access tokens.
  // Therefore, we use this as our 'storage' for the purposes of this example.
  // This method is NOT recommended for use in production systems.
  let accessToken: TokenSet;

  /** Check whether the user is authenticated, and refresh access token if necessary. If token cannot be refreshed, return 401. */
  const checkAuth = async (req: IncomingMessage, res: ServerResponse, next: (err?: any) => void) => {
    if (!accessToken || !accessToken.access_token) {
      res.statusCode = 401;
      res.end();
      return;
    }

    const expired = accessToken.expired();
    if (expired && accessToken.refresh_token) {
      try {
        accessToken = await client.refresh(accessToken.refresh_token);
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
      const issuer = await Issuer.discover(`${apiBaseUrl}/a/consumer/api/v0/oidc`);
      client = new issuer.Client(clientConfig);
      client[custom.clock_tolerance] = 300; // to allow a 5 minute clock skew for verification

      code_verifier = generators.codeVerifier();
      code_challenge = generators.codeChallenge(code_verifier);

      authConfig = {
        scope: authScope,
        resource: apiBaseUrl,
        code_challenge,
        code_challenge_method: 'S256',
        claims: {
          id_token: {
            'https://api.banno.com/consumer/claim/institution_details': null,
          },
        },
      };

      // Auth callback handler
      server.middlewares.use(
        '/auth/cb',
        async (req: IncomingMessage, res: ServerResponse, next: (err?: any) => void) => {
          const params = client.callbackParams(req);
          if (!params.code) {
            // initiate the auth flow in sso mode
            const authUrl = client.authorizationUrl(authConfig);
            res.statusCode = 302;
            res.setHeader('Location', authUrl);
            res.end();
          }
          try {
            const tokenSet = await client.callback(
              clientConfig.redirect_uris && clientConfig.redirect_uris[0],
              params,
              {
                code_verifier,
              },
            );
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
        const authUrl = client.authorizationUrl(authConfig);
        res.statusCode = 302;
        res.setHeader('Location', authUrl);
        res.end();
      });

      // User validation endpoint
      server.middlewares.use('/validate', checkAuth);
      server.middlewares.use(
        '/validate',
        async (req: IncomingMessage, res: ServerResponse, next: (err?: any) => void) => {
          try {
            const user = await client.userinfo(accessToken);
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
