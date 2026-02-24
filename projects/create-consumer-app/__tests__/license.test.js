import { describe, it, expect } from 'vitest';
import { removeLicenseHeaders } from '../src/license.js';

describe('removeLicenseHeaders', () => {
  it('removes JS/TS SPDX headers', () => {
    const input = `// SPDX-FileCopyrightText: 2025 Jack Henry
//
// SPDX-License-Identifier: Apache-2.0

console.log('hello');
`;
    const result = removeLicenseHeaders(input);
    expect(result.modified).toBe(true);
    expect(result.content).toBe("console.log('hello');\n");
  });

  it('removes HTML/Markdown SPDX headers', () => {
    const input = `<!--
SPDX-FileCopyrightText: 2025 Jack Henry

SPDX-License-Identifier: Apache-2.0
-->

<div>hello</div>
`;
    const result = removeLicenseHeaders(input);
    expect(result.modified).toBe(true);
    expect(result.content).toBe('<div>hello</div>\n');
  });

  it('removes shell-script SPDX headers', () => {
    const input = `# SPDX-FileCopyrightText: 2025 Jack Henry
#
# SPDX-License-Identifier: Apache-2.0

echo hello
`;
    const result = removeLicenseHeaders(input);
    expect(result.modified).toBe(true);
    expect(result.content).toBe('echo hello\n');
  });

  it('returns unmodified content when no header present', () => {
    const input = "console.log('no license');\n";
    const result = removeLicenseHeaders(input);
    expect(result.modified).toBe(false);
    expect(result.content).toBe(input);
  });

  it('only removes the first matching header', () => {
    const input = `// SPDX-FileCopyrightText: 2025 Jack Henry
//
// SPDX-License-Identifier: Apache-2.0

// SPDX-FileCopyrightText: 2025 Jack Henry
//
// SPDX-License-Identifier: Apache-2.0

code();
`;
    const result = removeLicenseHeaders(input);
    expect(result.modified).toBe(true);
    // The regex uses /m flag, so only first match is replaced
    expect(result.content).toContain('SPDX-FileCopyrightText');
    expect(result.content).toContain('code();');
  });

  it('handles empty string', () => {
    const result = removeLicenseHeaders('');
    expect(result.modified).toBe(false);
    expect(result.content).toBe('');
  });
});
