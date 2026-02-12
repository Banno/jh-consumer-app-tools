// SPDX-FileCopyrightText: 2025 Jack Henry
//
// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import jhThemePlugin from '../src/jh-theme-plugin';
import type { WebserverConfigResponse } from '../../types/institution';

// Mock fs module
vi.mock('fs', () => ({
  default: {
    readFileSync: vi.fn(() => '/* mock css */'),
    existsSync: vi.fn(() => true),
  },
  readFileSync: vi.fn(() => '/* mock css */'),
  existsSync: vi.fn(() => true),
}));

// Mock fetch
global.fetch = vi.fn();

describe('jhThemePlugin', () => {
  const mockOptions = {
    institutionId: 'test-institution',
    apiBaseUrl: 'test.banno.com',
  };

  const mockContext = {
    path: '/index.html',
    filename: '/test/index.html',
    server: undefined,
    bundle: undefined,
    chunk: undefined,
    originalUrl: '/',
  };

  // Helper to call the transformIndexHtml handler
  const transformHtml = (plugin: Awaited<ReturnType<typeof jhThemePlugin>>, html: string): any => {
    if (typeof plugin.transformIndexHtml === 'function') {
      return plugin.transformIndexHtml.call({} as any, html, mockContext);
    }
    return [];
  };

  const mockWebserverConfig: any = {
    properties: {
      themes: {
        default: {
          light: {
            primaryColor: '#0066cc',
            secondaryColor: '#ff6600',
            backgroundColor: '#ffffff',
            textColor: '#333333',
            borderRadius: '8',
            fontFamily: 'Roboto',
            buttonBackgroundColor: '#0066cc',
            buttonTextColor: '#ffffff',
            gradient: '#0066cc, #0088ee',
          },
          dark: {
            primaryColor: '#3399ff',
            secondaryColor: '#ff9933',
            backgroundColor: '#1a1a1a',
            textColor: '#e0e0e0',
            borderRadius: '8',
            fontFamily: 'Roboto',
            buttonBackgroundColor: '#3399ff',
            buttonTextColor: '#ffffff',
            gradient: '#3399ff, #55aaff',
            linearGradient: ['#3399ff', '#55aaff'],
          },
        },
      },
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock fetch response
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockWebserverConfig),
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('plugin structure', () => {
    it('should return a plugin with correct name', async () => {
      const plugin = await jhThemePlugin(mockOptions);
      expect(plugin.name).toBe('jh-theme-plugin');
    });

    it('should have a transformIndexHtml function', async () => {
      const plugin = await jhThemePlugin(mockOptions);
      expect(plugin.transformIndexHtml).toBeDefined();
      expect(typeof plugin.transformIndexHtml).toBe('function');
    });
  });

  describe('plugin options', () => {
    it('should accept required options', async () => {
      const requiredOptions = {
        institutionId: 'bank-123',
        apiBaseUrl: 'example.banno.com',
      };

      const plugin = await jhThemePlugin(requiredOptions);
      expect(plugin).toBeDefined();
      expect(plugin.name).toBe('jh-theme-plugin');
    });

    it('should fetch webserver config from correct URL', async () => {
      await jhThemePlugin(mockOptions);

      expect(global.fetch).toHaveBeenCalledWith(
        `https://${mockOptions.apiBaseUrl}/api/config/${mockOptions.institutionId}`,
      );
    });

    it('should handle different institution IDs', async () => {
      const options1 = {
        institutionId: 'bank-abc',
        apiBaseUrl: 'test.banno.com',
      };
      const options2 = {
        institutionId: 'bank-xyz',
        apiBaseUrl: 'test.banno.com',
      };

      vi.clearAllMocks();
      await jhThemePlugin(options1);
      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('bank-abc'));

      vi.clearAllMocks();
      await jhThemePlugin(options2);
      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('bank-xyz'));
    });

    it('should handle different API base URLs', async () => {
      const customOptions = {
        institutionId: 'test-bank',
        apiBaseUrl: 'custom.example.com',
      };

      await jhThemePlugin(customOptions);
      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('custom.example.com'));
    });
  });

  describe('calling plugin without options', () => {
    it('should accept required options', async () => {
      const plugin = await jhThemePlugin();
      expect(plugin).toBeDefined();
      expect(plugin.name).toBe('jh-theme-plugin');
    });

    it('should fetch webserver config from correct URL', async () => {
      await jhThemePlugin();

      expect(global.fetch).not.toHaveBeenCalledWith();
    });
  });

  describe('transformIndexHtml hook', () => {
    it('should return an array of HTML tags', async () => {
      const plugin = await jhThemePlugin(mockOptions);

      if (typeof plugin.transformIndexHtml === 'function') {
        const result = transformHtml(plugin, '<html></html>');
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBeGreaterThan(0);
      }
    });

    it('should inject font preload link', async () => {
      const plugin = await jhThemePlugin(mockOptions);

      if (typeof plugin.transformIndexHtml === 'function') {
        const result = transformHtml(plugin, '<html></html>');
        const fontPreload = result.find((tag: any) => tag.tag === 'link' && tag.attrs?.rel === 'preload');

        expect(fontPreload).toBeDefined();
        expect(fontPreload.attrs.as).toBe('font');
        expect(fontPreload.attrs.type).toBe('font/woff2');
        expect(fontPreload.attrs.href).toContain('roboto');
      }
    });

    it('should inject ds-theme style tag', async () => {
      const plugin = await jhThemePlugin(mockOptions);

      if (typeof plugin.transformIndexHtml === 'function') {
        const result = transformHtml(plugin, '<html></html>');
        const dsTheme = result.find((tag: any) => tag.tag === 'style' && tag.attrs?.id === 'ds-theme');

        expect(dsTheme).toBeDefined();
        expect(dsTheme.children).toBeDefined();
      }
    });

    it('should inject banno-style style tag', async () => {
      const plugin = await jhThemePlugin(mockOptions);

      if (typeof plugin.transformIndexHtml === 'function') {
        const result = transformHtml(plugin, '<html></html>');
        const bannoStyle = result.find((tag: any) => tag.tag === 'style' && tag.attrs?.id === 'banno-style');

        expect(bannoStyle).toBeDefined();
        expect(bannoStyle.children).toBeDefined();
      }
    });

    it('should inject institution-theme style tag', async () => {
      const plugin = await jhThemePlugin(mockOptions);

      if (typeof plugin.transformIndexHtml === 'function') {
        const result = transformHtml(plugin, '<html></html>');
        const institutionTheme = result.find(
          (tag: any) => tag.tag === 'style' && tag.attrs?.id === 'institution-theme',
        );

        expect(institutionTheme).toBeDefined();
        expect(institutionTheme.children).toBeDefined();
        expect(typeof institutionTheme.children).toBe('string');
      }
    });

    it('should inject jha-wc-theme style tag', async () => {
      const plugin = await jhThemePlugin(mockOptions);

      if (typeof plugin.transformIndexHtml === 'function') {
        const result = transformHtml(plugin, '<html></html>');
        const jhaWcTheme = result.find((tag: any) => tag.tag === 'style' && tag.attrs?.id === 'jha-wc-theme');

        expect(jhaWcTheme).toBeDefined();
        expect(jhaWcTheme.children).toBeDefined();
      }
    });

    it('should inject ds-theme-map style tag', async () => {
      const plugin = await jhThemePlugin(mockOptions);

      if (typeof plugin.transformIndexHtml === 'function') {
        const result = transformHtml(plugin, '<html></html>');
        const dsThemeMap = result.find((tag: any) => tag.tag === 'style' && tag.attrs?.id === 'ds-theme-map');

        expect(dsThemeMap).toBeDefined();
        expect(dsThemeMap.children).toBeDefined();
      }
    });

    it('should inject page-theme style tag', async () => {
      const plugin = await jhThemePlugin(mockOptions);

      if (typeof plugin.transformIndexHtml === 'function') {
        const result = transformHtml(plugin, '<html></html>');
        const pageTheme = result.find((tag: any) => tag.tag === 'style' && tag.attrs?.id === 'page-theme');

        expect(pageTheme).toBeDefined();
        expect(pageTheme.children).toContain('body');
        expect(pageTheme.children).toContain('background-color');
      }
    });

    it('should inject view-transitions style tag', async () => {
      const plugin = await jhThemePlugin(mockOptions);

      if (typeof plugin.transformIndexHtml === 'function') {
        const result = transformHtml(plugin, '<html></html>');
        const viewTransitions = result.find((tag: any) => tag.tag === 'style' && tag.attrs?.id === 'view-transitions');

        expect(viewTransitions).toBeDefined();
        expect(viewTransitions.children).toContain('@view-transition');
        expect(viewTransitions.children).toContain('navigation: auto');
      }
    });

    it('should inject window.banno script tag', async () => {
      const plugin = await jhThemePlugin(mockOptions);

      if (typeof plugin.transformIndexHtml === 'function') {
        const result = transformHtml(plugin, '<html></html>');
        const bannoScript = result.find((tag: any) => tag.tag === 'script' && tag.children?.includes('window.banno'));

        expect(bannoScript).toBeDefined();
        expect(bannoScript.children).toContain('window.banno');
        expect(bannoScript.children).toContain('web');
        expect(bannoScript.children).toContain('config');
      }
    });

    it('should inject platform-font override style tag', async () => {
      const plugin = await jhThemePlugin(mockOptions);

      if (typeof plugin.transformIndexHtml === 'function') {
        const result = transformHtml(plugin, '<html></html>');
        const platformFont = result.find(
          (tag: any) => tag.tag === 'style' && !tag.attrs?.id && tag.children?.includes('--jha-platform-font'),
        );

        expect(platformFont).toBeDefined();
        expect(platformFont.children).toContain('roboto');
      }
    });

    it('should inject dialog element into body', async () => {
      const plugin = await jhThemePlugin(mockOptions);

      if (typeof plugin.transformIndexHtml === 'function') {
        const result = transformHtml(plugin, '<html></html>');
        const dialog = result.find((tag: any) => tag.tag === 'dialog' && tag.injectTo === 'body');

        expect(dialog).toBeDefined();
      }
    });

    it('should inject all required tags', async () => {
      const plugin = await jhThemePlugin(mockOptions);

      if (typeof plugin.transformIndexHtml === 'function') {
        const result = transformHtml(plugin, '<html></html>');

        // Should have at least 11 tags (font preload + 6 style tags + script + font override + dialog + view-transitions + page-theme)
        expect(result.length).toEqual(11);
      }
    });

    describe('transformation hooks without the options', () => {
      it('should inject all only base and page style tags', async () => {
      const plugin = await jhThemePlugin();

        if (typeof plugin.transformIndexHtml === 'function') {
          const result = transformHtml(plugin, '<html></html>');

          // Should have at least 5 tags (font preload + ds styles + dialog + view-transitions + page-theme)
          expect(result.length).toEqual(5);
        }
      });
    });
  });

  describe('theme CSS generation', () => {
    it('should convert camelCase properties to kebab-case CSS variables', async () => {
      const plugin = await jhThemePlugin(mockOptions);

      if (typeof plugin.transformIndexHtml === 'function') {
        const result = transformHtml(plugin, '<html></html>');
        const institutionTheme = result.find((tag: any) => tag.attrs?.id === 'institution-theme');

        expect(institutionTheme.children).toContain('--primary-color');
        expect(institutionTheme.children).toContain('--secondary-color');
        expect(institutionTheme.children).toContain('--background-color');
      }
    });

    it('should handle nested theme properties', async () => {
      const plugin = await jhThemePlugin(mockOptions);

      if (typeof plugin.transformIndexHtml === 'function') {
        const result = transformHtml(plugin, '<html></html>');
        const institutionTheme = result.find((tag: any) => tag.attrs?.id === 'institution-theme');

        // button.backgroundColor should become --button-background-color
        expect(institutionTheme.children).toContain('--button-background-color');
        expect(institutionTheme.children).toContain('--button-text-color');
      }
    });

    it('should create :root selector for light theme', async () => {
      const plugin = await jhThemePlugin(mockOptions);

      if (typeof plugin.transformIndexHtml === 'function') {
        const result = transformHtml(plugin, '<html></html>');
        const institutionTheme = result.find((tag: any) => tag.attrs?.id === 'institution-theme');

        expect(institutionTheme.children).toContain(':root {');
      }
    });

    it('should create media query for dark theme', async () => {
      const plugin = await jhThemePlugin(mockOptions);

      if (typeof plugin.transformIndexHtml === 'function') {
        const result = transformHtml(plugin, '<html></html>');
        const institutionTheme = result.find((tag: any) => tag.attrs?.id === 'institution-theme');

        expect(institutionTheme.children).toContain('@media (prefers-color-scheme: dark)');
      }
    });

    it('should convert 8-digit hex colors to rgba', async () => {
      const customConfig = {
        ...mockWebserverConfig,
        properties: {
          themes: {
            default: {
              light: {
                primaryColor: '#0066cc80', // 8-digit hex with alpha
              },
              dark: {
                primaryColor: '#3399ff80',
              },
            },
          },
        },
      };

      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(customConfig),
      });

      const plugin = await jhThemePlugin(mockOptions);

      if (typeof plugin.transformIndexHtml === 'function') {
        const result = transformHtml(plugin, '<html></html>');
        const institutionTheme = result.find((tag: any) => tag.attrs?.id === 'institution-theme');

        // Should convert to rgba format
        expect(institutionTheme.children).toContain('rgba(');
      }
    });

    it('should handle array values as gradients', async () => {
      const plugin = await jhThemePlugin(mockOptions);

      if (typeof plugin.transformIndexHtml === 'function') {
        const result = transformHtml(plugin, '<html></html>');
        const institutionTheme = result.find((tag: any) => tag.attrs?.id === 'institution-theme');

        // gradient array should become linear-gradient
        expect(institutionTheme.children).toContain('--gradient');
        expect(institutionTheme.children).toContain('linear-gradient');
      }
    });

    it('should handle numeric values', async () => {
      const plugin = await jhThemePlugin(mockOptions);

      if (typeof plugin.transformIndexHtml === 'function') {
        const result = transformHtml(plugin, '<html></html>');
        const institutionTheme = result.find((tag: any) => tag.attrs?.id === 'institution-theme');

        // borderRadius is a number (8)
        expect(institutionTheme.children).toContain('--border-radius: 8');
      }
    });

    it('should handle string values', async () => {
      const plugin = await jhThemePlugin(mockOptions);

      if (typeof plugin.transformIndexHtml === 'function') {
        const result = transformHtml(plugin, '<html></html>');
        const institutionTheme = result.find((tag: any) => tag.attrs?.id === 'institution-theme');

        // fontFamily is a string
        expect(institutionTheme.children).toContain('--font-family: Roboto');
      }
    });
  });

  describe('webserver config integration', () => {
    it('should embed webserver config in window.banno', async () => {
      const plugin = await jhThemePlugin(mockOptions);

      if (typeof plugin.transformIndexHtml === 'function') {
        const result = transformHtml(plugin, '<html></html>');
        const bannoScript = result.find((tag: any) => tag.tag === 'script' && tag.children?.includes('window.banno'));

        const scriptContent = bannoScript.children;
        expect(scriptContent).toContain(JSON.stringify(mockWebserverConfig.properties));
      }
    });

    it('should handle webserver config with nested properties', async () => {
      const customConfig = {
        properties: {
          themes: mockWebserverConfig.properties.themes,
          customProperty: {
            nested: {
              deep: 'value',
            },
          },
        },
      };

      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(customConfig),
      });

      const plugin = await jhThemePlugin(mockOptions);

      if (typeof plugin.transformIndexHtml === 'function') {
        const result = transformHtml(plugin, '<html></html>');
        const bannoScript = result.find((tag: any) => tag.tag === 'script' && tag.children?.includes('window.banno'));

        expect(bannoScript.children).toContain('customProperty');
      }
    });
  });

  describe('error handling', () => {
    it('should throw error when webserver config fetch fails', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: false,
        statusText: 'Not Found',
      });

      await expect(jhThemePlugin(mockOptions)).rejects.toThrow('Failed to fetch web server config');
    });

    it('should throw error on network failure', async () => {
      (global.fetch as any).mockRejectedValue(new Error('Network error'));

      await expect(jhThemePlugin(mockOptions)).rejects.toThrow();
    });

    it('should handle invalid JSON response', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.reject(new Error('Invalid JSON')),
      });

      await expect(jhThemePlugin(mockOptions)).rejects.toThrow();
    });
  });

  describe('tag ordering', () => {
    it('should inject tags in correct order', async () => {
      const plugin = await jhThemePlugin(mockOptions);

      if (typeof plugin.transformIndexHtml === 'function') {
        const result = transformHtml(plugin, '<html></html>');

        // Find indices of key tags
        const fontPreloadIndex = result.findIndex((tag: any) => tag.tag === 'link' && tag.attrs?.rel === 'preload');
        const dsThemeIndex = result.findIndex((tag: any) => tag.attrs?.id === 'ds-theme');
        const institutionThemeIndex = result.findIndex((tag: any) => tag.attrs?.id === 'institution-theme');
        const scriptIndex = result.findIndex(
          (tag: any) => tag.tag === 'script' && tag.children?.includes('window.banno'),
        );

        // Font preload should come first
        expect(fontPreloadIndex).toBe(0);

        // DS theme should come before institution theme
        expect(dsThemeIndex).toBeLessThan(institutionThemeIndex);

        // Script should come after styles
        expect(scriptIndex).toBeGreaterThan(institutionThemeIndex);
      }
    });
  });
});
