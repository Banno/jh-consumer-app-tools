// SPDX-FileCopyrightText: 2025 Jack Henry
//
// SPDX-License-Identifier: Apache-2.0

// institution-assets-plugin.ts
import type { Plugin } from 'vite';
import fs from 'fs/promises';
import path from 'path';

interface InstitutionAssetsPluginOptions {
  institutionId: string;
  assetsDir?: string; // Directory to save images (relative to project root)
  imageTypes?: string[];
  onlineDomain: string;
}

export interface InstitutionAssetMap {
  light: {
    logo: string;
    backgroundPortrait: string;
    backgroundLandscape: string;
    menuLogo: string;
  };
  dark: {
    logo: string;
    backgroundPortrait: string;
    backgroundLandscape: string;
    menuLogo: string;
  };
}
// Base URL for fetching images - hardcoded to use "default" theme
const base_image_url = (institutionId: string, mode: string, imageType: string) =>
  `https://banno.com/a/consumer/api/v0/institutions/${institutionId}/themes/default/${mode}/${imageType}`;

async function fetchAndSaveImage(institutionId: string, mode: string, imageType: string, targetDir: string) {
  try {
    const url = base_image_url(institutionId, mode, imageType);
    const response = await fetch(url);

    if (!response.ok) {
      console.warn(`Failed to fetch image for ${mode}/${imageType}: ${response.statusText}`);
      return null;
    }

    // Ensure target directory exists
    await fs.mkdir(targetDir, { recursive: true });

    // Determine file extension from content-type
    const contentType = response.headers.get('content-type') || '';
    let extension = '.png'; // Default

    if (contentType.includes('jpeg') || contentType.includes('jpg')) {
      extension = '.jpg';
    } else if (contentType.includes('svg')) {
      extension = '.svg';
    } else if (contentType.includes('webp')) {
      extension = '.webp';
    }

    // Create safe filename
    const safeImageType = imageType.replace(/\//g, '-');
    const filename = `${mode}-${safeImageType}${extension}`;
    const filePath = path.join(targetDir, filename);

    // Get image data as Uint8Array
    const arrayBuffer = await response.arrayBuffer();
    const imageData = new Uint8Array(arrayBuffer);

    // Write file
    await fs.writeFile(filePath, imageData);

    return {
      mode,
      type: imageType,
      path: filePath,
      url: `/${path.relative('public', filePath)}`,
    };
  } catch (error) {
    console.error(`Error fetching/saving image for ${mode}/${imageType}:`, error);
    return null;
  }
}

async function fetchAndSaveImages(
  institutionId: string,
  imageTypes: string[],
  targetDir: string,
): Promise<InstitutionAssetMap> {
  const assetMap: InstitutionAssetMap = {
    light: {
      logo: '',
      backgroundPortrait: '',
      backgroundLandscape: '',
      menuLogo: '',
    },
    dark: {
      logo: '',
      backgroundPortrait: '',
      backgroundLandscape: '',
      menuLogo: '',
    },
  };

  // Fetch all images in parallel
  const promises = [];
  for (const mode of ['light', 'dark']) {
    assetMap[mode] = {};
    for (const imageType of imageTypes) {
      promises.push(
        fetchAndSaveImage(institutionId, mode, imageType, targetDir).then((result) => {
          if (result) {
            // Add to asset map with relative path from project root with key converted to camelCase
            const typeKey = imageType.replace(/\//g, '_').replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
            const relativePath = `/${path.relative(process.cwd(), result.path)}`;
            assetMap[mode][typeKey] = relativePath;
          }
        }),
      );
    }
  }
  await Promise.all(promises);
  return assetMap;
}

export default async function institutionAssetsPlugin(options: InstitutionAssetsPluginOptions): Promise<Plugin> {
  const {
    institutionId,
    assetsDir = 'src/assets/institution',
    imageTypes = ['background/portrait', 'background/landscape', 'logo', 'menu/logo'],
  } = options;

  const assetMap = await fetchAndSaveImages(institutionId, imageTypes, path.resolve(assetsDir));

  return {
    name: 'institution-assets-plugin',
    config(config, env) {
      config.define = config.define || {};
      // Define the ASSETS constant with the fetched asset map
      config.define.ASSETS = assetMap;
      config.define.ONLINE_DOMAIN = JSON.stringify(options.onlineDomain);
    },
  };
}
