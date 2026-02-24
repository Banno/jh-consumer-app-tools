import { describe, it, expect } from 'vitest';
import {
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
    expect(validateProjectName('')).toBe('Please enter a project name.');
  });

  it('rejects undefined', () => {
    expect(validateProjectName(undefined)).toBe('Please enter a project name.');
  });

  it('rejects names starting with a hyphen', () => {
    expect(validateProjectName('-my-app')).toContain('Name can only');
  });

  it('rejects names ending with a hyphen', () => {
    expect(validateProjectName('my-app-')).toContain('Name can only');
  });

  it('rejects names with consecutive hyphens', () => {
    expect(validateProjectName('my--app')).toContain('Name can only');
  });

  it('rejects names with special characters', () => {
    expect(validateProjectName('my_app!')).toContain('Name can only');
  });

  it('rejects names starting with a space', () => {
    expect(validateProjectName(' my-app')).toContain('Name can only');
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
    expect(validateUUID('')).toContain('valid institution ID');
  });

  it('rejects undefined', () => {
    expect(validateUUID(undefined)).toContain('valid institution ID');
  });

  it('rejects a UUID with uppercase letters', () => {
    expect(validateUUID('12345678-1234-1234-1234-123456789ABC')).toContain('valid institution ID');
  });

  it('rejects a malformed UUID', () => {
    expect(validateUUID('not-a-uuid')).toContain('valid institution ID');
  });

  it('rejects a UUID missing a segment', () => {
    expect(validateUUID('12345678-1234-1234-123456789abc')).toContain('valid institution ID');
  });
});

describe('validateApiUrl', () => {
  it('accepts a valid https URL', () => {
    expect(validateApiUrl('https://api.example.com')).toBe(true);
  });

  it('rejects empty string', () => {
    expect(validateApiUrl('')).toBe('Please enter a complete API base URL.');
  });

  it('rejects the bare default "https://"', () => {
    expect(validateApiUrl('https://')).toBe('Please enter a complete API base URL.');
  });

  it('rejects http:// URLs', () => {
    expect(validateApiUrl('http://api.example.com')).toBe('The API base URL must start with https://.');
  });

  it('rejects URLs without a protocol', () => {
    expect(validateApiUrl('api.example.com')).toBe('The API base URL must start with https://.');
  });
});

describe('validateRedirectUri', () => {
  describe('required mode', () => {
    it('accepts a valid https URL', () => {
      expect(validateRedirectUri('https://localhost:8445/auth/cb', { required: true })).toBe(true);
    });

    it('rejects empty string', () => {
      expect(validateRedirectUri('', { required: true })).toContain('required');
    });

    it('rejects the bare default', () => {
      expect(validateRedirectUri('https://', { required: true })).toContain('required');
    });

    it('rejects http:// URLs', () => {
      expect(validateRedirectUri('http://localhost', { required: true })).toContain('https://');
    });

    it('rejects plain text', () => {
      expect(validateRedirectUri('not-a-url', { required: true })).toContain('https://');
    });
  });

  describe('optional mode (default)', () => {
    it('accepts empty string (exit signal)', () => {
      expect(validateRedirectUri('')).toBe(true);
    });

    it('accepts the bare default (exit signal)', () => {
      expect(validateRedirectUri('https://')).toBe(true);
    });

    it('accepts a valid https URL', () => {
      expect(validateRedirectUri('https://example.com/cb')).toBe(true);
    });

    it('accepts an http URL', () => {
      expect(validateRedirectUri('http://localhost:3000')).toBe(true);
    });

    it('rejects a non-URL string', () => {
      expect(validateRedirectUri('not-a-url')).toContain('valid URL');
    });
  });
});

describe('validateClientId', () => {
  it('accepts a non-empty string', () => {
    expect(validateClientId('my-client-id')).toBe(true);
  });

  it('rejects empty string', () => {
    expect(validateClientId('')).toContain('client ID');
  });

  it('rejects undefined', () => {
    expect(validateClientId(undefined)).toContain('client ID');
  });
});
