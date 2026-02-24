// SPDX-FileCopyrightText: 2025 Jack Henry
//
// SPDX-License-Identifier: Apache-2.0

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const PROJECT_NAME_REGEX = /^[a-zA-Z0-9]+(?:[\s-][a-zA-Z0-9]+)*$/;

/**
 * Validate a project name.
 * @param {string} value
 * @returns {true | string} true if valid, or an error message string.
 */
export function validateProjectName(value) {
  if (!value) {
    return 'Please enter a project name.';
  }
  if (!PROJECT_NAME_REGEX.test(value)) {
    return 'Name can only contain letters, numbers, spaces, and hyphens, and cannot start, end, or have multiple spaces/hyphens.';
  }
  return true;
}

/**
 * Validate a UUID (institution ID).
 * @param {string} value
 * @returns {true | string}
 */
export function validateUUID(value) {
  if (!value || !UUID_REGEX.test(value)) {
    return 'Please enter a valid institution ID (UUID).';
  }
  return true;
}

/**
 * Validate an API base URL.
 * @param {string} value
 * @returns {true | string}
 */
export function validateApiUrl(value) {
  if (!value || value === 'https://') {
    return 'Please enter a complete API base URL.';
  }
  if (!value.startsWith('https://')) {
    return 'The API base URL must start with https://.';
  }
  return true;
}

/**
 * Validate a redirect URI.
 * @param {string} value
 * @param {object} [options]
 * @param {boolean} [options.required] - If true, an empty/default value is rejected.
 * @returns {true | string}
 */
export function validateRedirectUri(value, { required = false } = {}) {
  if (required) {
    if (!value || value === 'https://') {
      return 'A complete redirect URI is required.';
    }
    if (!value.startsWith('https')) {
      return 'Please enter a valid URL starting with https://.';
    }
    return true;
  }

  // Optional redirect URI (additional ones)
  if (value === '' || value === 'https://') {
    return true;
  }
  if (!value.startsWith('http')) {
    return 'Please enter a valid URL starting with http:// or https://.';
  }
  return true;
}

/**
 * Validate that a client ID is non-empty.
 * @param {string} value
 * @returns {true | string}
 */
export function validateClientId(value) {
  if (!value) {
    return 'Please enter a client ID.';
  }
  return true;
}
