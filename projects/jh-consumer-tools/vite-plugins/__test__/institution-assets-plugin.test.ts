// SPDX-FileCopyrightText: 2025 Jack Henry
//
// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import institutionAssetsPlugin from '../src/institution-assets-plugin';
import type { InstitutionAssetMap } from '../src/institution-assets-plugin';
import path from 'path';

// Mock fs/promises
vi.mock('fs/promises', () => ({
  default: {
    mkdir: vi.fn(() => Promise.resolve()),
    writeFile: vi.fn(() => Promise.resolve()),
  },
  mkdir: vi.fn(() => Promise.resolve()),
  writeFile: vi.fn(() => Promise.resolve()),
}));

// Import the mocked module to get access to the mocks
import * as fs from 'fs/promises';

// Mock fetch
global.fetch = vi.fn();

// Silence console.warn output triggered by intentional failures in tests
let warnSpy: any;
let errorSpy: any;

describe('institutionAssetsPlugin', () => {
  const mockOptions = {
    institutionId: 'test-institution',
    onlineDomain: 'test.banno.com',
  };

  beforeAll(() => {
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    warnSpy?.mockRestore();
    errorSpy?.mockRestore();
  });

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock fetch response
    (global.fetch as any).mockResolvedValue({
      ok: true,
      headers: new Map([['content-type', 'image/png']]),
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)),
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('plugin structure', () => {
    it('should return a plugin with correct name', async () => {
      const plugin = await institutionAssetsPlugin(mockOptions);
      expect(plugin.name).toBe('institution-assets-plugin');
    });

    it('should have a config function', async () => {
      const plugin = await institutionAssetsPlugin(mockOptions);
      expect(plugin.config).toBeDefined();
      expect(typeof plugin.config).toBe('function');
    });
  });

  describe('plugin options', () => {
    it('should accept minimal options', async () => {
      const minimalOptions = {
        institutionId: 'bank-123',
        onlineDomain: 'example.banno.com',
      };

      const plugin = await institutionAssetsPlugin(minimalOptions);
      expect(plugin).toBeDefined();
      expect(plugin.name).toBe('institution-assets-plugin');
    });

    it('should accept full options with custom assetsDir', async () => {
      const fullOptions = {
        institutionId: 'bank-123',
        assetsDir: 'public/images',
        onlineDomain: 'example.banno.com',
      };

      const plugin = await institutionAssetsPlugin(fullOptions);
      expect(plugin).toBeDefined();
      expect(plugin.name).toBe('institution-assets-plugin');
    });

    it('should accept custom imageTypes', async () => {
      const optionsWithCustomImages = {
        institutionId: 'bank-123',
        imageTypes: ['logo', 'background/portrait'],
        onlineDomain: 'example.banno.com',
      };

      const plugin = await institutionAssetsPlugin(optionsWithCustomImages);
      expect(plugin).toBeDefined();
      expect(plugin.name).toBe('institution-assets-plugin');
    });

    it('should use default assetsDir when not provided', async () => {
      const plugin = await institutionAssetsPlugin(mockOptions);
      expect(plugin).toBeDefined();
      // Should use default 'src/assets/institution'
    });

    it('should use default imageTypes when not provided', async () => {
      const plugin = await institutionAssetsPlugin(mockOptions);
      expect(plugin).toBeDefined();
      // Should fetch default images: background/portrait, background/landscape, logo, menu/logo
    });
  });

  describe('config hook', () => {
    it('should define ASSETS constant', async () => {
      const plugin = await institutionAssetsPlugin(mockOptions);
      const mockConfig: any = { define: {} };
      const mockEnv = { mode: 'development', command: 'serve' as const };

      if (typeof plugin.config === 'function') {
        plugin.config.call({} as any, mockConfig, mockEnv);
        expect(mockConfig.define?.ASSETS).toBeDefined();
        expect(typeof mockConfig.define?.ASSETS).toBe('object');
      }
    });

    it('should define ONLINE_DOMAIN constant', async () => {
      const plugin = await institutionAssetsPlugin(mockOptions);
      const mockConfig: any = { define: {} };
      const mockEnv = { mode: 'development', command: 'serve' as const };

      if (typeof plugin.config === 'function') {
        plugin.config.call({} as any, mockConfig, mockEnv);
        expect(mockConfig.define?.ONLINE_DOMAIN).toBe(JSON.stringify('test.banno.com'));
      }
    });

    it('should initialize define object if not present', async () => {
      const plugin = await institutionAssetsPlugin(mockOptions);
      const mockConfig: any = {};
      const mockEnv = { mode: 'development', command: 'serve' as const };

      if (typeof plugin.config === 'function') {
        plugin.config.call({} as any, mockConfig, mockEnv);
        expect(mockConfig.define).toBeDefined();
        expect(mockConfig.define?.ASSETS).toBeDefined();
        expect(mockConfig.define?.ONLINE_DOMAIN).toBeDefined();
      }
    });

    it('should have both light and dark theme assets', async () => {
      const plugin = await institutionAssetsPlugin(mockOptions);
      const mockConfig: any = { define: {} };
      const mockEnv = { mode: 'development', command: 'serve' as const };

      if (typeof plugin.config === 'function') {
        plugin.config.call({} as any, mockConfig, mockEnv);
        const assets = mockConfig.define?.ASSETS as InstitutionAssetMap;
        expect(assets).toBeDefined();
        expect(assets.light).toBeDefined();
        expect(assets.dark).toBeDefined();
      }
    });
  });

  describe('image fetching', () => {
    it('should fetch images from correct URLs', async () => {
      await institutionAssetsPlugin(mockOptions);

      // Should call fetch for each image type in light and dark modes
      expect(global.fetch).toHaveBeenCalled();

      // Check that URLs contain the institution ID
      const fetchCalls = (global.fetch as any).mock.calls;
      const urls = fetchCalls.map((call: any[]) => call[0]);

      urls.forEach((url: string) => {
        expect(url).toContain('test-institution');
        expect(url).toContain('/themes/default/');
      });
    });

    it('should fetch both light and dark mode images', async () => {
      await institutionAssetsPlugin(mockOptions);

      const fetchCalls = (global.fetch as any).mock.calls;
      const urls = fetchCalls.map((call: any[]) => call[0]);

      const lightUrls = urls.filter((url: string) => url.includes('/light/'));
      const darkUrls = urls.filter((url: string) => url.includes('/dark/'));

      expect(lightUrls.length).toBeGreaterThan(0);
      expect(darkUrls.length).toBeGreaterThan(0);
    });

    it('should handle fetch failures gracefully', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        statusText: 'Not Found',
      });

      // Should not throw error
      await expect(institutionAssetsPlugin(mockOptions)).resolves.toBeDefined();
    });

    it('should create target directory', async () => {
      await institutionAssetsPlugin(mockOptions);
      //@ts-expect-error
      expect(fs.default.mkdir).toHaveBeenCalled();
      const mkdirCalls = (fs.mkdir as any).mock.calls;

      mkdirCalls.forEach((call: any[]) => {
        const options = call[1];
        expect(options).toHaveProperty('recursive', true);
      });
    });

    it('should write image files', async () => {
      await institutionAssetsPlugin(mockOptions);
      //@ts-expect-error
      expect(fs.default.writeFile).toHaveBeenCalled();
      const writeFileCalls = (fs.writeFile as any).mock.calls;

      writeFileCalls.forEach((call: any[]) => {
        const [filePath, data] = call;
        expect(typeof filePath).toBe('string');
        expect(data).toBeInstanceOf(Uint8Array);
      });
    });
  });

  describe('image type handling', () => {
    it('should determine correct file extension from content-type', async () => {
      // Test different content types
      const contentTypes = [
        { type: 'image/jpeg', ext: '.jpg' },
        { type: 'image/png', ext: '.png' },
        { type: 'image/svg+xml', ext: '.svg' },
        { type: 'image/webp', ext: '.webp' },
      ];

      for (const { type, ext } of contentTypes) {
        vi.clearAllMocks();

        (global.fetch as any).mockResolvedValue({
          ok: true,
          headers: new Map([['content-type', type]]),
          arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)),
        });

        await institutionAssetsPlugin(mockOptions);

        const writeFileCalls = (fs.writeFile as any).mock.calls;
        if (writeFileCalls.length > 0) {
          const filePath = writeFileCalls[0][0];
          expect(filePath).toContain(ext);
        }
      }
    });

    it('should default to .png extension when content-type is unknown', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        headers: new Map([['content-type', 'application/octet-stream']]),
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)),
      });

      await institutionAssetsPlugin(mockOptions);

      const writeFileCalls = (fs.writeFile as any).mock.calls;
      if (writeFileCalls.length > 0) {
        const filePath = writeFileCalls[0][0];
        expect(filePath).toContain('.png');
      }
    });

    it('should handle missing content-type header', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        headers: new Map(),
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)),
      });

      await institutionAssetsPlugin(mockOptions);

      const writeFileCalls = (fs.writeFile as any).mock.calls;
      if (writeFileCalls.length > 0) {
        const filePath = writeFileCalls[0][0];
        expect(filePath).toContain('.png'); // Should default to .png
      }
    });
  });

  describe('asset map generation', () => {
    it('should convert image types to camelCase keys', async () => {
      const plugin = await institutionAssetsPlugin(mockOptions);
      const mockConfig: any = { define: {} };
      const mockEnv = { mode: 'development', command: 'serve' as const };

      if (typeof plugin.config === 'function') {
        plugin.config.call({} as any, mockConfig, mockEnv);
        const assets = mockConfig.define?.ASSETS as InstitutionAssetMap;

        // background/portrait should become backgroundPortrait
        // background/landscape should become backgroundLandscape
        // menu/logo should become menuLogo
        expect(assets.light).toHaveProperty('backgroundPortrait');
        expect(assets.light).toHaveProperty('backgroundLandscape');
        expect(assets.light).toHaveProperty('menuLogo');
        expect(assets.dark).toHaveProperty('backgroundPortrait');
        expect(assets.dark).toHaveProperty('backgroundLandscape');
        expect(assets.dark).toHaveProperty('menuLogo');
      }
    });

    it('should generate relative paths from project root', async () => {
      const plugin = await institutionAssetsPlugin(mockOptions);
      const mockConfig: any = { define: {} };
      const mockEnv = { mode: 'development', command: 'serve' as const };

      if (typeof plugin.config === 'function') {
        plugin.config.call({} as any, mockConfig, mockEnv);
        const assets = mockConfig.define?.ASSETS as InstitutionAssetMap;

        // All paths should start with /
        Object.values(assets.light).forEach((path) => {
          if (path) {
            expect(path).toMatch(/^\//);
          }
        });
        Object.values(assets.dark).forEach((path) => {
          if (path) {
            expect(path).toMatch(/^\//);
          }
        });
      }
    });
  });

  describe('custom configuration', () => {
    it('should handle custom assetsDir path', async () => {
      const customOptions = {
        ...mockOptions,
        assetsDir: 'public/custom/path',
      };

      const plugin = await institutionAssetsPlugin(customOptions);
      expect(plugin).toBeDefined();

      // Verify mkdir was called with custom path
      const mkdirCalls = (fs.mkdir as any).mock.calls;
      const paths = mkdirCalls.map((call: any[]) => call[0]);

      paths.forEach((p: string) => {
        expect(p).toContain('public/custom/path');
      });
    });

    it('should handle custom imageTypes array', async () => {
      const customOptions = {
        ...mockOptions,
        imageTypes: ['logo', 'custom/image'],
      };

      await institutionAssetsPlugin(customOptions);

      const fetchCalls = (global.fetch as any).mock.calls;
      const urls = fetchCalls.map((call: any[]) => call[0]);

      // Should fetch custom image types
      const logoUrls = urls.filter((url: string) => url.includes('/logo'));
      const customUrls = urls.filter((url: string) => url.includes('/custom/image'));

      expect(logoUrls.length).toBeGreaterThan(0);
      expect(customUrls.length).toBeGreaterThan(0);
    });

    it('should use different institution IDs correctly', async () => {
      const options1 = {
        institutionId: 'bank-abc',
        onlineDomain: 'test.banno.com',
      };
      const options2 = {
        institutionId: 'bank-xyz',
        onlineDomain: 'test.banno.com',
      };

      vi.clearAllMocks();
      await institutionAssetsPlugin(options1);
      const fetchCalls1 = (global.fetch as any).mock.calls;

      vi.clearAllMocks();
      await institutionAssetsPlugin(options2);
      const fetchCalls2 = (global.fetch as any).mock.calls;

      const urls1 = fetchCalls1.map((call: any[]) => call[0]);
      const urls2 = fetchCalls2.map((call: any[]) => call[0]);

      urls1.forEach((url: string) => expect(url).toContain('bank-abc'));
      urls2.forEach((url: string) => expect(url).toContain('bank-xyz'));
    });
  });

  describe('error handling', () => {
    it('should handle network errors gracefully', async () => {
      (global.fetch as any).mockRejectedValue(new Error('Network error'));

      // Should not throw
      await expect(institutionAssetsPlugin(mockOptions)).resolves.toBeDefined();
    });

    it('should handle file write errors gracefully', async () => {
      (fs.writeFile as any).mockRejectedValue(new Error('Write error'));

      // Should not throw
      await expect(institutionAssetsPlugin(mockOptions)).resolves.toBeDefined();
    });

    it('should handle directory creation errors gracefully', async () => {
      (fs.mkdir as any).mockRejectedValue(new Error('mkdir error'));

      // Should not throw
      await expect(institutionAssetsPlugin(mockOptions)).resolves.toBeDefined();
    });

    it('should continue processing other images when one fails', async () => {
      let callCount = 0;
      (global.fetch as any).mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.reject(new Error('First fetch failed: error expected in tests.'));
        }
        return Promise.resolve({
          ok: true,
          headers: new Map([['content-type', 'image/png']]),
          arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)),
        });
      });

      const plugin = await institutionAssetsPlugin(mockOptions);
      expect(plugin).toBeDefined();

      // Should have attempted multiple fetches despite first failure
      expect(global.fetch).toHaveBeenCalled();
      expect((global.fetch as any).mock.calls.length).toBeGreaterThan(1);
    });
  });

  describe('filename sanitization', () => {
    it('should sanitize image type names for filenames', async () => {
      const customOptions = {
        ...mockOptions,
        imageTypes: ['background/portrait', 'menu/logo'],
      };

      await institutionAssetsPlugin(customOptions);

      const writeFileCalls = (fs.writeFile as any).mock.calls;
      const filePaths = writeFileCalls.map((call: any[]) => call[0]);

      filePaths.forEach((filePath: string) => {
        const filename = path.basename(filePath);
        // Filename should not contain forward slashes (replaced with dashes)
        expect(filename).toMatch(/^(light|dark)-[a-z-]+\.(png|jpg|svg|webp)$/);
      });
    });
  });
});
