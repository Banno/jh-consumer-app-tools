---
applyTo: 'projects/create-consumer-app/__tests__/**'
---
# Create Consumer App Testing Instructions

This file provides testing-specific instructions for AI coding agents working with the Create Consumer App test suite.

## Testing Philosophy

The CLI is structured as a thin orchestration layer (`src/index.js`) that delegates to focused, independently testable modules. Testing is done at the **module level** with unit tests — full end-to-end CLI tests are intentionally avoided because mocking multi-step interactive prompts in Vitest ESM is fragile and unreliable.

Every change to CLI logic should have corresponding **unit tests against the specific module** that changed:

| Module | Responsibility | Test file |
|---|---|---|
| `src/validation.js` | Input validators (project name, UUID, URL) | `__tests__/validation.test.js` |
| `src/naming.js` | Name transforms (kebab-case, PascalCase) | `__tests__/naming.test.js` |
| `src/license.js` | SPDX license header removal | `__tests__/license.test.js` |
| `src/file-operations.js` | Copy, filter, transform, rename project files | `__tests__/file-operations.test.js` |
| `src/config.js` | package.json, .env, .gitignore generation | `__tests__/config.test.js` |
| `src/package-manager.js` | Package manager detection & install commands | `__tests__/package-manager.test.js` |
| `src/prompts.js` | Inquirer prompt definitions (thin wrappers) | Not unit-tested; verified manually |
| `src/index.js` | CLI orchestration — wires modules together | Not unit-tested; verified manually |

## Test Structure Guidelines

**DO:**
- Write unit tests that import individual module functions directly
- Create isolated tests with their own temporary directories (for file-operation tests)
- Use descriptive test names that explain the expected behavior
- Test both happy paths and error/edge-case scenarios
- Clean up resources in `afterEach` hooks
- Use the helper functions from `utils/test-helpers.js`
- Set appropriate timeouts for file system operations (second argument to `it()`)
- Test pure functions (validation, naming, license) without any filesystem setup

**DON'T:**
- Write end-to-end tests that mock the full prompt sequence
- Share state between tests
- Leave temporary files after tests complete
- Make tests dependent on external services or installed CLIs
- Use random or non-deterministic test data
- Skip cleanup in afterEach hooks
- Test implementation details instead of behavior

## Test File Organization

Place tests in `__tests__/`, one file per source module:
- `validation.test.js` — input validators
- `naming.test.js` — name transformation functions
- `license.test.js` — license header stripping
- `file-operations.test.js` — file copy, filter, transform, rename
- `config.test.js` — config file generation (package.json, .env, .gitignore)
- `package-manager.test.js` — package manager version and command logic

## Example: Pure Function Test (no filesystem)

```javascript
import { describe, it, expect } from 'vitest';
import { toKebabCase, toPascalCase } from '../src/naming.js';

describe('naming', () => {
  it('converts spaced name to kebab-case', () => {
    expect(toKebabCase('My App')).toBe('my-app');
  });

  it('converts kebab-case to PascalCase', () => {
    expect(toPascalCase('my-app')).toBe('MyApp');
  });
});
```

## Example: Filesystem Test

```javascript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs-extra';
import path from 'path';
import { createTempDir, cleanupTempDir, readProjectFile } from './utils/test-helpers.js';
import { transformFileContents } from '../src/file-operations.js';

describe('file-operations – transformFileContents', () => {
  let tempDir;

  beforeEach(async () => {
    tempDir = await createTempDir('file-ops');
  });

  afterEach(async () => {
    await cleanupTempDir(tempDir);
  });

  it('replaces example-consumer-app with the kebab-case name', async () => {
    const file = path.join(tempDir, 'index.ts');
    await fs.writeFile(file, 'class ExampleConsumerApp {}');
    await transformFileContents(file, 'my-app', 'MyApp');
    expect(await fs.readFile(file, 'utf8')).toBe('class MyApp {}');
  });
});
```

## What to Test

When adding or modifying features, ensure tests cover:

### 1. Input Validation (`validation.js`)
- Valid inputs return `true`
- Invalid inputs return a descriptive error string
- Edge cases (empty strings, special characters, boundary values)

### 2. Name Transformations (`naming.js`)
- Spaces → hyphens, lowercased (kebab)
- Kebab → PascalCase
- Round-trip consistency

### 3. License Removal (`license.js`)
- JS/TS SPDX headers stripped
- HTML/Markdown SPDX headers stripped
- Shell SPDX headers stripped
- Files without headers unchanged

### 4. File Operations (`file-operations.js`)
- Files filtered correctly (excluded dirs/files omitted)
- Content transformations applied to all files
- Files renamed from `example-consumer-app` to project name
- Only modified files are written back

### 5. Configuration (`config.js`)
- package.json name set, `private` removed, `packageManager` set
- .env file contains all variables with correct values
- .gitignore updated only when .env entry missing

### 6. Package Manager (`package-manager.js`)
- Correct install command for npm / yarn v1 / yarn v4
- `packageManager` field string formatted correctly
- Yarn v4 `.yarnrc.yml` content generated

### 7. Error Handling
- Directory conflicts are detected
- Invalid inputs trigger appropriate errors
- File operation errors propagate clearly

## Test Timeouts

For file system operations, set explicit timeouts:

```javascript
it('should handle large file operations', async () => {
  // Test implementation
}, 10000); // 10 second timeout
```

**Note**: Use timeout as second argument (Vitest 3+ syntax), not an options object.

## Common Pitfalls When Writing Tests

1. **Forgetting cleanup**: Always use `cleanupTempDir()` in `afterEach`
2. **Shared state**: Don't reuse variables between tests
3. **Hardcoded paths**: Use `path.join()` and relative paths
4. **Missing awaits**: File operations are async, always await them
5. **Wrong timeout syntax**: Use `it('test', async () => {...}, timeout)` not `{timeout: value}`
6. **Mocking multi-step prompts**: Don't — test the modules the prompts feed into instead

## Getting Help with Tests

If you encounter issues:

1. **Check test output**: Error messages often indicate the problem
2. **Review similar tests**: Look at existing test patterns
3. **Run tests locally**: Use `yarn test:watch` for rapid iteration
4. **Check temp directories**: Investigate `__tests__/temp/` if cleanup fails
5. **Verify file permissions**: Ensure write access to test directories
6. **Run coverage**: Use `yarn test:coverage` to identify untested code paths

