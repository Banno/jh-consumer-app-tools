import { describe, it, expect } from 'vitest';
import {
  formatPackageManagerField,
  getInstallCommand,
  getVersionCommand,
  generateYarnRcYml,
} from '../src/package-manager.js';

describe('formatPackageManagerField', () => {
  it('formats npm', () => {
    expect(formatPackageManagerField('npm', '10.2.0')).toBe('npm@10.2.0');
  });

  it('formats yarn (v1)', () => {
    expect(formatPackageManagerField('yarn (v1)', '1.22.19')).toBe('yarn@1.22.19');
  });

  it('formats yarn (v4)', () => {
    expect(formatPackageManagerField('yarn (v4)', '4.1.0')).toBe('yarn@4.1.0');
  });
});

describe('getInstallCommand', () => {
  it('returns npm install for npm', () => {
    const result = getInstallCommand('npm', '10.2.0');
    expect(result.installCommand).toBe('npm install');
    expect(result.packageManagerName).toBe('npm');
  });

  it('returns berry setup for yarn (v4)', () => {
    const result = getInstallCommand('yarn (v4)', '4.1.0');
    expect(result.installCommand).toBe('yarn set version berry && yarn install');
    expect(result.packageManagerName).toBe('yarn');
  });

  it('returns plain yarn install for yarn (v1) when detected v1', () => {
    const result = getInstallCommand('yarn (v1)', '1.22.19');
    expect(result.installCommand).toBe('yarn install');
    expect(result.packageManagerName).toBe('yarn');
  });

  it('returns classic setup for yarn (v1) when detected v2+', () => {
    const result = getInstallCommand('yarn (v1)', '2.4.3');
    expect(result.installCommand).toBe('yarn set version classic && yarn install');
    expect(result.packageManagerName).toBe('yarn');
  });

  it('returns classic setup for yarn (v1) when detected v4', () => {
    const result = getInstallCommand('yarn (v1)', '4.1.0');
    expect(result.installCommand).toBe('yarn set version classic && yarn install');
    expect(result.packageManagerName).toBe('yarn');
  });
});

describe('getVersionCommand', () => {
  it('returns npm --version for npm', () => {
    expect(getVersionCommand('npm')).toBe('npm --version');
  });

  it('returns yarn --version for yarn (v1)', () => {
    expect(getVersionCommand('yarn (v1)')).toBe('yarn --version');
  });

  it('returns yarn --version for yarn (v4)', () => {
    expect(getVersionCommand('yarn (v4)')).toBe('yarn --version');
  });
});

describe('generateYarnRcYml', () => {
  it('returns nodeLinker setting', () => {
    expect(generateYarnRcYml()).toBe('nodeLinker: node-modules');
  });
});
