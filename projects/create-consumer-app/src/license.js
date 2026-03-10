// SPDX-FileCopyrightText: 2025 Jack Henry
//
// SPDX-License-Identifier: Apache-2.0

// JavaScript/TypeScript: // comments
const jsLicenseRegex = /^\/\/ SPDX-FileCopyrightText:.*\n\/\/\n\/\/ SPDX-License-Identifier:.*\n\n/m;
// HTML/Markdown: <!-- --> comments
const htmlLicenseRegex = /^<!--\nSPDX-FileCopyrightText:.*\n\nSPDX-License-Identifier:.*\n-->\n\n/m;
// Shell scripts: # comments
const shellLicenseRegex = /^# SPDX-FileCopyrightText:.*\n#\n# SPDX-License-Identifier:.*\n\n/m;

/**
 * Remove SPDX license header blocks from file content.
 * Supports JS/TS, HTML/Markdown, and shell-script comment styles.
 *
 * @param {string} content - The file content.
 * @returns {{ content: string, modified: boolean }}
 */
export function removeLicenseHeaders(content) {
  if (jsLicenseRegex.test(content)) {
    return { content: content.replace(jsLicenseRegex, ''), modified: true };
  }
  if (htmlLicenseRegex.test(content)) {
    return { content: content.replace(htmlLicenseRegex, ''), modified: true };
  }
  if (shellLicenseRegex.test(content)) {
    return { content: content.replace(shellLicenseRegex, ''), modified: true };
  }
  return { content, modified: false };
}
