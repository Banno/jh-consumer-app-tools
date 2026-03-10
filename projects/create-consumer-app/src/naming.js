// SPDX-FileCopyrightText: 2025 Jack Henry
//
// SPDX-License-Identifier: Apache-2.0

/**
 * Convert a project name to kebab-case.
 * Replaces whitespace runs with hyphens and lowercases.
 * @param {string} name
 * @returns {string}
 */
export function toKebabCase(name) {
  return name.replace(/\s+/g, '-').toLowerCase();
}

/**
 * Convert a kebab-case string to PascalCase.
 * @param {string} kebabName
 * @returns {string}
 */
export function toPascalCase(kebabName) {
  return kebabName
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}
