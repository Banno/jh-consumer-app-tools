import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs-extra';
import path from 'path';
import { createTempDir, cleanupTempDir } from './utils/test-helpers.js';
import { updatePackageJson, createEnvFile, ensureGitignore } from '../src/config.js';

describe('updatePackageJson', () => {
  let tempDir;
  let projectDir;

  beforeEach(async () => {
    tempDir = await createTempDir('config-pkg');
    projectDir = path.join(tempDir, 'project');
    await fs.ensureDir(projectDir);
  });

  afterEach(async () => {
    await cleanupTempDir(tempDir);
  });

  it('sets the project name', async () => {
    await fs.writeJson(path.join(projectDir, 'package.json'), {
      name: 'example-consumer-app',
      private: true,
    });

    await updatePackageJson(projectDir, 'my-app', 'npm@10.0.0');

    const pkg = await fs.readJson(path.join(projectDir, 'package.json'));
    expect(pkg.name).toBe('my-app');
  }, 10000);

  it('removes the private field', async () => {
    await fs.writeJson(path.join(projectDir, 'package.json'), {
      name: 'example-consumer-app',
      private: true,
    });

    await updatePackageJson(projectDir, 'my-app', 'npm@10.0.0');

    const pkg = await fs.readJson(path.join(projectDir, 'package.json'));
    expect(pkg.private).toBeUndefined();
  }, 10000);

  it('sets the packageManager field', async () => {
    await fs.writeJson(path.join(projectDir, 'package.json'), {
      name: 'example-consumer-app',
    });

    await updatePackageJson(projectDir, 'my-app', 'yarn@4.1.0');

    const pkg = await fs.readJson(path.join(projectDir, 'package.json'));
    expect(pkg.packageManager).toBe('yarn@4.1.0');
  }, 10000);

  it('skips packageManager when field is falsy', async () => {
    await fs.writeJson(path.join(projectDir, 'package.json'), {
      name: 'example-consumer-app',
    });

    await updatePackageJson(projectDir, 'my-app', '');

    const pkg = await fs.readJson(path.join(projectDir, 'package.json'));
    expect(pkg.packageManager).toBeUndefined();
  }, 10000);

  it('preserves existing fields', async () => {
    await fs.writeJson(path.join(projectDir, 'package.json'), {
      name: 'example-consumer-app',
      version: '1.0.0',
      dependencies: { chalk: '5.0.0' },
    });

    await updatePackageJson(projectDir, 'my-app', 'npm@10.0.0');

    const pkg = await fs.readJson(path.join(projectDir, 'package.json'));
    expect(pkg.version).toBe('1.0.0');
    expect(pkg.dependencies.chalk).toBe('5.0.0');
  }, 10000);
});

describe('createEnvFile', () => {
  let tempDir;
  let projectDir;

  beforeEach(async () => {
    tempDir = await createTempDir('config-env');
    projectDir = path.join(tempDir, 'project');
    await fs.ensureDir(projectDir);
  });

  afterEach(async () => {
    await cleanupTempDir(tempDir);
  });

  it('creates .env with all expected variables', async () => {
    await createEnvFile(projectDir, {
      institutionId: '12345678-1234-1234-1234-123456789abc',
      clientId: 'my-client',
      clientSecret: 's3cret',
      apiBaseUrl: 'https://api.example.com',
      redirectUris: ['https://localhost:8445/auth/cb'],
    });

    const content = await fs.readFile(path.join(projectDir, '.env'), 'utf8');
    expect(content).toContain('INSTITUTION_ID=12345678-1234-1234-1234-123456789abc');
    expect(content).toContain('CLIENT_ID=my-client');
    expect(content).toContain('CLIENT_SECRET=s3cret');
    expect(content).toContain('API_URL=https://api.example.com');
    expect(content).toContain('REDIRECT_URIS=["https://localhost:8445/auth/cb"]');
  }, 10000);

  it('extracts only the origin (protocol + host) from the API base URL', async () => {
    const cases = [
      { input: 'https://api.example.com', expected: 'https://api.example.com' },
      { input: 'https://api.example.com/', expected: 'https://api.example.com' },
      { input: 'https://api.example.com/some/path', expected: 'https://api.example.com' },
      { input: 'https://api.example.com/path?query=1', expected: 'https://api.example.com' },
      { input: 'https://api.example.com:8443', expected: 'https://api.example.com:8443' },
      { input: 'https://api.example.com:8443/path', expected: 'https://api.example.com:8443' },
    ];

    for (const { input, expected } of cases) {
      const dir = path.join(projectDir, input.replace(/[^a-z0-9]/gi, '_'));
      await fs.ensureDir(dir);

      await createEnvFile(dir, {
        institutionId: 'id',
        clientId: 'cid',
        clientSecret: 'cs',
        apiBaseUrl: input,
        redirectUris: [],
      });

      const content = await fs.readFile(path.join(dir, '.env'), 'utf8');
      const apiUrlLine = content.split('\n').find((l) => l.startsWith('API_URL='));
      expect(apiUrlLine, `input: ${input}`).toBe(`API_URL=${expected}`);
    }
  }, 10000);

  it('handles multiple redirect URIs', async () => {
    await createEnvFile(projectDir, {
      institutionId: 'id',
      clientId: 'cid',
      clientSecret: 'cs',
      apiBaseUrl: 'https://api.example.com',
      redirectUris: ['https://a.com/cb', 'https://b.com/cb'],
    });

    const content = await fs.readFile(path.join(projectDir, '.env'), 'utf8');
    expect(content).toContain('REDIRECT_URIS=["https://a.com/cb","https://b.com/cb"]');
  }, 10000);
});

describe('ensureGitignore', () => {
  let tempDir;
  let projectDir;

  beforeEach(async () => {
    tempDir = await createTempDir('config-gitignore');
    projectDir = path.join(tempDir, 'project');
    await fs.ensureDir(projectDir);
  });

  afterEach(async () => {
    await cleanupTempDir(tempDir);
  });

  it('creates .gitignore with .env if file does not exist', async () => {
    await ensureGitignore(projectDir);

    const content = await fs.readFile(path.join(projectDir, '.gitignore'), 'utf8');
    expect(content).toContain('.env');
  }, 10000);

  it('appends .env entry to existing .gitignore without it', async () => {
    await fs.writeFile(path.join(projectDir, '.gitignore'), 'node_modules\n');

    await ensureGitignore(projectDir);

    const content = await fs.readFile(path.join(projectDir, '.gitignore'), 'utf8');
    expect(content).toContain('node_modules');
    expect(content).toContain('.env');
  }, 10000);

  it('does not duplicate .env entry', async () => {
    await fs.writeFile(path.join(projectDir, '.gitignore'), '.env\nnode_modules\n');

    await ensureGitignore(projectDir);

    const content = await fs.readFile(path.join(projectDir, '.gitignore'), 'utf8');
    const envCount = (content.match(/\.env/g) || []).length;
    // .env and .env.local = 1 occurrence of just ".env" in the original
    expect(envCount).toBe(1);
  }, 10000);
});
