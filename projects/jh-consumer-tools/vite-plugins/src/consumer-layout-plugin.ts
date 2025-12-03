// SPDX-FileCopyrightText: 2025 Jack Henry
//
// SPDX-License-Identifier: Apache-2.0

import type { Plugin } from 'vite';

interface ConsumerLayoutPluginOptions {
  rootTagName: string;
  institutionId: string;
  routeConfigPath?: string;
}

export default function consumerLayoutPlugin(options: ConsumerLayoutPluginOptions): Plugin {
  return {
    name: 'consumer-layout-plugin',

    transformIndexHtml: {
      order: 'pre',
      handler(html: string) {
        let transformedHtml = html;

        // Find and wrap the root tag with jh-consumer-layout
        const rootTagOpenRegex = new RegExp(`<${options.rootTagName}([^>]*)>`, 'g');
        const rootTagCloseRegex = new RegExp(`</${options.rootTagName}>`, 'g');

        let hasRootTag = false;

        // Check if root tag exists in the HTML
        if (rootTagOpenRegex.test(transformedHtml)) {
          hasRootTag = true;
          rootTagOpenRegex.lastIndex = 0; // Reset regex

          // Wrap the root tag with jh-consumer-layout
          transformedHtml = transformedHtml.replace(
            rootTagOpenRegex,
            `<jh-consumer-layout institution-id=${options.institutionId}>\n    <${options.rootTagName}$1 institution-id=${options.institutionId}>`,
          );
          transformedHtml = transformedHtml.replace(
            rootTagCloseRegex,
            `</${options.rootTagName}>\n  </jh-consumer-layout>`,
          );
        }

        // If no root tag found, add one inside the body wrapped with jh-consumer-layout
        if (!hasRootTag) {
          transformedHtml = transformedHtml.replace(
            /(<body[^>]*>)/,
            `$1\n  <jh-consumer-layout institution-id=${options.institutionId}>\n    <${options.rootTagName} institution-id=${options.institutionId}></${options.rootTagName}>\n  </jh-consumer-layout>`,
          );
        }

        // Inject route config import script if provided
        if (options.routeConfigPath) {
          const routeConfigScript = `
    <script type="module">
      import routeConfig from '${options.routeConfigPath}';

      // Wait for jh-consumer-layout to be registered and available
      customElements.whenDefined('jh-consumer-layout').then(() => {
        const consumerLayout = document.querySelector('jh-consumer-layout');
        if (consumerLayout) {
          consumerLayout.routeConfig = routeConfig;
        }
      });
    </script>`;

          // Insert script before closing body tag
          transformedHtml = transformedHtml.replace(/(<\/body>)/, `  ${routeConfigScript}\n$1`);
        }

        return transformedHtml;
      },
    },
  };
}
