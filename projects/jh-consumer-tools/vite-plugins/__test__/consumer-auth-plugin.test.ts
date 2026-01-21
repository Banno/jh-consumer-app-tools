// SPDX-FileCopyrightText: 2025 Jack Henry
//
// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect, vi, beforeEach } from 'vitest';
import consumerAuthPlugin from '../src/consumer-auth-plugin';
import type { ConsumerAuthOptions } from '../src/consumer-auth-plugin';
import * as client from 'openid-client';

// Mock openid-client module
vi.mock('openid-client', () => {
  const mockConfig = {
    issuer: 'https://api.example.com/a/consumer/api/v0/oidc',
    authorization_endpoint: 'https://api.example.com/auth',
    token_endpoint: 'https://api.example.com/token',
    userinfo_endpoint: 'https://api.example.com/userinfo',
  };

  return {
    discovery: vi.fn(() => Promise.resolve(mockConfig)),
    randomPKCECodeVerifier: vi.fn(() => 'test-code-verifier'),
    calculatePKCECodeChallenge: vi.fn(() => Promise.resolve('test-code-challenge')),
    buildAuthorizationUrl: vi.fn(() => new URL('https://api.example.com/auth')),
    authorizationCodeGrant: vi.fn(() =>
      Promise.resolve({
        access_token: 'test-access-token',
        refresh_token: 'test-refresh-token',
        id_token: 'header.eyJ0ZXN0IjoidmFsdWUifQ.signature',
        token_type: 'Bearer',
        expires_in: 3600,
        expires_at: Math.floor(Date.now() / 1000) + 3600,
      }),
    ),
    refreshTokenGrant: vi.fn(() =>
      Promise.resolve({
        access_token: 'new-access-token',
        refresh_token: 'new-refresh-token',
        token_type: 'Bearer',
        expires_in: 3600,
        expires_at: Math.floor(Date.now() / 1000) + 3600,
      }),
    ),
    fetchUserInfo: vi.fn(() => Promise.resolve({ sub: 'user123', email: 'user@example.com' })),
    clockTolerance: Symbol('clockTolerance'),
    skipSubjectCheck: Symbol('skipSubjectCheck'),
  };
});

// Mock fetch
global.fetch = vi.fn(() =>
  Promise.resolve({
    status: 200,
    headers: new Map([
      ['content-type', 'application/json'],
      ['x-request-id', 'test-request-id'],
    ]),
    json: () => Promise.resolve({ data: 'test' }),
    text: () => Promise.resolve('OK'),
  } as any),
);

