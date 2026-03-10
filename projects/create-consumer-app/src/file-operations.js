// SPDX-FileCopyrightText: 2025 Jack Henry
//
// SPDX-License-Identifier: Apache-2.0

import fs from 'fs-extra';
import path from 'path';
import { removeLicenseHeaders } from './license.js';

/** Directories excluded when copying the example app template. */
const EXCLUDED_DIRS = ['dist', 'certs', 'node_modules', 'src/assets'];

/** Files excluded when copying the example app template. */
const EXCLUDED_FILES = ['.env'];

/**
 * Build the filter function used by fs-extra `copy`.
 * Returns `true` for items that should be copied.
 *
 * @param {string} sourceDir - Absolute path to the source directory.
 * @returns {(src: string) => boolean}
 */
export function buildCopyFilter(sourceDir) {
  return (src) => {
    const relativePath = path.relative(sourceDir, src);
    return (
      !EXCLUDED_DIRS.some((dir) => relativePath.startsWith(dir)) &&
      !EXCLUDED_FILES.some((file) => relativePath === file)
    );
  };
}

/**
 * Copy the example-consumer-app template into the target project directory,
 * excluding build artifacts, certificates, node_modules, assets, and .env.
 *
 * @param {string} sourceDir - Absolute path to the example app.
 * @param {string} projectDir - Absolute path to the new project directory.
 */
export async function copyProjectTemplate(sourceDir, projectDir) {
  await fs.copy(sourceDir, projectDir, {
    filter: buildCopyFilter(sourceDir),
  });
}

/**
 * Walk every file in `projectDir`, replacing `example-consumer-app` →
 * `kebabName` and `ExampleConsumerApp` → `pascalName`, and stripping
 * SPDX license headers.  Only writes back files that were actually changed.
 *
 * Returns an array of file paths that contained `example-consumer-app` in
 * their basename (candidates for renaming).
 *
 * @param {string} projectDir
 * @param {string} kebabName
 * @param {string} pascalName
 * @returns {Promise<string[]>} Paths whose basenames need renaming.
 */
export async function transformProjectFiles(projectDir, kebabName, pascalName) {
  const filesToRename = [];
  const dirsToScan = [projectDir];

  while (dirsToScan.length > 0) {
    const currentDir = dirsToScan.pop();
    const items = await fs.readdir(currentDir);

    for (const item of items) {
      const itemPath = path.join(currentDir, item);
      const stat = await fs.stat(itemPath);

      if (stat.isDirectory()) {
        dirsToScan.push(itemPath);
        continue;
      }

      let content = await fs.readFile(itemPath, 'utf8');
      let modified = false;

      if (content.includes('example-consumer-app')) {
        content = content.replace(/example-consumer-app/g, kebabName);
        modified = true;
      }
      if (content.includes('ExampleConsumerApp')) {
        content = content.replace(/ExampleConsumerApp/g, pascalName);
        modified = true;
      }

      const licenseResult = removeLicenseHeaders(content);
      if (licenseResult.modified) {
        content = licenseResult.content;
        modified = true;
      }

      if (modified) {
        await fs.writeFile(itemPath, content);
      }

      if (item.includes('example-consumer-app')) {
        filesToRename.push(itemPath);
      }
    }
  }

  return filesToRename;
}

/**
 * Rename files whose basenames contain `example-consumer-app`,
 * replacing that substring with `kebabName`.
 *
 * @param {string[]} filePaths - Absolute paths returned by `transformProjectFiles`.
 * @param {string} kebabName
 */
export async function renameProjectFiles(filePaths, kebabName) {
  for (const oldPath of filePaths) {
    const newPath = path.join(path.dirname(oldPath), path.basename(oldPath).replace('example-consumer-app', kebabName));
    await fs.rename(oldPath, newPath);
  }
}
