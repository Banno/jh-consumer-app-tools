// SPDX-FileCopyrightText: 2025 Jack Henry
//
// SPDX-License-Identifier: Apache-2.0

import { confirm, input, password, select } from '@inquirer/prompts';
import {
  validateProjectName,
  validateUUID,
  validateApiUrl,
  validateRedirectUri,
  validateClientId,
} from './validation.js';

/**
 * Run all interactive prompts and return a structured configuration object.
 *
 * @returns {Promise<{
 *   projectName: string,
 *   institutionId: string,
 *   clientId: string,
 *   clientSecret: string,
 *   apiBaseUrl: string,
 *   redirectUris: string[],
 *   packageManagerChoice: 'npm' | 'yarn (v1)' | 'yarn (v4)',
 * }>}
 */
export async function gatherUserInput() {
  const readyToProceed = await confirm({
    message:
      'Welcome! To create a new consumer app, you will need the following:\n  - Institution ID\n  - Client ID\n  - Client Secret\n  - API Base URL (your Banno Online domain)\n\nIf you do not have these, please contact your implementation provider.\n\nAre you ready to proceed?',
    default: true,
  });

  if (!readyToProceed) {
    return null; // Caller handles exit
  }

  let projectName = process.argv[2];
  if (!projectName || validateProjectName(projectName) !== true) {
    projectName = await input({
      message: 'What is the name of your project? (e.g., my-financial-planner)',
      validate: validateProjectName,
    });
  }

  const institutionId = await input({
    message: 'What is your institution ID?',
    validate: validateUUID,
  });

  const clientId = await input({
    message: 'What is your client ID?',
    validate: validateClientId,
  });

  const clientSecret = await password({
    message: 'What is your client secret?',
  });

  const apiBaseUrl = await input({
    message: 'What is the API base URL?',
    default: 'https://',
    validate: validateApiUrl,
  });

  const redirectUris = [];
  const firstRedirectUri = await input({
    message: 'Enter your primary redirect URI (at least one is required):',
    default: 'https://localhost:8445/auth/cb',
    validate: (value) => validateRedirectUri(value, { required: true }),
  });
  redirectUris.push(firstRedirectUri);

  let askForMore = true;
  while (askForMore) {
    const additionalRedirectUri = await input({
      message: 'Enter an additional redirect URI (optional, leave blank to finish):',
      default: 'https://',
      validate: (value) => validateRedirectUri(value, { required: false }),
    });
    if (additionalRedirectUri && additionalRedirectUri !== 'https://') {
      redirectUris.push(additionalRedirectUri);
    } else {
      askForMore = false;
    }
  }

  const packageManagerChoice = await select({
    message: 'Which package manager would you like to use?',
    choices: [
      { name: 'npm', value: 'npm' },
      { name: 'yarn (v1)', value: 'yarn (v1)' },
      { name: 'yarn (v4)', value: 'yarn (v4)' },
    ],
    default: 'npm',
  });

  return {
    projectName,
    institutionId,
    clientId,
    clientSecret,
    apiBaseUrl,
    redirectUris,
    packageManagerChoice,
  };
}
