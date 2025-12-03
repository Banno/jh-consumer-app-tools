// SPDX-FileCopyrightText: 2025 Jack Henry
//
// SPDX-License-Identifier: Apache-2.0

// institution-theme-plugin.ts
import type { Plugin } from 'vite';
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
import type { WebserverConfigResponse, ThemeSet } from '../../types/institution';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// map banno-online css vars to design system tokens
const dsMappings = fs.readFileSync(path.resolve(__dirname, '../css/ds-mappings.css'), 'utf-8');

const BannoOnlineStyles = fs.readFileSync(path.resolve(__dirname, '../css/banno-online.css'), 'utf-8');

const jhaWcStyles = fs.readFileSync(path.resolve(__dirname, '../css/fi-theme.css'), 'utf-8');

interface InstitutionThemePluginOptions {
  institutionId: string;
  apiBaseUrl: string;
}

// Helper function to convert camelCase to kebab-case
function camelToKebab(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}

// Helper function to resolve CSS imports and inline them
function inlineCSSImports(cssContent: string, basePath: string): string {
  // Regular expression to match @import statements
  const importRegex = /@import\s+['"]([^'"]+)['"];?\s*/g;

  let inlinedCSS = cssContent;
  let match;

  while ((match = importRegex.exec(cssContent)) !== null) {
    const importPath = match[1];
    const fullImportPath = path.resolve(basePath, importPath);

    try {
      if (fs.existsSync(fullImportPath)) {
        const importedContent = fs.readFileSync(fullImportPath, 'utf8');
        // Recursively inline imports in the imported file
        const inlinedImportContent = inlineCSSImports(importedContent, path.dirname(fullImportPath));
        // Replace the @import statement with the inlined content
        inlinedCSS = inlinedCSS.replace(match[0], inlinedImportContent);
      }
    } catch (error) {
      console.warn(`Warning: Could not inline CSS import ${importPath}:`, error);
    }
  }

  return inlinedCSS;
}

function loadDsThemes(): string {
  try {
    const require = createRequire(import.meta.url);
    let cssContent = '';
    let basePath = '';

    try {
      // Resolve the path to our bundled jha-wc components using package exports
      const cssPath = require.resolve('@jack-henry/jh-tokens/platforms/web/css/jh-theme-light.css');

      if (fs.existsSync(cssPath)) {
        cssContent = fs.readFileSync(cssPath, 'utf8');
        basePath = path.dirname(cssPath);
      } else {
        console.warn(`ds-theme.css not found at expected path: ${cssPath}`);
      }
    } catch (resolveError) {
      console.warn('Could not resolve @jack-henry/jh-tokens path:', resolveError);
    }

    if (!cssContent) {
      console.warn('Warning: Could not find ds-theme.css file in bundled jh-tokens library');
      return '';
    }

    // Inline all imports
    return inlineCSSImports(cssContent, basePath);
  } catch (error) {
    console.error('Error loading ds-theme.css:', error);
    return '';
  }
}

async function fetchWebServerConfig(baseUrl: string, institutionId: string) {
  const response = await fetch(`https://${baseUrl}/api/config/${institutionId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch web server config: ${response.statusText}`);
  }
  return (await response.json()) as WebserverConfigResponse;
}

