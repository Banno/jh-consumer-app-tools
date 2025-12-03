// SPDX-FileCopyrightText: 2025 Jack Henry
//
// SPDX-License-Identifier: Apache-2.0

import { confirm, input, password, select } from '@inquirer/prompts';
import { ExitPromptError } from '@inquirer/core';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import { exec } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const exampleAppDir = path.resolve(__dirname, '..', 'example-consumer-app');

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

async function run() {
  try {
    const readyToProceed = await confirm({
      message:
        'Welcome! To create a new consumer app, you will need the following:\n  - Institution ID\n  - Client ID\n  - Client Secret\n  - API Base URL (your Banno Online domain)\n\nIf you do not have these, please contact your implementation provider.\n\nAre you ready to proceed?',
      default: true,
    });

    if (!readyToProceed) {
      console.log(chalk.yellow('Exiting setup. Please gather the required information and run the tool again.'));
      process.exit(0);
    }

    let projectName = process.argv[2];
    if (!projectName) {
      projectName = await input({
        message: 'What is the name of your project? (e.g., my-financial-planner)',
        validate: (value) => {
          if (!value) {
            return 'Please enter a project name.';
          }
          const validNameRegex = /^[a-zA-Z0-9]+(?:[\s-][a-zA-Z0-9]+)*$/;
          if (!validNameRegex.test(value)) {
            return 'Name can only contain letters, numbers, spaces, and hyphens, and cannot start, end, or have multiple spaces/hyphens.';
          }
          return true;
        },
      });
    }

    const institutionId = await input({
      message: 'What is your institution ID?',
      validate: (value) => {
        if (!value || !UUID_REGEX.test(value)) {
          return 'Please enter a valid institution ID (UUID).';
        }
        return true;
      },
    });

    const clientId = await input({
      message: 'What is your client ID?',
      validate: (value) => {
        if (!value) {
          return 'Please enter a client ID.';
        }
        return true;
      },
    });

    const clientSecret = await password({
      message: 'What is your client secret?',
    });

    const apiBaseUrl = await input({
      message: 'What is the API base URL?',
      default: 'https://',
      validate: (value) => {
        if (!value || value === 'https://') {
          return 'Please enter a complete API base URL.';
        }
        if (!value.startsWith('https://')) {
          return 'The API base URL must start with https://.';
        }
        return true;
      },
    });

    const kebabCaseProjectName = projectName.replace(/\s+/g, '-').toLowerCase();

    const redirectUris = [];
    const firstRedirectUri = await input({
      message: 'Enter your primary redirect URI (at least one is required):',
      default: 'https://',
      validate: (value) => {
        if (!value || value === 'https://') {
          return 'A complete redirect URI is required.';
        }
        if (!value.startsWith('http')) {
          return 'Please enter a valid URL starting with http:// or https://.';
        }
        return true;
      },
    });
    redirectUris.push(firstRedirectUri);

    let askForMore = true;
    while (askForMore) {
      const additionalRedirectUri = await input({
        message: 'Enter an additional redirect URI (optional, leave blank to finish):',
        default: 'https://',
        validate: (value) => {
          // Allow empty string or just the default to exit
          if (value === '' || value === 'https://') {
            return true;
          }
          // If they entered something, it must be a valid URL
          if (!value.startsWith('http')) {
            return 'Please enter a valid URL starting with http:// or https://.';
          }
          return true;
        },
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

    const projectDir = path.resolve(process.cwd(), kebabCaseProjectName);

    if (fs.existsSync(projectDir)) {
      console.error(chalk.red(`Directory ${kebabCaseProjectName} already exists.`));
      process.exit(1);
    }

    console.log(chalk.blue(`Creating a new consumer app in ${projectDir}`));

    await fs.copy(exampleAppDir, projectDir, {
      filter: (src) => {
        const relativePath = path.relative(exampleAppDir, src);
        const excludedDirs = ['dist', 'certs', 'node_modules', 'src/assets'];
        const excludedFiles = ['.env'];
        return (
          !excludedDirs.some((dir) => relativePath.startsWith(dir)) &&
          !excludedFiles.some((file) => relativePath === file)
        );
      },
    });

    const pascalCaseProjectName = kebabCaseProjectName
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');

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
        } else {
          // Replace content
          let content = await fs.readFile(itemPath, 'utf8');
          let modified = false;
          if (content.includes('example-consumer-app')) {
            content = content.replace(/example-consumer-app/g, kebabCaseProjectName);
            modified = true;
          }
          if (content.includes('ExampleConsumerApp')) {
            content = content.replace(/ExampleConsumerApp/g, pascalCaseProjectName);
            modified = true;
          }
          // Remove SPDX license blocks
          // JavaScript/TypeScript: // comments
          const jsLicenseRegex = /^\/\/ SPDX-FileCopyrightText:.*\n\/\/\n\/\/ SPDX-License-Identifier:.*\n\n/m;
          // HTML/Markdown: <!-- --> comments
          const htmlLicenseRegex = /^<!--\nSPDX-FileCopyrightText:.*\n\nSPDX-License-Identifier:.*\n-->\n\n/m;
          // Shell scripts: # comments
          const shellLicenseRegex = /^# SPDX-FileCopyrightText:.*\n#\n# SPDX-License-Identifier:.*\n\n/m;

          if (jsLicenseRegex.test(content)) {
            content = content.replace(jsLicenseRegex, '');
            modified = true;
          } else if (htmlLicenseRegex.test(content)) {
            content = content.replace(htmlLicenseRegex, '');
            modified = true;
          } else if (shellLicenseRegex.test(content)) {
            content = content.replace(shellLicenseRegex, '');
            modified = true;
          }
          if (modified) {
            await fs.writeFile(itemPath, content);
          }

          // Check for rename
          if (item.includes('example-consumer-app')) {
            filesToRename.push(itemPath);
          }
        }
      }
    }

    for (const oldPath of filesToRename) {
      const newPath = path.join(
        path.dirname(oldPath),
        path.basename(oldPath).replace('example-consumer-app', kebabCaseProjectName),
      );
      await fs.rename(oldPath, newPath);
    }

    const packageJsonPath = path.join(projectDir, 'package.json');
    const packageJson = await fs.readJson(packageJsonPath);
    packageJson.name = kebabCaseProjectName;
    delete packageJson.private;
    await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });

    const viteConfigPath = path.join(projectDir, 'vite.config.ts');
    let viteConfig = await fs.readFile(viteConfigPath, 'utf8');

    viteConfig = viteConfig.replace(/institutionId: '.*'/, `institutionId: '${institutionId}'`);
    viteConfig = viteConfig.replace(/client_id: '.*'/, `client_id: '${clientId}'`);
    viteConfig = viteConfig.replace(/apiBaseUrl = '.*'/, `apiBaseUrl = '${apiBaseUrl}'`);
    viteConfig = viteConfig.replace(
      /redirect_uris: \['.*'\]/,
      `redirect_uris: [${redirectUris.map((uri) => `'${uri}'`).join(', ')}]`,
    );

    await fs.writeFile(viteConfigPath, viteConfig);

    // Create .env file with client_secret
    const envPath = path.join(projectDir, '.env');
    const envContent = `VITE_CLIENT_SECRET=${clientSecret}\n`;
    await fs.writeFile(envPath, envContent);

    // Ensure .env is in .gitignore
    const gitignorePath = path.join(projectDir, '.gitignore');
    let gitignoreContent = '';
    if (await fs.pathExists(gitignorePath)) {
      gitignoreContent = await fs.readFile(gitignorePath, 'utf8');
    }
    if (!gitignoreContent.includes('.env')) {
      gitignoreContent += '\n# Environment variables\n.env\n.env.local\n';
      await fs.writeFile(gitignorePath, gitignoreContent);
    }

    let installCommand = '';
    let packageManagerName = '';

    if (packageManagerChoice === 'npm') {
      installCommand = 'npm install';
      packageManagerName = 'npm';
    } else if (packageManagerChoice === 'yarn (v4)') {
      installCommand = 'yarn set version berry && yarn install';
      packageManagerName = 'yarn';
      fs.writeFileSync(path.join(projectDir, '.yarnrc.yml'), 'nodeLinker: node-modules');
    } else {
      // 'yarn (v1)'
      installCommand = 'yarn install';
      packageManagerName = 'yarn';
    }

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

    console.log(chalk.green('Project created successfully!'));

    const runCommand = packageManagerName === 'npm' ? 'npm run' : 'yarn';
    console.log(
      chalk.blue(`
Success! Created ${kebabCaseProjectName} at ${projectDir}
Inside that directory, you can run several commands:

  ${runCommand} dev
    Starts the development server.

  ${runCommand} build
    Bundles the app into static files for production.

  ${runCommand} test
    Starts the test runner.

We suggest that you begin by typing:

  cd ${kebabCaseProjectName}
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

run();
