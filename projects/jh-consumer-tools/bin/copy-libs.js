// SPDX-FileCopyrightText: 2025 Jack Henry
//
// SPDX-License-Identifier: Apache-2.0

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import { glob } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

/**
 * Copy directory recursively
 */
function copyDirectory(src, dest) {
  if (!fs.existsSync(src)) {
    console.warn(`Source directory does not exist: ${src}`);
    return;
  }

  // Create destination directory if it doesn't exist
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

/**
 * Resolve package path using Node.js resolution
 */
function resolvePackage(packageName) {
  try {
    // Use require.resolve to find the package
    const packageJsonPath = require.resolve(`${packageName}/package.json`);
    return path.dirname(packageJsonPath);
  } catch (error) {
    console.error(`Failed to resolve package ${packageName}:`, error.message);
    return null;
  }
}

/**
 * Get files to copy from package.json "files" entry
 */
function getPackageFiles(packagePath) {
  const packageJsonPath = path.join(packagePath, 'package.json');

  if (!fs.existsSync(packageJsonPath)) {
    console.warn(`  package.json not found in ${packagePath}`);
    return [];
  }

  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    return packageJson.files || [];
  } catch (error) {
    console.error(`  Error reading package.json: ${error.message}`);
    return [];
  }
}

/**
 * Copy files and directories specified in package.json "files" entry
 */
async function copyPackageAssets(packageName, packagePath, destDir) {
  const filesToCopy = getPackageFiles(packagePath);

  if (filesToCopy.length === 0) {
    console.warn(`❌ ${packageName}: No files specified in package.json "files" entry`);
    return false;
  }

  let copiedSomething = false;

  // Resolve glob patterns to actual files
  for (const filePattern of filesToCopy) {
    try {
      // Use glob to find matching files/directories
      const matchedFiles = await glob(filePattern, {
        cwd: packagePath,
        dot: true, // Include hidden files if needed
      });

      for (const matchedFile of matchedFiles) {
        const srcPath = path.join(packagePath, matchedFile);
        const destPath = path.join(destDir, matchedFile);

        if (!fs.existsSync(srcPath)) {
          continue;
        }

        const stat = fs.statSync(srcPath);

        if (stat.isDirectory()) {
          copyDirectory(srcPath, destPath);
        } else {
          // Ensure destination directory exists
          const destDirPath = path.dirname(destPath);
          if (!fs.existsSync(destDirPath)) {
            fs.mkdirSync(destDirPath, { recursive: true });
          }
          fs.copyFileSync(srcPath, destPath);
        }

        copiedSomething = true;
      }
    } catch (error) {
      console.error(`❌ ${packageName}: Error processing pattern ${filePattern}: ${error.message}`);
      return false;
    }
  }

  // Always copy package.json for reference
  const packageJsonSrc = path.join(packagePath, 'package.json');
  const packageJsonDest = path.join(destDir, 'package.json');
  if (fs.existsSync(packageJsonSrc)) {
    // Ensure destination directory exists
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    fs.copyFileSync(packageJsonSrc, packageJsonDest);
    copiedSomething = true;
  }

  if (!copiedSomething) {
    console.warn(`❌ ${packageName}: No files were copied`);
    return false;
  }

  console.log(`✅ ${packageName}: Copied successfully`);
  return true;
}

/**
 * Extract package folder name from package name
 */
function getPackageFolderName(packageName) {
  // Remove @scope/ prefix if present and convert to kebab-case
  return packageName.replace('@', '').replace('/', '-');
}

/**
 * Main function to copy library packages
 */
async function copyLibraries() {
  // Get packages from command line arguments
  const libs = process.argv.slice(2);

  if (libs.length === 0) {
    console.error('❌ No packages or paths specified. Usage: node copy-libs.js <package1> <path1> ...');
    console.log('Example: node copy-libs.js @banno/jha-wc ./vite-plugins/css');
    process.exit(1);
  }

  console.log(`📦 Copying ${libs.length} item${libs.length > 1 ? 's' : ''}...
`);

  const projectRoot = path.resolve(__dirname, '..');
  const distRootDir = path.join(projectRoot, 'dist');
  const componentsDistDir = path.join(distRootDir, 'components');

  // Ensure dist/components directory exists for packages
  if (!fs.existsSync(componentsDistDir)) {
    fs.mkdirSync(componentsDistDir, { recursive: true });
  }

  let successCount = 0;

  for (const libName of libs) {
    if (libName.startsWith('.') || libName.startsWith('/')) {
      // Handle relative paths
      const sourcePath = path.join(projectRoot, libName);
      const destRelativePath = libName.startsWith('../') ? path.basename(libName) : libName;
      const destPath = path.join(distRootDir, destRelativePath);

      if (!fs.existsSync(sourcePath)) {
        console.warn(`⚠️  ${libName}: Source path does not exist: ${sourcePath}`);
        continue;
      }

      try {
        const stat = fs.statSync(sourcePath);
        if (stat.isDirectory()) {
          copyDirectory(sourcePath, destPath);
        } else {
          const destDir = path.dirname(destPath);
          if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir, { recursive: true });
          }
          fs.copyFileSync(sourcePath, destPath);
        }
        console.log(`✅ ${libName}: Copied successfully`);
        successCount++;
      } catch (error) {
        console.error(`❌ ${libName}: Error copying: ${error.message}`);
      }
    } else {
      // Handle node packages (existing logic)
      const packageName = libName;
      const packagePath = resolvePackage(packageName);
      if (!packagePath) {
        console.error(`❌ ${packageName}: Could not resolve package`);
        continue;
      }

      const destFolderName = getPackageFolderName(packageName);
      const destPackageDir = path.join(componentsDistDir, destFolderName);

      const success = await copyPackageAssets(packageName, packagePath, destPackageDir);
      if (success) {
        successCount++;
      }
    }
  }

  console.log(`
📁 Completed: ${successCount}/${libs.length} items copied successfully`);
  if (successCount < libs.length) {
    process.exit(1);
  }
}

// Run the script
copyLibraries().catch((error) => {
  console.error('❌ Error copying libraries:', error);
  process.exit(1);
});
