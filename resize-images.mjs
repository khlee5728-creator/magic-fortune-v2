#!/usr/bin/env node

import sharp from 'sharp';
import { readdir, stat } from 'fs/promises';
import { join, extname, basename } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PUBLIC_DIR = join(__dirname, 'public');

// Resize configuration based on image type
const RESIZE_CONFIG = {
  // Tarot cards: 1696x2528 → 450x670 (retina-safe for 300px display)
  tarotCard: {
    pattern: /^card-\d+\.png$/,
    width: 450,
    height: null, // Auto-calculate to maintain aspect ratio
    fit: 'inside',
  },
  // Luna talking sprite: 1176x1600 → 960x1440 (4x4 grid, 240x360 per frame)
  lunaTalkingSprite: {
    pattern: /^luna-talking-sprite.*\.png$/,
    width: 960,
    height: 1440,
    fit: 'fill',
  },
  // Noir talking sprite: 1548x1600 → 960x1440
  noirTalkingSprite: {
    pattern: /^noir-talking-sprite.*\.png$/,
    width: 960,
    height: 1440,
    fit: 'fill',
  },
  // Luna flying sprite: 1396x1600 → 1120x1280 (4 columns sprite for loading)
  lunaFlyingSprite: {
    pattern: /^luna-flying-sprite\.png$/,
    width: 1120,
    height: 1280,
    fit: 'fill',
  },
  // Luna tarot shuffle sprite: 1472x1600 → 960x1440
  lunaTarotShuffle: {
    pattern: /^luna-tarot-shuffle-sprite\.png$/,
    width: 960,
    height: 1440,
    fit: 'fill',
  },
};

async function getFileSize(filePath) {
  const stats = await stat(filePath);
  return stats.size;
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getResizeConfig(filename) {
  for (const [key, config] of Object.entries(RESIZE_CONFIG)) {
    if (config.pattern.test(filename)) {
      return config;
    }
  }
  return null;
}

async function resizeImage(inputPath, outputPath, config) {
  try {
    const image = sharp(inputPath);
    const metadata = await image.metadata();

    let resizeOptions = {
      width: config.width,
      fit: config.fit || 'inside',
    };

    if (config.height) {
      resizeOptions.height = config.height;
    }

    // Use temp file to avoid "same file" error
    const tempPath = outputPath + '.tmp';

    await image
      .resize(resizeOptions)
      .png({ quality: 90, compressionLevel: 9 }) // High quality PNG
      .toFile(tempPath);

    const newMetadata = await sharp(tempPath).metadata();

    // Move temp file to final location
    const fs = await import('fs/promises');
    await fs.rename(tempPath, outputPath);

    return {
      originalSize: `${metadata.width}×${metadata.height}`,
      newSize: `${newMetadata.width}×${newMetadata.height}`,
    };
  } catch (error) {
    console.error(`Error resizing ${inputPath}:`, error.message);
    throw error;
  }
}

async function processImages() {
  console.log('🎨 Starting image resizing...\n');

  let totalOriginalSize = 0;
  let totalResizedSize = 0;
  let processedCount = 0;

  async function processDirectory(dirPath, relativePath = '') {
    const entries = await readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dirPath, entry.name);
      const relPath = relativePath ? join(relativePath, entry.name) : entry.name;

      if (entry.isDirectory()) {
        await processDirectory(fullPath, relPath);
      } else if (entry.isFile() && extname(entry.name).toLowerCase() === '.png') {
        const config = getResizeConfig(entry.name);

        if (config) {
          const originalSize = await getFileSize(fullPath);

          console.log(`Resizing: ${relPath}`);
          console.log(`  Config: ${config.width}${config.height ? `×${config.height}` : 'w'} (${config.fit})`);

          const { originalSize: origDim, newSize: newDim } = await resizeImage(
            fullPath,
            fullPath, // Overwrite original
            config
          );

          const resizedSize = await getFileSize(fullPath);

          totalOriginalSize += originalSize;
          totalResizedSize += resizedSize;
          processedCount++;

          const reduction = ((1 - resizedSize / originalSize) * 100).toFixed(1);
          console.log(`  Dimensions: ${origDim} → ${newDim}`);
          console.log(`  Size: ${formatBytes(originalSize)} → ${formatBytes(resizedSize)} (${reduction}% smaller)\n`);
        }
      }
    }
  }

  await processDirectory(PUBLIC_DIR);

  console.log('\n📊 Resize Summary:');
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`Total images resized: ${processedCount}`);
  console.log(`Original total size: ${formatBytes(totalOriginalSize)}`);
  console.log(`Resized total size: ${formatBytes(totalResizedSize)}`);
  console.log(`Total reduction: ${formatBytes(totalOriginalSize - totalResizedSize)}`);
  console.log(`Percentage saved: ${((1 - totalResizedSize / totalOriginalSize) * 100).toFixed(1)}%`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
  console.log('✅ Image resizing complete!');
  console.log('\n💡 Next step: Run "npm run optimize-images" to convert to WebP');
}

processImages().catch(error => {
  console.error('❌ Error during resizing:', error);
  process.exit(1);
});
