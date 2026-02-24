import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs-extra';
import path from 'path';
import { createTempDir, cleanupTempDir } from './utils/test-helpers.js';
import {
  buildCopyFilter,
  copyProjectTemplate,
  transformProjectFiles,
  renameProjectFiles,
} from '../src/file-operations.js';

describe('buildCopyFilter', () => {
  it('allows regular files', () => {
    const filter = buildCopyFilter('/source');
    expect(filter('/source/index.ts')).toBe(true);
    expect(filter('/source/src/main.ts')).toBe(true);
  });

  it('excludes dist directory', () => {
    const filter = buildCopyFilter('/source');
    expect(filter('/source/dist/bundle.js')).toBe(false);
  });

  it('excludes certs directory', () => {
    const filter = buildCopyFilter('/source');
    expect(filter('/source/certs/cert.pem')).toBe(false);
  });

  it('excludes node_modules directory', () => {
    const filter = buildCopyFilter('/source');
    expect(filter('/source/node_modules/pkg/index.js')).toBe(false);
  });

  it('excludes src/assets directory', () => {
    const filter = buildCopyFilter('/source');
    expect(filter('/source/src/assets/logo.png')).toBe(false);
  });

  it('excludes .env file', () => {
    const filter = buildCopyFilter('/source');
    expect(filter('/source/.env')).toBe(false);
  });

  it('allows the source root itself (empty relative path)', () => {
    const filter = buildCopyFilter('/source');
    expect(filter('/source')).toBe(true);
  });
});

describe('copyProjectTemplate', () => {
  let tempDir;
  let sourceDir;
  let projectDir;

  beforeEach(async () => {
    tempDir = await createTempDir('copy-template');
    sourceDir = path.join(tempDir, 'source');
    projectDir = path.join(tempDir, 'project');

    // Create a mini example app structure
    await fs.ensureDir(path.join(sourceDir, 'src'));
    await fs.ensureDir(path.join(sourceDir, 'dist'));
    await fs.ensureDir(path.join(sourceDir, 'certs'));
    await fs.ensureDir(path.join(sourceDir, 'node_modules', 'pkg'));
    await fs.ensureDir(path.join(sourceDir, 'src', 'assets'));

    await fs.writeFile(path.join(sourceDir, 'index.html'), '<html></html>');
    await fs.writeFile(path.join(sourceDir, 'src', 'main.ts'), 'export {};');
    await fs.writeFile(path.join(sourceDir, 'dist', 'bundle.js'), 'bundled');
    await fs.writeFile(path.join(sourceDir, 'certs', 'cert.pem'), 'cert');
    await fs.writeFile(path.join(sourceDir, 'node_modules', 'pkg', 'index.js'), 'pkg');
    await fs.writeFile(path.join(sourceDir, 'src', 'assets', 'logo.png'), 'img');
    await fs.writeFile(path.join(sourceDir, '.env'), 'SECRET=1');
  });

  afterEach(async () => {
    await cleanupTempDir(tempDir);
  });

  it('copies allowed files', async () => {
    await copyProjectTemplate(sourceDir, projectDir);
    expect(await fs.pathExists(path.join(projectDir, 'index.html'))).toBe(true);
    expect(await fs.pathExists(path.join(projectDir, 'src', 'main.ts'))).toBe(true);
  }, 10000);

  it('excludes dist, certs, node_modules, src/assets, .env', async () => {
    await copyProjectTemplate(sourceDir, projectDir);
    expect(await fs.pathExists(path.join(projectDir, 'dist'))).toBe(false);
    expect(await fs.pathExists(path.join(projectDir, 'certs'))).toBe(false);
    expect(await fs.pathExists(path.join(projectDir, 'node_modules'))).toBe(false);
    expect(await fs.pathExists(path.join(projectDir, 'src', 'assets'))).toBe(false);
    expect(await fs.pathExists(path.join(projectDir, '.env'))).toBe(false);
  }, 10000);
});

