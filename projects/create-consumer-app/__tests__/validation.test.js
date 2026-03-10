import { describe, it, expect } from 'vitest';
import {
  Messages,
  validateProjectName,
  validateUUID,
  validateApiUrl,
  validateRedirectUri,
  validateClientId,
} from '../src/validation.js';

describe('validateProjectName', () => {
  it('accepts a simple name', () => {
    expect(validateProjectName('my-app')).toBe(true);
  });

  it('accepts a name with spaces', () => {
    expect(validateProjectName('My App')).toBe(true);
  });

  it('accepts a single word', () => {
    expect(validateProjectName('app')).toBe(true);
  });

  it('accepts alphanumeric with hyphens', () => {
    expect(validateProjectName('my-app-2')).toBe(true);
  });

  it('rejects empty string', () => {
    expect(validateProjectName('')).toBe(Messages.PROJECT_NAME_REQUIRED);
  });

  it('rejects undefined', () => {
    expect(validateProjectName(undefined)).toBe(Messages.PROJECT_NAME_REQUIRED);
  });

  it('rejects names starting with a hyphen', () => {
    expect(validateProjectName('-my-app')).toBe(Messages.PROJECT_NAME_INVALID);
  });

  it('rejects names ending with a hyphen', () => {
    expect(validateProjectName('my-app-')).toBe(Messages.PROJECT_NAME_INVALID);
  });

  it('rejects names with consecutive hyphens', () => {
    expect(validateProjectName('my--app')).toBe(Messages.PROJECT_NAME_INVALID);
  });

  it('rejects names with special characters', () => {
    expect(validateProjectName('my_app!')).toBe(Messages.PROJECT_NAME_INVALID);
  });

  it('rejects names starting with a space', () => {
    expect(validateProjectName(' my-app')).toBe(Messages.PROJECT_NAME_INVALID);
  });
});

describe('validateUUID', () => {
  it('accepts a valid UUID', () => {
    expect(validateUUID('12345678-1234-1234-1234-123456789abc')).toBe(true);
  });

  it('accepts a UUID with all zeros', () => {
    expect(validateUUID('00000000-0000-0000-0000-000000000000')).toBe(true);
  });

  it('rejects empty string', () => {
    expect(validateUUID('')).toBe(Messages.UUID_INVALID);
  });

  it('rejects undefined', () => {
    expect(validateUUID(undefined)).toBe(Messages.UUID_INVALID);
  });

  it('rejects a UUID with uppercase letters', () => {
    expect(validateUUID('12345678-1234-1234-1234-123456789ABC')).toBe(Messages.UUID_INVALID);
  });

  it('rejects a malformed UUID', () => {
    expect(validateUUID('not-a-uuid')).toBe(Messages.UUID_INVALID);
  });

  it('rejects a UUID missing a segment', () => {
    expect(validateUUID('12345678-1234-1234-123456789abc')).toBe(Messages.UUID_INVALID);
  });
});

describe('validateApiUrl', () => {
  it('accepts a valid https URL', () => {
    expect(validateApiUrl('https://api.example.com')).toBe(true);
  });

  it('rejects empty string', () => {
    expect(validateApiUrl('')).toBe(Messages.API_URL_INVALID);
  });

  it('rejects the bare default "https://"', () => {
    expect(validateApiUrl('https://')).toBe(Messages.API_URL_INVALID);
  });

  it('rejects http:// URLs', () => {
    expect(validateApiUrl('http://api.example.com')).toBe(Messages.API_URL_INVALID);
  });

  it('rejects URLs without a protocol', () => {
    expect(validateApiUrl('api.example.com')).toBe(Messages.API_URL_INVALID);
  });
});

describe('validateRedirectUri', () => {
  describe('required mode', () => {
    it('accepts a valid https URL', () => {
      expect(validateRedirectUri('https://localhost:8445/auth/cb', { required: true })).toBe(true);
    });

    it('rejects empty string', () => {
      expect(validateRedirectUri('', { required: true })).toBe(Messages.REDIRECT_URI_INVALID);
    });

    it('rejects the bare default', () => {
      expect(validateRedirectUri('https://', { required: true })).toBe(Messages.REDIRECT_URI_INVALID);
    });

    it('rejects http:// URLs', () => {
      expect(validateRedirectUri('http://localhost', { required: true })).toBe(Messages.REDIRECT_URI_INVALID);
    });

    it('rejects plain text', () => {
      expect(validateRedirectUri('not-a-url', { required: true })).toBe(Messages.REDIRECT_URI_INVALID);
    });
  });

  describe('optional mode (default)', () => {
    it('accepts empty string (exit signal)', () => {
      expect(validateRedirectUri('')).toBe(true);
    });

    it('accepts a valid https URL', () => {
      expect(validateRedirectUri('https://example.com/cb')).toBe(true);
    });

    it('rejects an http URL', () => {
      expect(validateRedirectUri('http://localhost:3000')).toBe(Messages.REDIRECT_URI_INVALID);
    });

    it('rejects a non-URL string', () => {
      expect(validateRedirectUri('not-a-url')).toBe(Messages.REDIRECT_URI_INVALID);
    });
  });
});

describe('validateClientId', () => {
  it('accepts a non-empty string', () => {
    expect(validateClientId('my-client-id')).toBe(true);
  });

  it('rejects empty string', () => {
    expect(validateClientId('')).toBe(Messages.CLIENT_ID_REQUIRED);
  });

  it('rejects undefined', () => {
    expect(validateClientId(undefined)).toBe(Messages.CLIENT_ID_REQUIRED);
  });
});
