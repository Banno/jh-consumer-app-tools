---
applyTo:'projects/create-consumer-app/**'
---
# Create Consumer App Instructions

This file provides instructions for AI coding agents working with the Create Consumer App project. The `create-consumer-app` is a CLI tool that scaffolds new consumer applications with proper configuration and project structure.

## Project Overview

The CLI tool (`@jack-henry/create-consumer-app`) creates new consumer applications by:
- Prompting users for configuration (institution ID, client credentials, API URLs, etc.)
- Copying the example-consumer-app template
- Transforming file contents (replacing project names, removing license headers)
- Configuring package.json and environment variables
- Installing dependencies with the user's chosen package manager

## Architecture — Modular Design

The CLI is structured as a thin orchestration layer (`src/index.js`) that composes focused, independently testable modules:

| Module | Exports | Purpose |
|---|---|---|
| `src/validation.js` | `validateProjectName`, `validateUUID`, `validateApiUrl`, `validateRedirectUri`, `validateClientId` | Pure input validation functions |
| `src/naming.js` | `toKebabCase`, `toPascalCase` | Project-name transformations |
| `src/license.js` | `removeLicenseHeaders` | SPDX license header stripping |
| `src/file-operations.js` | `copyProjectTemplate`, `transformProjectFiles`, `renameProjectFiles` | Filesystem copy, filter, transform, rename |
| `src/config.js` | `updatePackageJson`, `createEnvFile`, `ensureGitignore` | Config-file generation |
| `src/package-manager.js` | `getInstallCommand`, `formatPackageManagerField`, `generateYarnRcYml` | Package-manager setup |
| `src/prompts.js` | `gatherUserInput` | Thin wrapper around `@inquirer/prompts` |
| `src/index.js` | `run` | Orchestrates the above modules |

This design means every piece of business logic can be unit-tested in isolation without mocking interactive prompts or `child_process`.

## Development Workflow

### Test-Driven Development

This project follows a test-driven development approach:

1. **Write tests first**: For new features or bug fixes, write tests that capture the expected behavior before implementing the change
2. **Run tests frequently**: Use `yarn test` to verify functionality as you develop
3. **Ensure coverage**: All changes should include corresponding tests

### Key Commands

```bash
yarn test              # Run all tests
yarn test <file>       # Run specific test file
yarn test:coverage     # Check test coverage
yarn start             # Run CLI manually
```



## Key Implementation Patterns

### Project Name Transformations
```javascript
// User input to kebab-case
const kebabCase = projectName.replace(/\s+/g, '-').toLowerCase();

// kebab-case to PascalCase
const pascalCase = kebabCase
  .split('-')
  .map(word => word.charAt(0).toUpperCase() + word.slice(1))
  .join('');
```

### File Filtering
Always exclude when copying example app:
- `dist/` - Build artifacts
- `certs/` - SSL certificates
- `node_modules/` - Dependencies
- `src/assets/` - Asset files
- `.env` - Environment variables

### License Header Removal
Remove SPDX headers from generated files using these patterns:
- JavaScript/TypeScript: `/^\/\/ SPDX-FileCopyrightText:.*\n\/\/\n\/\/ SPDX-License-Identifier:.*\n\n/m`
- HTML/Markdown: `/^<!--\nSPDX-FileCopyrightText:.*\n\nSPDX-License-Identifier:.*\n-->\n\n/m`
- Shell scripts: `/^# SPDX-FileCopyrightText:.*\n#\n# SPDX-License-Identifier:.*\n\n/m`

### Validation Patterns
```javascript
// UUID (institution ID)
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

// Project name (kebab-case friendly)
const PROJECT_NAME_REGEX = /^[a-zA-Z0-9]+(?:[\s-][a-zA-Z0-9]+)*$/;

// API URLs and redirect URIs must start with https://
const isValidUrl = (url) => url.startsWith('https://') && url.length > 8;
```

### Package Manager Handling
- **npm**: Set `packageManager` to `npm@<detected-version>`
- **yarn v1**: Set to `yarn@<version>`, may need `yarn set version classic` if user has v2+
- **yarn v4**: Set to `yarn@<version>`, create `.yarnrc.yml` with `nodeLinker: node-modules`

## Pull Request Review Guidelines

When reviewing PRs for this project, verify:

### 1. Test Coverage
- [ ] All new features have corresponding tests
- [ ] Bug fixes include regression tests
- [ ] Tests are meaningful and test behavior, not implementation
- [ ] All tests pass: `yarn test` shows green
- [ ] Coverage hasn't decreased significantly

### 2. Code Quality
- [ ] Code follows existing patterns and conventions
- [ ] Error handling is appropriate and user-friendly
- [ ] Input validation is thorough
- [ ] No hardcoded values that should be configurable
- [ ] Temporary resources are properly cleaned up

### 3. User Experience
- [ ] Prompt messages are clear and helpful
- [ ] Error messages guide users toward solutions
- [ ] Default values are sensible
- [ ] Validation messages explain what's wrong and how to fix it

### 4. File Operations
- [ ] File filtering logic is correct
- [ ] Transformations are applied to all necessary files
- [ ] No temporary or sensitive files are included
- [ ] .gitignore is properly maintained
- [ ] File permissions are handled correctly

### 5. Cross-Platform Compatibility
- [ ] Path handling uses `path.join()` not string concatenation
- [ ] Line ending differences are handled
- [ ] File permissions work across platforms

### 6. Documentation
- [ ] README or test documentation is updated if needed
- [ ] Complex logic has explanatory comments
- [ ] Breaking changes are clearly noted
- [ ] This instructions file is updated if patterns change


## Common Pitfalls to Avoid

### When Modifying CLI Logic
1. **Breaking changes**: Consider backward compatibility
2. **Validation gaps**: Every user input needs validation
3. **Error swallowing**: Always provide meaningful error messages
4. **File leaks**: Ensure all file operations have error handling
5. **Platform assumptions**: Don't assume Unix-specific behaviors

### When Reviewing PRs
1. **Missing tests**: Don't accept new features without tests
2. **Code coverage**: Check that coverage report shows new code is tested
3. **User experience**: Put yourself in the user's shoes
4. **Documentation**: Ensure instructions are updated for significant changes

## Dependencies

### Production
- `@inquirer/prompts`: Interactive CLI prompts
- `chalk`: Terminal string styling
- `fs-extra`: Enhanced file system operations

### Development
- `vitest`: Test framework
- `@vitest/coverage-v8`: Coverage reporting

Keep dependencies minimal and up-to-date. Test thoroughly when upgrading major versions.

## Getting Help

For general development issues:
- Review existing code patterns in `src/`
- Check the example-consumer-app template structure
- Consult project documentation in README.md

## Summary

The key to maintaining this project is **test-driven development**. Every change should:
- Have tests written before implementation
- Pass all existing tests
- Be manually verified with `yarn start`
- Follow patterns documented in these instructions

Well-tested code ensures the CLI reliably scaffolds projects for our users.
