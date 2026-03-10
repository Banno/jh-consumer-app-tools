import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const tempDir = path.join(__dirname, '__tests__', 'temp');

export async function teardown() {
  if (await fs.pathExists(tempDir)) {
    await fs.remove(tempDir);
  }
}
