// SPDX-FileCopyrightText: 2025 Jack Henry
//
// SPDX-License-Identifier: Apache-2.0

import fs from 'fs-extra';
import path from 'path';

/**
 * Update the project's package.json:
 *  - Set `name` to `kebabName`
 *  - Remove the `private` field
 *  - Set the `packageManager` field
 *
 * @param {string} projectDir
 * @param {string} kebabName
 * @param {string} packageManagerField - e.g. "npm@10.2.0"
 */
export async function updatePackageJson(projectDir, kebabName, packageManagerField) {
  const packageJsonPath = path.join(projectDir, 'package.json');
  const packageJson = await fs.readJson(packageJsonPath);

  packageJson.name = kebabName;
  delete packageJson.private;

  if (packageManagerField) {
    packageJson.packageManager = packageManagerField;
  }

  await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
}

/**
 * Create the `.env` file with all configuration variables.
 *
 * @param {string} projectDir
 * @param {object} config
 * @param {string} config.institutionId
 * @param {string} config.clientId
 * @param {string} config.clientSecret
 * @param {string} config.apiBaseUrl - Raw URL entered by the user.
 * @param {string[]} config.redirectUris
 */
export async function createEnvFile(projectDir, { institutionId, clientId, clientSecret, apiBaseUrl, redirectUris }) {
  const baseUrl = new URL(apiBaseUrl);
  const apiUrl = `${baseUrl.protocol}//${baseUrl.host}`;

  const envContent = `INSTITUTION_ID=${institutionId}
CLIENT_ID=${clientId}
CLIENT_SECRET=${clientSecret}
API_URL=${apiUrl}
REDIRECT_URIS=${JSON.stringify(redirectUris)}
`;

  await fs.writeFile(path.join(projectDir, '.env'), envContent);
}

/**
 * Ensure `.env` is listed in `.gitignore`. Creates the file if it doesn't
 * exist, or appends the entry if missing.
 *
 * @param {string} projectDir
 */
export async function ensureGitignore(projectDir) {
  const gitignorePath = path.join(projectDir, '.gitignore');
  let gitignoreContent = '';

  if (await fs.pathExists(gitignorePath)) {
    gitignoreContent = await fs.readFile(gitignorePath, 'utf8');
  }

  if (!gitignoreContent.includes('.env')) {
    gitignoreContent += '\n# Environment variables\n.env\n.env.local\n';
    await fs.writeFile(gitignorePath, gitignoreContent);
  }
}
