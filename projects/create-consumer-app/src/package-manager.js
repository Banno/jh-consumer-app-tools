// SPDX-FileCopyrightText: 2025 Jack Henry
//
// SPDX-License-Identifier: Apache-2.0

/**
 * Build the `packageManager` field value for package.json.
 *
 * @param {'npm' | 'yarn (v1)' | 'yarn (v4)'} choice
 * @param {string} detectedVersion - The version string returned by the CLI.
 * @returns {string} e.g. "npm@10.2.0"
 */
export function formatPackageManagerField(choice, detectedVersion) {
  if (choice === 'npm') {
    return `npm@${detectedVersion}`;
  }
  // Both yarn choices use the yarn binary version
  return `yarn@${detectedVersion}`;
}

/**
 * Determine the shell command(s) to install dependencies.
 *
 * @param {'npm' | 'yarn (v1)' | 'yarn (v4)'} choice
 * @param {string} detectedVersion - Currently-installed version string.
 * @returns {{ installCommand: string, packageManagerName: string }}
 */
export function getInstallCommand(choice, detectedVersion) {
  if (choice === 'npm') {
    return { installCommand: 'npm install', packageManagerName: 'npm' };
  }

  if (choice === 'yarn (v4)') {
    return {
      installCommand: 'yarn set version berry && yarn install',
      packageManagerName: 'yarn',
    };
  }

  // yarn (v1)
  const majorVersion = parseInt(detectedVersion.split('.')[0], 10);
  const installCommand = majorVersion > 1 ? 'yarn set version classic && yarn install' : 'yarn install';

  return { installCommand, packageManagerName: 'yarn' };
}

/**
 * Return the version-detection command for the chosen package manager.
 *
 * @param {'npm' | 'yarn (v1)' | 'yarn (v4)'} choice
 * @returns {string}
 */
export function getVersionCommand(choice) {
  return choice === 'npm' ? 'npm --version' : 'yarn --version';
}

/**
 * Generate the contents of `.yarnrc.yml` for Yarn v4 (PnP → node-modules).
 *
 * @returns {string}
 */
export function generateYarnRcYml() {
  return 'nodeLinker: node-modules';
}
