// SPDX-FileCopyrightText: 2025 Jack Henry
//
// SPDX-License-Identifier: Apache-2.0

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const PROJECT_NAME_REGEX = /^[a-zA-Z0-9]+(?:[\s-][a-zA-Z0-9]+)*$/;

export const Messages = {
  PROJECT_NAME_INVALID:
    'Name can only contain letters, numbers, spaces, and hyphens, and cannot start, end, or have multiple spaces/hyphens.',
  PROJECT_NAME_REQUIRED: 'Please enter a project name.',
  UUID_INVALID: 'Please enter a valid institution ID (UUID).',
  API_URL_INVALID: 'Please enter a valid API base URL (must start with https://).',
  REDIRECT_URI_INVALID: 'Please enter a valid redirect URI (must start with https://).',
  CLIENT_ID_REQUIRED: 'Please enter a client ID.',
};

/**
 *
 * @param {string} value
 * @param {string} message
 * @returns {true | string}
 */
function validateHttpsUrl(value, message) {
  try {
    const url = new URL(value);
    if (url.protocol === 'https:') {
      return true;
    } else {
      return message;
    }
  } catch {
    return message;
  }
}

/**
 * Validate a project name.
 * @param {string} value
 * @returns {true | string} true if valid, or an error message string.
 */
export function validateProjectName(value) {
  if (!value) {
    return Messages.PROJECT_NAME_REQUIRED;
  }
  if (!PROJECT_NAME_REGEX.test(value)) {
    return Messages.PROJECT_NAME_INVALID;
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
    return Messages.UUID_INVALID;
  }
  return true;
}

/**
 * Validate an API base URL.
 * @param {string} value
 * @returns {true | string}
 */
export function validateApiUrl(value) {
  return validateHttpsUrl(value, Messages.API_URL_INVALID);
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
    return validateHttpsUrl(value, Messages.REDIRECT_URI_INVALID);
  }

  // Optional redirect URI (additional ones)
  if (value === '') {
    return true;
  }
  return validateHttpsUrl(value, Messages.REDIRECT_URI_INVALID);
}

/**
 * Validate that a client ID is non-empty.
 * @param {string} value
 * @returns {true | string}
 */
export function validateClientId(value) {
  if (!value) {
    return Messages.CLIENT_ID_REQUIRED;
  }
  return true;
}
