// SPDX-FileCopyrightText: 2025 Jack Henry
//
// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect } from 'vitest';
import consumerLayoutPlugin from '../src/consumer-layout-plugin';

describe('consumerLayoutPlugin', () => {
  const mockOptions = {
    rootTagName: 'my-app',
    institutionId: 'test-institution',
  };

  const mockContext = {
    path: '/index.html',
    filename: '/test/index.html',
    server: undefined,
    bundle: undefined,
    chunk: undefined,
    originalUrl: '/',
  };

  // Helper to call the handler
  const transformHtml = (plugin: ReturnType<typeof consumerLayoutPlugin>, html: string): string => {
    if (typeof plugin.transformIndexHtml === 'object' && plugin.transformIndexHtml !== null) {
      const result = plugin.transformIndexHtml.handler.call({} as any, html, mockContext);
      return typeof result === 'string' ? result : html;
    }
    return html;
  };

  describe('plugin structure', () => {
    it('should return a plugin with correct name', () => {
      const plugin = consumerLayoutPlugin(mockOptions);
      expect(plugin.name).toBe('consumer-layout-plugin');
    });

    it('should have a transformIndexHtml property', () => {
      const plugin = consumerLayoutPlugin(mockOptions);
      expect(plugin.transformIndexHtml).toBeDefined();
    });

    it('should have transformIndexHtml with order "pre"', () => {
      const plugin = consumerLayoutPlugin(mockOptions);
      expect(plugin.transformIndexHtml).toHaveProperty('order', 'pre');
    });

    it('should have a handler function in transformIndexHtml', () => {
      const plugin = consumerLayoutPlugin(mockOptions);
      if (typeof plugin.transformIndexHtml === 'object' && plugin.transformIndexHtml !== null) {
        expect(plugin.transformIndexHtml.handler).toBeDefined();
        expect(typeof plugin.transformIndexHtml.handler).toBe('function');
      }
    });
  });

  describe('HTML transformation - wrapping existing root tag', () => {
    it('should wrap existing root tag with jh-consumer-layout', () => {
      const plugin = consumerLayoutPlugin(mockOptions);
      const inputHtml = `
<!DOCTYPE html>
<html>
<body>
  <my-app></my-app>
</body>
</html>`;

      const result = transformHtml(plugin, inputHtml);
      expect(result).toContain('<jh-consumer-layout institution-id=test-institution>');
      expect(result).toContain('<my-app institution-id=test-institution>');
      expect(result).toContain('</my-app>');
      expect(result).toContain('</jh-consumer-layout>');
    });

    it('should preserve existing attributes on root tag', () => {
      const plugin = consumerLayoutPlugin(mockOptions);
      const inputHtml = `
<!DOCTYPE html>
<html>
<body>
  <my-app class="app-container" data-version="1.0"></my-app>
</body>
</html>`;

      const result = transformHtml(plugin, inputHtml);
      expect(result).toContain('class="app-container"');
      expect(result).toContain('data-version="1.0"');
      expect(result).toContain('institution-id=test-institution');
    });

    it('should handle self-closing root tag', () => {
      const plugin = consumerLayoutPlugin(mockOptions);
      const inputHtml = `
<!DOCTYPE html>
<html>
<body>
  <my-app />
</body>
</html>`;

      const result = transformHtml(plugin, inputHtml);
      expect(result).toContain('jh-consumer-layout');
      expect(result).toContain('institution-id=test-institution');
    });

    it('should handle root tag with no attributes', () => {
      const plugin = consumerLayoutPlugin(mockOptions);
      const inputHtml = `
<!DOCTYPE html>
<html>
<body>
  <my-app></my-app>
</body>
</html>`;

      const result = transformHtml(plugin, inputHtml);
      expect(result).toContain('<jh-consumer-layout institution-id=test-institution>');
      expect(result).toContain('<my-app institution-id=test-institution>');
    });
  });

  describe('HTML transformation - creating root tag when missing', () => {
    it('should create root tag inside body when not present', () => {
      const plugin = consumerLayoutPlugin(mockOptions);
      const inputHtml = `
<!DOCTYPE html>
<html>
<body>
</body>
</html>`;

      const result = transformHtml(plugin, inputHtml);
      expect(result).toContain('<jh-consumer-layout institution-id=test-institution>');
      expect(result).toContain('<my-app institution-id=test-institution></my-app>');
      expect(result).toContain('</jh-consumer-layout>');
    });

    it('should handle body tag with attributes', () => {
      const plugin = consumerLayoutPlugin(mockOptions);
      const inputHtml = `
<!DOCTYPE html>
<html>
<body class="main-body" data-theme="dark">
</body>
</html>`;

      const result = transformHtml(plugin, inputHtml);
      expect(result).toContain('class="main-body"');
      expect(result).toContain('data-theme="dark"');
      expect(result).toContain('<jh-consumer-layout institution-id=test-institution>');
    });
  });

  describe('route config injection', () => {
    it('should inject route config script when routeConfigPath is provided', () => {
      const optionsWithRoute = {
        ...mockOptions,
        routeConfigPath: './src/routes.ts',
      };
      const plugin = consumerLayoutPlugin(optionsWithRoute);
      const inputHtml = `
<!DOCTYPE html>
<html>
<body>
  <my-app></my-app>
</body>
</html>`;

      const result = transformHtml(plugin, inputHtml);
      expect(result).toContain('<script type="module">');
      expect(result).toContain("import routeConfig from './src/routes.ts'");
      expect(result).toContain("customElements.whenDefined('jh-consumer-layout')");
      expect(result).toContain("document.querySelector('jh-consumer-layout')");
      expect(result).toContain('consumerLayout.routeConfig = routeConfig');
    });

    it('should not inject route config script when routeConfigPath is not provided', () => {
      const plugin = consumerLayoutPlugin(mockOptions);
      const inputHtml = `
<!DOCTYPE html>
<html>
<body>
  <my-app></my-app>
</body>
</html>`;

      const result = transformHtml(plugin, inputHtml);
      expect(result).not.toContain('<script type="module">');
      expect(result).not.toContain('import routeConfig');
      expect(result).not.toContain('customElements.whenDefined');
    });

    it('should inject route config script before closing body tag', () => {
      const optionsWithRoute = {
        ...mockOptions,
        routeConfigPath: './config/routes.js',
      };
      const plugin = consumerLayoutPlugin(optionsWithRoute);
      const inputHtml = `
<!DOCTYPE html>
<html>
<body>
  <my-app></my-app>
  <script>console.log('existing script');</script>
</body>
</html>`;

      const result = transformHtml(plugin, inputHtml);
      const scriptIndex = result.indexOf('<script type="module">');
      const bodyCloseIndex = result.indexOf('</body>');
      expect(scriptIndex).toBeGreaterThan(0);
      expect(scriptIndex).toBeLessThan(bodyCloseIndex);
    });

    it('should handle route config path with special characters', () => {
      const optionsWithRoute = {
        ...mockOptions,
        routeConfigPath: '@/config/routes-v2.0.ts',
      };
      const plugin = consumerLayoutPlugin(optionsWithRoute);
      const inputHtml = `
<!DOCTYPE html>
<html>
<body>
  <my-app></my-app>
</body>
</html>`;

      const result = transformHtml(plugin, inputHtml);
      expect(result).toContain("import routeConfig from '@/config/routes-v2.0.ts'");
    });
  });

  describe('plugin options', () => {
    it('should accept minimal options (no routeConfigPath)', () => {
      const minimalOptions = {
        rootTagName: 'app-root',
        institutionId: 'bank-123',
      };

      const plugin = consumerLayoutPlugin(minimalOptions);
      expect(plugin).toBeDefined();
      expect(plugin.name).toBe('consumer-layout-plugin');
    });

    it('should accept full options with routeConfigPath', () => {
      const fullOptions = {
        rootTagName: 'app-root',
        institutionId: 'bank-123',
        routeConfigPath: './routes.ts',
      };

      const plugin = consumerLayoutPlugin(fullOptions);
      expect(plugin).toBeDefined();
      expect(plugin.name).toBe('consumer-layout-plugin');
    });

    it('should handle different root tag names', () => {
      const options1 = {
        rootTagName: 'consumer-app',
        institutionId: 'test-id',
      };
      const options2 = {
        rootTagName: 'my-custom-app',
        institutionId: 'test-id',
      };

      const plugin1 = consumerLayoutPlugin(options1);
      const plugin2 = consumerLayoutPlugin(options2);

      expect(plugin1).toBeDefined();
      expect(plugin2).toBeDefined();

      const inputHtml1 = '<body><consumer-app></consumer-app></body>';
      const inputHtml2 = '<body><my-custom-app></my-custom-app></body>';

      const result1 = transformHtml(plugin1, inputHtml1);
      expect(result1).toContain('<consumer-app institution-id=test-id>');

      const result2 = transformHtml(plugin2, inputHtml2);
      expect(result2).toContain('<my-custom-app institution-id=test-id>');
    });

    it('should handle different institution IDs', () => {
      const options = {
        rootTagName: 'my-app',
        institutionId: 'custom-bank-id-456',
      };
      const plugin = consumerLayoutPlugin(options);
      const inputHtml = '<body><my-app></my-app></body>';

      const result = transformHtml(plugin, inputHtml);
      expect(result).toContain('institution-id=custom-bank-id-456');
    });
  });

  describe('edge cases', () => {
    it('should handle HTML with multiple spacing variations', () => {
      const plugin = consumerLayoutPlugin(mockOptions);
      const inputHtml = `
<!DOCTYPE html>
<html>
  <body>
    <my-app    class="test"    ></my-app>
  </body>
</html>`;

      const result = transformHtml(plugin, inputHtml);
      expect(result).toContain('jh-consumer-layout');
      expect(result).toContain('institution-id=test-institution');
    });

    it('should handle HTML with newlines in root tag', () => {
      const plugin = consumerLayoutPlugin(mockOptions);
      const inputHtml = `
<!DOCTYPE html>
<html>
<body>
  <my-app
    class="app"
    data-version="1.0"
  ></my-app>
</body>
</html>`;

      const result = transformHtml(plugin, inputHtml);
      expect(result).toContain('jh-consumer-layout');
      expect(result).toContain('institution-id=test-institution');
    });

    it('should handle empty body tag', () => {
      const plugin = consumerLayoutPlugin(mockOptions);
      const inputHtml = `
<!DOCTYPE html>
<html>
<body></body>
</html>`;

      const result = transformHtml(plugin, inputHtml);
      expect(result).toContain('<jh-consumer-layout institution-id=test-institution>');
      expect(result).toContain('<my-app institution-id=test-institution></my-app>');
    });

    it('should handle HTML without body tag', () => {
      const plugin = consumerLayoutPlugin(mockOptions);
      const inputHtml = `
<!DOCTYPE html>
<html>
  <my-app></my-app>
</html>`;

      const result = transformHtml(plugin, inputHtml);
      // Should still wrap the root tag if found
      expect(result).toContain('jh-consumer-layout');
    });

    it('should handle minified HTML', () => {
      const plugin = consumerLayoutPlugin(mockOptions);
      const inputHtml = '<!DOCTYPE html><html><body><my-app></my-app></body></html>';

      const result = transformHtml(plugin, inputHtml);
      expect(result).toContain('jh-consumer-layout');
      expect(result).toContain('institution-id=test-institution');
    });

    it('should not interfere with other tags named similarly to root tag', () => {
      const plugin = consumerLayoutPlugin(mockOptions);
      const inputHtml = `
<!DOCTYPE html>
<html>
<body>
  <div class="my-app-wrapper">
    <my-app></my-app>
  </div>
</body>
</html>`;

      const result = transformHtml(plugin, inputHtml);
      // Should only wrap the actual my-app tag
      expect(result).toContain('<my-app institution-id=test-institution>');
      // Should preserve the wrapper div unchanged
      expect(result).toContain('<div class="my-app-wrapper">');
    });
  });

  describe('combined transformations', () => {
    it('should wrap root tag and inject route config together', () => {
      const optionsWithRoute = {
        rootTagName: 'my-app',
        institutionId: 'test-institution',
        routeConfigPath: './routes.ts',
      };
      const plugin = consumerLayoutPlugin(optionsWithRoute);
      const inputHtml = `
<!DOCTYPE html>
<html>
<body>
  <my-app></my-app>
</body>
</html>`;

      const result = transformHtml(plugin, inputHtml);

      // Should have wrapper
      expect(result).toContain('<jh-consumer-layout institution-id=test-institution>');
      expect(result).toContain('<my-app institution-id=test-institution>');

      // Should have route config script
      expect(result).toContain('<script type="module">');
      expect(result).toContain("import routeConfig from './routes.ts'");
      expect(result).toContain('consumerLayout.routeConfig = routeConfig');
    });

    it('should create root tag and inject route config when root tag missing', () => {
      const optionsWithRoute = {
        rootTagName: 'my-app',
        institutionId: 'test-institution',
        routeConfigPath: './routes.ts',
      };
      const plugin = consumerLayoutPlugin(optionsWithRoute);
      const inputHtml = `
<!DOCTYPE html>
<html>
<body>
</body>
</html>`;

      const result = transformHtml(plugin, inputHtml);

      // Should create wrapper and root tag
      expect(result).toContain('<jh-consumer-layout institution-id=test-institution>');
      expect(result).toContain('<my-app institution-id=test-institution></my-app>');

      // Should have route config script
      expect(result).toContain('<script type="module">');
      expect(result).toContain("import routeConfig from './routes.ts'");
    });
  });
});
