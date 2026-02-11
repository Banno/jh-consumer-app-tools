// SPDX-FileCopyrightText: 2025 Jack Henry
//
// SPDX-License-Identifier: Apache-2.0

// design-system-theme-plugin.ts
import type { Plugin } from 'vite';
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
      const cssPathLight = require.resolve('@jack-henry/jh-tokens/platforms/web/css/jh-theme-light.css');
      const cssPathDark = require.resolve('@jack-henry/jh-tokens/platforms/web/css/jh-theme-dark.css');
      if (fs.existsSync(cssPathLight)) {
        cssContent = fs.readFileSync(cssPathLight, 'utf8');
        basePath = path.dirname(cssPathLight);
      } else {
        console.warn(`ds-theme.css not found at expected path: ${cssPathLight}`);
      }
      if (fs.existsSync(cssPathDark)) {
        const darkContent = fs.readFileSync(cssPathDark, 'utf8');
        cssContent += '\n' +
        `@media (prefers-color-scheme: dark) {
          ${darkContent.replace('.jh-theme-dark', ':root')}
        }`;
      } else {
        console.warn(`ds-theme.css not found at expected path: ${cssPathDark}`);
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

export default async function designSystemThemePlugin(): Promise<Plugin> {
  const dsThemeCSS = loadDsThemes();
  return {
    name: 'design-system-theme-plugin',

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
