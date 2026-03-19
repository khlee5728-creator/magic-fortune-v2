#!/usr/bin/env node

import sharp from 'sharp';
import { readdir, stat } from 'fs/promises';
import { join, extname, basename } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PUBLIC_DIR = join(__dirname, 'public');

// Image quality settings
const QUALITY_SETTINGS = {
  tarot: 75,        // Tarot cards - high quality needed
  background: 70,   // Backgrounds - good quality
  sprite: 75,       // Sprite sheets - high quality for animation
  character: 75,    // Character images - high quality
  default: 70
};

async function getImageQuality(filename) {
  if (filename.startsWith('card-')) return QUALITY_SETTINGS.tarot;
  if (filename.includes('background')) return QUALITY_SETTINGS.background;
  if (filename.includes('sprite')) return QUALITY_SETTINGS.sprite;
  if (filename.includes('char') || filename.includes('idle')) return QUALITY_SETTINGS.character;
  return QUALITY_SETTINGS.default;
}

async function convertToWebP(inputPath, outputPath, quality) {
  try {
    const info = await sharp(inputPath)
      .webp({ quality, effort: 6 })
      .toFile(outputPath);

    return info;
  } catch (error) {
    console.error(`Error converting ${inputPath}:`, error.message);
    throw error;
  }
}

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

async function processImages() {
  console.log('🎨 Starting image optimization...\n');

  let totalOriginalSize = 0;
  let totalWebPSize = 0;
  let processedCount = 0;

  async function processDirectory(dirPath) {
    const entries = await readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dirPath, entry.name);

      if (entry.isDirectory()) {
        await processDirectory(fullPath);
      } else if (entry.isFile() && extname(entry.name).toLowerCase() === '.png') {
        const baseName = basename(entry.name, '.png');
        const webpPath = join(dirPath, `${baseName}.webp`);

        const originalSize = await getFileSize(fullPath);
        const quality = await getImageQuality(baseName);

        console.log(`Converting: ${entry.name} (quality: ${quality}%)`);

        const info = await convertToWebP(fullPath, webpPath, quality);
        const webpSize = await getFileSize(webpPath);

        totalOriginalSize += originalSize;
        totalWebPSize += webpSize;
        processedCount++;

        const reduction = ((1 - webpSize / originalSize) * 100).toFixed(1);
        console.log(`  ✓ ${formatBytes(originalSize)} → ${formatBytes(webpSize)} (${reduction}% smaller)\n`);
      }
    }
  }

  await processDirectory(PUBLIC_DIR);

  console.log('\n📊 Optimization Summary:');
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`Total images processed: ${processedCount}`);
  console.log(`Original total size: ${formatBytes(totalOriginalSize)}`);
  console.log(`WebP total size: ${formatBytes(totalWebPSize)}`);
  console.log(`Total reduction: ${formatBytes(totalOriginalSize - totalWebPSize)}`);
  console.log(`Percentage saved: ${((1 - totalWebPSize / totalOriginalSize) * 100).toFixed(1)}%`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
  console.log('✅ Image optimization complete!');
}

processImages().catch(error => {
  console.error('❌ Error during optimization:', error);
  process.exit(1);
});
