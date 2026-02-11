// SPDX-FileCopyrightText: 2025 Jack Henry
//
// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import designSystemThemePlugin from '../src/design-system-theme-plugin';
import fs from 'fs';
import { createRequire } from 'module';

// Mock fs module
vi.mock('fs', () => ({
  default: {
    readFileSync: vi.fn(() => '/* mock css */'),
    existsSync: vi.fn(() => true),
  },
  readFileSync: vi.fn((path) => {
    if (path.includes('@import')) {
      return `@import "another.css"; /* mock css with import */`;
    }
    return '/* mock css */';
  }),
  existsSync: vi.fn(() => true),
}));

// Mock createRequire
vi.mock('module', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    createRequire: vi.fn(() =>
      vi.fn((specifier) => {
        if (specifier === '@jack-henry/jh-tokens/platforms/web/css/jh-theme-light.css') {
          return '/fake/path/to/jh-theme-light.css';
        }
        if (specifier === '@jack-henry/jh-tokens/platforms/web/css/jh-theme-dark.css') {
          return '/fake/path/to/jh-theme-dark.css';
        }
        throw new Error(`Cannot find module '${specifier}'`);
      }),
    ),
  };
});

describe('designSystemThemePlugin', () => {
  // Helper to call the transformIndexHtml handler
  const transformHtml = (plugin: Awaited<ReturnType<typeof designSystemThemePlugin>>, html: string): any => {
    if (typeof plugin.transformIndexHtml === 'function') {
      return plugin.transformIndexHtml.call({} as any, html, {} as any);
    }
    return [];
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('plugin structure', () => {
    it('should return a plugin with correct name', async () => {
      const plugin = await designSystemThemePlugin();
      expect(plugin.name).toBe('design-system-theme-plugin');
    });

    it('should have a transformIndexHtml function', async () => {
      const plugin = await designSystemThemePlugin();
      expect(plugin.transformIndexHtml).toBeDefined();
      expect(typeof plugin.transformIndexHtml).toBe('function');
    });
  });

  describe('transformIndexHtml hook', () => {
    it('should return an array of HTML tags', async () => {
      const plugin = await designSystemThemePlugin();
      const result = transformHtml(plugin, '<html></html>');
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should inject font preload link', async () => {
      const plugin = await designSystemThemePlugin();
      const result = transformHtml(plugin, '<html></html>');
      const fontPreload = result.find((tag: any) => tag.tag === 'link' && tag.attrs?.rel === 'preload');

      expect(fontPreload).toBeDefined();
      expect(fontPreload.attrs.as).toBe('font');
      expect(fontPreload.attrs.type).toBe('font/woff2');
      expect(fontPreload.attrs.href).toContain('roboto');
    });

    it('should inject ds-theme style tag', async () => {
      const plugin = await designSystemThemePlugin();

      if (typeof plugin.transformIndexHtml === 'function') {
        const result = transformHtml(plugin, '<html></html>');
        const dsTheme = result.find((tag: any) => tag.tag === 'style' && tag.attrs?.id === 'ds-theme');

        expect(dsTheme).toBeDefined();
        expect(dsTheme.children).toBeDefined();
      }
    });

    it('should inject page-theme style tag', async () => {
      const plugin = await designSystemThemePlugin();
      const result = transformHtml(plugin, '<html></html>');
      const pageTheme = result.find((tag: any) => tag.tag === 'style' && tag.attrs?.id === 'page-theme');

      expect(pageTheme).toBeDefined();
      expect(pageTheme.children).toContain('body { background-color: var(--jha-background-color); }');
    });

    it('should inject view-transitions style tag', async () => {
      const plugin = await designSystemThemePlugin();
      const result = transformHtml(plugin, '<html></html>');
      const viewTransitions = result.find((tag: any) => tag.tag === 'style' && tag.attrs?.id === 'view-transitions');

      expect(viewTransitions).toBeDefined();
      expect(viewTransitions.children).toContain('@view-transition');
      expect(viewTransitions.children).toContain('navigation: auto');
    });

    it('should inject platform-font override style tag', async () => {
      const plugin = await designSystemThemePlugin();
      const result = transformHtml(plugin, '<html></html>');
      const platformFont = result.find(
        (tag: any) => tag.tag === 'style' && !tag.attrs?.id && tag.children?.includes('--jha-platform-font'),
      );

      expect(platformFont).toBeDefined();
      expect(platformFont.children).toContain('roboto');
    });

    it('should inject dialog element into body', async () => {
      const plugin = await designSystemThemePlugin();
      const result = transformHtml(plugin, '<html></html>');
      const dialog = result.find((tag: any) => tag.tag === 'dialog' && tag.injectTo === 'body');

      expect(dialog).toBeDefined();
    });

    it('should inject all required tags', async () => {
      const plugin = await designSystemThemePlugin();
      const result = transformHtml(plugin, '<html></html>');
      expect(result.length).toEqual(6);
    });
  });
});
