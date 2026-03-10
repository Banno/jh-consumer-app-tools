// SPDX-FileCopyrightText: 2025 Jack Henry
//
// SPDX-License-Identifier: Apache-2.0

import { ExitPromptError } from '@inquirer/core';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import { exec } from 'child_process';

import { toKebabCase, toPascalCase } from './naming.js';
import { gatherUserInput } from './prompts.js';
import { copyProjectTemplate, transformProjectFiles, renameProjectFiles } from './file-operations.js';
import { updatePackageJson, createEnvFile, ensureGitignore } from './config.js';
import {
  formatPackageManagerField,
  getInstallCommand,
  getVersionCommand,
  generateYarnRcYml,
} from './package-manager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const exampleAppDir = path.resolve(__dirname, '..', 'example-consumer-app');

async function run() {
  try {
    // 1. Gather user input
    const userInput = await gatherUserInput();

    if (!userInput) {
      console.log(chalk.yellow('Exiting setup. Please gather the required information and run the tool again.'));
      process.exit(0);
    }

    const { projectName, institutionId, clientId, clientSecret, apiBaseUrl, redirectUris, packageManagerChoice } =
      userInput;

    // 2. Derive names
    const kebabName = toKebabCase(projectName);
    const pascalName = toPascalCase(kebabName);
    const projectDir = path.resolve(process.cwd(), kebabName);

    // 3. Check for conflicts
    if (fs.existsSync(projectDir)) {
      console.error(chalk.red(`Directory ${kebabName} already exists.`));
      process.exit(1);
    }

    console.log(chalk.blue(`Creating a new consumer app in ${projectDir}`));

    // 4. Copy template
    await copyProjectTemplate(exampleAppDir, projectDir);

    // 5. Transform file contents & collect files to rename
    const filesToRename = await transformProjectFiles(projectDir, kebabName, pascalName);

    // 6. Rename files
    await renameProjectFiles(filesToRename, kebabName);

    // 7. Detect package manager version
    const versionCommand = getVersionCommand(packageManagerChoice);
    const detectedVersion = await new Promise((resolve, reject) => {
      exec(versionCommand, (error, stdout) => {
        if (error) {
          reject(new Error(`Failed to check ${packageManagerChoice === 'npm' ? 'npm' : 'yarn'} version`));
          return;
        }
        resolve(stdout.trim());
      });
    });

    // 8. Update package.json
    const packageManagerField = formatPackageManagerField(packageManagerChoice, detectedVersion);
    await updatePackageJson(projectDir, kebabName, packageManagerField);

    // 9. Create .env
    await createEnvFile(projectDir, { institutionId, clientId, clientSecret, apiBaseUrl, redirectUris });

    // 10. Ensure .gitignore
    await ensureGitignore(projectDir);

    // 11. Yarn v4 config
    if (packageManagerChoice === 'yarn (v4)') {
      fs.writeFileSync(path.join(projectDir, '.yarnrc.yml'), generateYarnRcYml());
    }

    // 12. Install dependencies
    const { installCommand, packageManagerName } = getInstallCommand(packageManagerChoice, detectedVersion);

    console.log(chalk.blue(`Installing dependencies with ${packageManagerName}...`));
    await new Promise((resolve, reject) => {
      const installProcess = exec(installCommand, { cwd: projectDir });

      installProcess.stdout.on('data', (data) => {
        console.log(data);
      });

      installProcess.stderr.on('data', (data) => {
        console.error(data);
      });

      installProcess.on('close', (code) => {
        if (code !== 0) {
          reject(new Error('Dependency installation failed!'));
          return;
        }
        resolve();
      });
    });

    // 13. Success message
    console.log(chalk.green('Project created successfully!'));

    const runCommand = packageManagerName === 'npm' ? 'npm run' : 'yarn';
    console.log(
      chalk.blue(`
Success! Created ${kebabName} at ${projectDir}
Inside that directory, you can run several commands:

  ${runCommand} dev
    Starts the development server.

  ${runCommand} build
    Bundles the app into static files for production.

  ${runCommand} test
    Starts the test runner.

We suggest that you begin by typing:

  cd ${kebabName}
  ${runCommand} dev
`),
    );
  } catch (error) {
    if (error instanceof ExitPromptError) {
      console.log(chalk.yellow('Exiting setup.'));
      process.exit(0);
    } else {
      console.error(chalk.red(error));
      process.exit(1);
    }
  }
}

export { run };