async function buildInstitutionTheme(themeData: ThemeSet) {
  // Extract light and dark themes from the default theme
  const defaultTheme = themeData.default;
  const lightTheme = defaultTheme.light;
  const darkTheme = defaultTheme.dark;

  let cssVariables = '';

  // Function to process theme properties and convert to CSS variables
  function processThemeProperties(themeObj: any, variableCollector: string[]) {
    // Helper function to convert 8-digit hex to rgba
    function hexToRgba(hex: string): string {
      if (typeof hex === 'string' && /^#[0-9A-Fa-f]{8}$/.test(hex)) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        const a = parseInt(hex.slice(7, 9), 16) / 255;
        return `rgba(${r}, ${g}, ${b}, ${a})`;
      }
      return hex;
    }

    Object.entries(themeObj).forEach(([key, value]) => {
      if (typeof value === 'string' || typeof value === 'number') {
        const kebabKey = camelToKebab(key);
        const processedValue = typeof value === 'string' ? hexToRgba(value) : value;
        variableCollector.push(`  --${kebabKey}: ${processedValue};`);
      } else if (typeof value === 'object' && value !== null) {
        if (Array.isArray(value)) {
          // Handle arrays as gradients - create a linear gradient from the array values
          const kebabKey = camelToKebab(key);
          const gradientStops = value
            .filter((item) => typeof item === 'string' || typeof item === 'number')
            .map((item) => (typeof item === 'string' ? hexToRgba(item) : item));
          if (gradientStops.length > 0) {
            const gradientValue = `linear-gradient(${gradientStops.join(', ')})`;
            variableCollector.push(`  --${kebabKey}: ${gradientValue};`);
          }
        } else {
          // Handle nested objects
          Object.entries(value).forEach(([nestedKey, nestedValue]) => {
            if (typeof nestedValue === 'string' || typeof nestedValue === 'number') {
              const kebabKey = camelToKebab(key);
              const kebabNestedKey = camelToKebab(nestedKey);
              const processedValue = typeof nestedValue === 'string' ? hexToRgba(nestedValue) : nestedValue;
              variableCollector.push(`  --${kebabKey}-${kebabNestedKey}: ${processedValue};`);
            }
          });
        }
      }
    });
  }

  // Process light theme (default)
  const lightVariables: string[] = [];
  processThemeProperties(lightTheme, lightVariables);

  // Process dark theme
  const darkVariables: string[] = [];
  processThemeProperties(darkTheme, darkVariables);

  // Build CSS with light theme as default and dark theme in media query
  cssVariables += ':root {\n';
  cssVariables += lightVariables.join('\n') + '\n';
  cssVariables += '}\n\n';

  if (darkVariables.length > 0) {
    cssVariables += '@media (prefers-color-scheme: dark) {\n';
    cssVariables += '  :root {\n';
    cssVariables += darkVariables.map((variable) => `  ${variable}`).join('\n') + '\n';
    cssVariables += '  }\n';
    cssVariables += '}\n';
  }

  return cssVariables;
}

export default async function institutionThemePlugin(options: InstitutionThemePluginOptions): Promise<Plugin> {
  const webserverConfig = await fetchWebServerConfig(options.apiBaseUrl, options.institutionId);
  const themeCSS = await buildInstitutionTheme(webserverConfig.properties.themes);
  const dsThemeCSS = loadDsThemes();
  return {
    name: 'institution-theme-plugin',

    transformIndexHtml(html) {
      return [
        {
          tag: 'link',
          attrs: {
            rel: 'preload',
            href: `/fonts/roboto-medium-webfont-ea04e4ff.woff2`,
            as: 'font',
            type: 'font/woff2',
            crossorigin: '',
          },
        },
        {
          tag: 'style',
          attrs: { id: 'ds-theme' },
          children: dsThemeCSS,
        },
        {
          tag: 'style',
          attrs: { id: 'banno-style' },
          children: BannoOnlineStyles,
        },
        {
          tag: 'style',
          attrs: { id: 'institution-theme' },
          children: themeCSS,
        },
        {
          tag: 'style',
          attrs: { id: 'jha-wc-theme' },
          children: jhaWcStyles,
        },
        {
          tag: 'style',
          attrs: { id: 'ds-theme-map' },
          children: dsMappings,
        },
        // ensure the background of the body is styled to match the theme color
        {
          tag: 'style',
          attrs: { id: 'page-theme' },
          children: 'body { background-color: var(--jha-background-color); }',
        },
        {
          tag: 'style',
          attrs: { id: 'view-transitions' },
          children: `
          @view-transition {
            navigation: auto;
          }`,
        },
        // inject initial institution config
        {
          tag: 'script',
          children: `window.banno = {web:{config:${JSON.stringify(webserverConfig.properties)}}};`,
        },
        // override jha-platform-font as set by fi-theme above
        {
          tag: 'style',
          children: `
          * {
            --jha-platform-font: 'roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
          }
          `,
        },
        // add the dialog element
        {
          tag: 'dialog',
          injectTo: 'body',
        },
      ];
    },
  };
}
