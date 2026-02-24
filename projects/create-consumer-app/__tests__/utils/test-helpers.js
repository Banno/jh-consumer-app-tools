import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Create a temporary test directory.
 * Each call gets a unique timestamped sub-folder under `__tests__/temp/`.
 */
export async function createTempDir(testName) {
  const tempDir = path.join(__dirname, '..', 'temp', testName, Date.now().toString());
  await fs.ensureDir(tempDir);
  return tempDir;
}

/**
 * Clean up a temporary test directory created by `createTempDir`.
 */
export async function cleanupTempDir(dirPath) {
  if (await fs.pathExists(dirPath)) {
    await fs.remove(dirPath);
  }
}