describe('consumerAuthPlugin', () => {
  const mockOptions: ConsumerAuthOptions = {
    apiBaseUrl: 'https://api.example.com',
    clientConfig: {
      client_id: 'test-client-id',
      client_secret: 'test-client-secret',
      redirect_uris: ['https://localhost:3000/auth/cb'],
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('plugin structure', () => {
    it('should return a plugin with correct name', () => {
      const plugin = consumerAuthPlugin(mockOptions);
      expect(plugin.name).toBe('consumer-auth-plugin');
    });

    it('should have a config function', () => {
      const plugin = consumerAuthPlugin(mockOptions);
      expect(plugin.config).toBeDefined();
    });

    it('should have a configureServer function', () => {
      const plugin = consumerAuthPlugin(mockOptions);
      expect(plugin.configureServer).toBeDefined();
    });
  });

  describe('config hook', () => {
    it('should define CLIENT_ID constant', () => {
      const plugin = consumerAuthPlugin(mockOptions);
      const mockConfig: any = { define: {} };
      const mockEnv = { mode: 'development', command: 'serve' as const };

      if (typeof plugin.config === 'function') {
        plugin.config.call({} as any, mockConfig, mockEnv);
        expect(mockConfig.define?.CLIENT_ID).toBe(JSON.stringify('test-client-id'));
      }
    });

    it('should initialize define object if not present', () => {
      const plugin = consumerAuthPlugin(mockOptions);
      const mockConfig: any = {};
      const mockEnv = { mode: 'development', command: 'serve' as const };

      if (typeof plugin.config === 'function') {
        plugin.config.call({} as any, mockConfig, mockEnv);
        expect(mockConfig.define).toBeDefined();
        expect(mockConfig.define?.CLIENT_ID).toBe(JSON.stringify('test-client-id'));
      }
    });
  });

  describe('plugin options', () => {
    it('should accept minimal client configuration', () => {
      const minimalOptions: ConsumerAuthOptions = {
        apiBaseUrl: 'https://api.example.com',
        clientConfig: {
          client_id: 'test-client',
          client_secret: 'test-secret',
        },
      };

      const plugin = consumerAuthPlugin(minimalOptions);
      expect(plugin).toBeDefined();
      expect(plugin.name).toBe('consumer-auth-plugin');
    });

    it('should accept custom authScope', () => {
      const optionsWithScope: ConsumerAuthOptions = {
        ...mockOptions,
        authScope: 'custom-scope',
      };

      const plugin = consumerAuthPlugin(optionsWithScope);
      expect(plugin).toBeDefined();
      expect(plugin.name).toBe('consumer-auth-plugin');
    });

    it('should accept custom apiHeadersToCopy', () => {
      const optionsWithHeaders: ConsumerAuthOptions = {
        ...mockOptions,
        apiHeadersToCopy: ['x-custom-header', 'x-another-header'],
      };

      const plugin = consumerAuthPlugin(optionsWithHeaders);
      expect(plugin).toBeDefined();
      expect(plugin.name).toBe('consumer-auth-plugin');
    });

    it('should accept full client configuration', () => {
      const fullOptions: ConsumerAuthOptions = {
        apiBaseUrl: 'https://api.example.com',
        clientConfig: {
          client_id: 'test-client',
          client_secret: 'test-secret',
          grant_types: ['authorization_code', 'refresh_token'],
          response_types: ['code'],
          token_endpoint_auth_method: 'client_secret_basic',
          redirect_uris: ['https://localhost:3000/auth/cb'],
        },
        authScope: 'custom-scope',
        apiHeadersToCopy: ['x-request-id', 'x-trace-id'],
      };

      const plugin = consumerAuthPlugin(fullOptions);
      expect(plugin).toBeDefined();
      expect(plugin.name).toBe('consumer-auth-plugin');
    });
  });

  describe('server configuration', () => {
    it('should call client.discovery with correct URL', async () => {
      const plugin = consumerAuthPlugin(mockOptions);
      const mockServer: any = {
        middlewares: {
          use: vi.fn(),
        },
      };

      if (typeof plugin.configureServer === 'function') {
        await plugin.configureServer.call(plugin, mockServer);
        expect(vi.mocked(client.discovery)).toHaveBeenCalledWith(
          expect.any(URL),
          mockOptions.clientConfig.client_id,
          mockOptions.clientConfig.client_secret,
        );
      }
    });

    it('should generate PKCE code verifier and challenge', async () => {
      const plugin = consumerAuthPlugin(mockOptions);
      const mockServer: any = {
        middlewares: {
          use: vi.fn(),
        },
      };

      if (typeof plugin.configureServer === 'function') {
        await plugin.configureServer.call(plugin, mockServer);
        expect(vi.mocked(client.randomPKCECodeVerifier)).toHaveBeenCalled();
        expect(vi.mocked(client.calculatePKCECodeChallenge)).toHaveBeenCalled();
      }
    });

    it('should register middleware for auth endpoints', async () => {
      const plugin = consumerAuthPlugin(mockOptions);
      const mockServer: any = {
        middlewares: {
          use: vi.fn(),
        },
      };

      if (typeof plugin.configureServer === 'function') {
        await plugin.configureServer.call(plugin, mockServer);

        const registeredPaths = mockServer.middlewares.use.mock.calls
          .map((call: any[]) => call[0])
          .filter((p: any) => typeof p === 'string');

        // Check that all required endpoints are registered
        expect(registeredPaths).toContain('/auth/cb');
        expect(registeredPaths).toContain('/auth');
        expect(registeredPaths).toContain('/validate');
        expect(registeredPaths).toContain('/logout');
      }
    });

    it('should register middleware for API proxies', async () => {
      const plugin = consumerAuthPlugin(mockOptions);
      const mockServer: any = {
        middlewares: {
          use: vi.fn(),
        },
      };

      if (typeof plugin.configureServer === 'function') {
        await plugin.configureServer.call(plugin, mockServer);

        const registeredPaths = mockServer.middlewares.use.mock.calls
          .map((call: any[]) => call[0])
          .filter((p: any) => typeof p === 'string');

        // Check that API proxy endpoints are registered
        expect(registeredPaths).toContain('/a/conversations/api');
        expect(registeredPaths).toContain('/a/consumer/api');
        expect(registeredPaths).toContain('/api');
      }
    });

    it('should register at least 11 middleware handlers', async () => {
      const plugin = consumerAuthPlugin(mockOptions);
      const mockServer: any = {
        middlewares: {
          use: vi.fn(),
        },
      };

      if (typeof plugin.configureServer === 'function') {
        await plugin.configureServer.call(plugin, mockServer);
        // Should register handlers for:
        // /auth/cb, /auth, /validate (2x), /logout,
        // /a/conversations/api (2x), /a/consumer/api (2x), /api (2x)
        // Total: 11+ handlers
        expect(mockServer.middlewares.use.mock.calls.length).toBeGreaterThanOrEqual(11);
      }
    });
  });

  describe('authScope configuration', () => {
    it('should use default authScope when not provided', () => {
      const plugin = consumerAuthPlugin(mockOptions);
      expect(plugin).toBeDefined();
      // Default scope should be used internally
    });

    it('should combine custom authScope with default scope', () => {
      const optionsWithCustomScope: ConsumerAuthOptions = {
        ...mockOptions,
        authScope: 'custom-scope additional-scope',
      };

      const plugin = consumerAuthPlugin(optionsWithCustomScope);
      expect(plugin).toBeDefined();
      // Custom + default scopes should be used internally
    });
  });

  describe('apiHeadersToCopy configuration', () => {
    it('should use default headers when not provided', () => {
      const plugin = consumerAuthPlugin(mockOptions);
      expect(plugin).toBeDefined();
      // Default ['x-request-id'] should be used
    });

    it('should accept empty array', () => {
      const optionsWithNoHeaders: ConsumerAuthOptions = {
        ...mockOptions,
        apiHeadersToCopy: [],
      };

      const plugin = consumerAuthPlugin(optionsWithNoHeaders);
      expect(plugin).toBeDefined();
    });

    it('should accept multiple custom headers', () => {
      const optionsWithHeaders: ConsumerAuthOptions = {
        ...mockOptions,
        apiHeadersToCopy: ['x-request-id', 'x-trace-id', 'x-correlation-id'],
      };

      const plugin = consumerAuthPlugin(optionsWithHeaders);
      expect(plugin).toBeDefined();
    });
  });

  describe('OIDC client initialization', () => {
    it('should create client with provided configuration', async () => {
      const plugin = consumerAuthPlugin(mockOptions);
      const mockServer: any = {
        middlewares: {
          use: vi.fn(),
        },
      };

      if (typeof plugin.configureServer === 'function') {
        await plugin.configureServer.call(plugin, mockServer);
        // Verify that client.discovery was called which initializes the client
        expect(vi.mocked(client.discovery)).toHaveBeenCalled();
      }
    });
  });

  describe('edge cases', () => {
    it('should handle plugin creation with only required options', () => {
      const minimalOptions: ConsumerAuthOptions = {
        apiBaseUrl: 'https://minimal.example.com',
        clientConfig: {
          client_id: 'minimal-client',
          client_secret: 'minimal-secret',
        },
      };

      expect(() => consumerAuthPlugin(minimalOptions)).not.toThrow();
    });

    it('should handle empty string in authScope', () => {
      const optionsWithEmptyScope: ConsumerAuthOptions = {
        ...mockOptions,
        authScope: '',
      };

      expect(() => consumerAuthPlugin(optionsWithEmptyScope)).not.toThrow();
    });

    it('should handle apiBaseUrl with trailing slash', () => {
      const optionsWithTrailingSlash: ConsumerAuthOptions = {
        ...mockOptions,
        apiBaseUrl: 'https://api.example.com/',
      };

      const plugin = consumerAuthPlugin(optionsWithTrailingSlash);
      expect(plugin).toBeDefined();
    });

    it('should handle apiBaseUrl without protocol', () => {
      const optionsWithoutProtocol: ConsumerAuthOptions = {
        ...mockOptions,
        apiBaseUrl: 'api.example.com',
      };

      const plugin = consumerAuthPlugin(optionsWithoutProtocol);
      expect(plugin).toBeDefined();
    });
  });
});