describe('transformProjectFiles', () => {
  let tempDir;
  let projectDir;

  beforeEach(async () => {
    tempDir = await createTempDir('transform');
    projectDir = path.join(tempDir, 'project');
    await fs.ensureDir(path.join(projectDir, 'src'));
  });

  afterEach(async () => {
    await cleanupTempDir(tempDir);
  });

  it('replaces example-consumer-app with kebab name in file contents', async () => {
    await fs.writeFile(path.join(projectDir, 'package.json'), JSON.stringify({ name: 'example-consumer-app' }));

    await transformProjectFiles(projectDir, 'my-app', 'MyApp');

    const content = await fs.readFile(path.join(projectDir, 'package.json'), 'utf8');
    expect(content).toContain('my-app');
    expect(content).not.toContain('example-consumer-app');
  }, 10000);

  it('replaces ExampleConsumerApp with PascalCase name', async () => {
    await fs.writeFile(path.join(projectDir, 'src', 'main.ts'), 'class ExampleConsumerApp {}');

    await transformProjectFiles(projectDir, 'my-app', 'MyApp');

    const content = await fs.readFile(path.join(projectDir, 'src', 'main.ts'), 'utf8');
    expect(content).toContain('MyApp');
    expect(content).not.toContain('ExampleConsumerApp');
  }, 10000);

  it('removes license headers from files', async () => {
    const fileContent = `// SPDX-FileCopyrightText: 2025 Jack Henry
//
// SPDX-License-Identifier: Apache-2.0

export const x = 1;
`;
    await fs.writeFile(path.join(projectDir, 'src', 'util.ts'), fileContent);

    await transformProjectFiles(projectDir, 'my-app', 'MyApp');

    const content = await fs.readFile(path.join(projectDir, 'src', 'util.ts'), 'utf8');
    expect(content).not.toContain('SPDX');
    expect(content).toContain('export const x = 1;');
  }, 10000);

  it('returns file paths that need renaming', async () => {
    await fs.writeFile(path.join(projectDir, 'src', 'example-consumer-app.ts'), 'export class ExampleConsumerApp {}');

    const filesToRename = await transformProjectFiles(projectDir, 'my-app', 'MyApp');

    expect(filesToRename).toHaveLength(1);
    expect(filesToRename[0]).toContain('example-consumer-app.ts');
  }, 10000);

  it('does not rewrite files that have no changes', async () => {
    const filePath = path.join(projectDir, 'README.md');
    await fs.writeFile(filePath, 'No replacements needed here.');
    const statBefore = await fs.stat(filePath);

    // Small delay so mtime would differ if written
    await new Promise((r) => setTimeout(r, 50));

    await transformProjectFiles(projectDir, 'my-app', 'MyApp');

    const statAfter = await fs.stat(filePath);
    expect(statAfter.mtimeMs).toBe(statBefore.mtimeMs);
  }, 10000);
});

describe('renameProjectFiles', () => {
  let tempDir;
  let projectDir;

  beforeEach(async () => {
    tempDir = await createTempDir('rename');
    projectDir = path.join(tempDir, 'project');
    await fs.ensureDir(path.join(projectDir, 'src'));
  });

  afterEach(async () => {
    await cleanupTempDir(tempDir);
  });

  it('renames files from example-consumer-app to the project name', async () => {
    const oldPath = path.join(projectDir, 'src', 'example-consumer-app.ts');
    await fs.writeFile(oldPath, 'content');

    await renameProjectFiles([oldPath], 'my-app');

    expect(await fs.pathExists(oldPath)).toBe(false);
    expect(await fs.pathExists(path.join(projectDir, 'src', 'my-app.ts'))).toBe(true);
  }, 10000);

  it('handles multiple files', async () => {
    const old1 = path.join(projectDir, 'example-consumer-app.html');
    const old2 = path.join(projectDir, 'src', 'example-consumer-app.ts');
    await fs.writeFile(old1, 'html');
    await fs.writeFile(old2, 'ts');

    await renameProjectFiles([old1, old2], 'cool-app');

    expect(await fs.pathExists(path.join(projectDir, 'cool-app.html'))).toBe(true);
    expect(await fs.pathExists(path.join(projectDir, 'src', 'cool-app.ts'))).toBe(true);
  }, 10000);

  it('handles empty array gracefully', async () => {
    await renameProjectFiles([], 'my-app');
    // No error thrown
  });
});
