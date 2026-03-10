import { describe, it, expect } from 'vitest';
import { toKebabCase, toPascalCase } from '../src/naming.js';

describe('toKebabCase', () => {
  it('converts spaces to hyphens and lowercases', () => {
    expect(toKebabCase('My App')).toBe('my-app');
  });

  it('lowercases already-kebab input', () => {
    expect(toKebabCase('my-app')).toBe('my-app');
  });

  it('handles multiple spaces', () => {
    expect(toKebabCase('My  Cool  App')).toBe('my-cool-app');
  });

  it('lowercases uppercase input', () => {
    expect(toKebabCase('MY APP')).toBe('my-app');
  });

  it('handles a single word', () => {
    expect(toKebabCase('App')).toBe('app');
  });

  it('handles a single lowercase word', () => {
    expect(toKebabCase('app')).toBe('app');
  });

  it('handles mixed hyphens and spaces', () => {
    expect(toKebabCase('My-Cool App')).toBe('my-cool-app');
  });
});

describe('toPascalCase', () => {
  it('converts kebab-case to PascalCase', () => {
    expect(toPascalCase('my-app')).toBe('MyApp');
  });

  it('capitalises a single word', () => {
    expect(toPascalCase('app')).toBe('App');
  });

  it('handles multiple segments', () => {
    expect(toPascalCase('my-cool-app')).toBe('MyCoolApp');
  });

  it('handles already-capitalised segments', () => {
    expect(toPascalCase('My-App')).toBe('MyApp');
  });

  it('handles single-letter segments', () => {
    expect(toPascalCase('a-b-c')).toBe('ABC');
  });
});

describe('round-trip consistency', () => {
  it('toKebabCase → toPascalCase produces expected PascalCase', () => {
    const kebab = toKebabCase('Financial Planner');
    const pascal = toPascalCase(kebab);
    expect(kebab).toBe('financial-planner');
    expect(pascal).toBe('FinancialPlanner');
  });
});
