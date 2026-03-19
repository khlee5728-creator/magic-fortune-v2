#!/usr/bin/env node

import imagemin from 'imagemin';
import imageminPngquant from 'imagemin-pngquant';
import { readdir, stat } from 'fs/promises';
import { join, extname, basename } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PUBLIC_DIR = join(__dirname, 'public');

// Get mode from command line arguments
const args = process.argv.slice(2);
const modeArg = args.find(arg => arg.startsWith('--mode='));
const MODE = modeArg ? modeArg.split('=')[1] : 'aggressive';

// Optimization modes
const MODES = {
  aggressive: {
    name: 'Aggressive (pngquant quality 60-80%)',
    description: 'Maximum compression, slight quality loss',
    plugin: imageminPngquant({
      quality: [0.6, 0.8],
      speed: 3,
      strip: true,
    }),
  },
  moderate: {
    name: 'Moderate (pngquant quality 70-85%)',
    description: 'Balanced compression and quality',
    plugin: imageminPngquant({
      quality: [0.7, 0.85],
      speed: 4,
      strip: true,
    }),
  },
  safe: {
    name: 'Safe (pngquant quality 80-95%)',
    description: 'Minimal compression, high quality preservation',
    plugin: imageminPngquant({
      quality: [0.8, 0.95],
      speed: 5,
      strip: true,
    }),
  },
};

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

async function getFileSize(filePath) {
  const stats = await stat(filePath);
  return stats.size;
}


async function optimizeWithPlugin(inputPath, plugin) {
  try {
    const result = await imagemin([inputPath], {
      plugins: [plugin],
    });

    if (result && result.length > 0) {
      return result[0].data;
    }
    return null;
  } catch (error) {
    console.error(`Error optimizing ${inputPath}:`, error.message);
    return null;
  }
}

async function processImages() {
  const mode = MODES[MODE];

  if (!mode) {
    console.error(`❌ Invalid mode: ${MODE}`);
    console.log(`Available modes: aggressive, moderate, safe`);
    process.exit(1);
  }

  console.log(`🎨 PNG Optimization Mode: ${mode.name}`);
  console.log(`📝 ${mode.description}\n`);

  let totalOriginalSize = 0;
  let totalOptimizedSize = 0;
  let processedCount = 0;
  let skippedCount = 0;

  async function processDirectory(dirPath, relativePath = '') {
    const entries = await readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dirPath, entry.name);
      const relPath = relativePath ? join(relativePath, entry.name) : entry.name;

      // Skip backup directory
      if (entry.name === '_original-backup') {
        continue;
      }

      if (entry.isDirectory()) {
        await processDirectory(fullPath, relPath);
      } else if (entry.isFile() && extname(entry.name).toLowerCase() === '.png') {
        const originalSize = await getFileSize(fullPath);

        console.log(`Optimizing: ${relPath}`);
        console.log(`  Original: ${formatBytes(originalSize)}`);

        // Use the mode's plugin
        const plugin = mode.plugin;

        const optimizedData = await optimizeWithPlugin(fullPath, plugin);

        if (optimizedData) {
          const optimizedSize = optimizedData.length;

          // Only save if it's actually smaller
          if (optimizedSize < originalSize) {
            const fs = await import('fs/promises');
            await fs.writeFile(fullPath, optimizedData);

            const reduction = ((1 - optimizedSize / originalSize) * 100).toFixed(1);
            console.log(`  Optimized: ${formatBytes(optimizedSize)} (${reduction}% smaller) ✅\n`);

            totalOriginalSize += originalSize;
            totalOptimizedSize += optimizedSize;
            processedCount++;
          } else {
            console.log(`  Skipped: Already optimal ⚠️\n`);
            totalOriginalSize += originalSize;
            totalOptimizedSize += originalSize;
            skippedCount++;
          }
        } else {
          console.log(`  Failed: Could not optimize ❌\n`);
          skippedCount++;
        }
      }
    }
  }

  await processDirectory(PUBLIC_DIR);

  console.log('\n📊 PNG Optimization Summary:');
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`Mode: ${mode.name}`);
  console.log(`Total images processed: ${processedCount}`);
  console.log(`Images skipped (already optimal): ${skippedCount}`);
  console.log(`Original total size: ${formatBytes(totalOriginalSize)}`);
  console.log(`Optimized total size: ${formatBytes(totalOptimizedSize)}`);
  console.log(`Total reduction: ${formatBytes(totalOriginalSize - totalOptimizedSize)}`);
  console.log(`Percentage saved: ${((1 - totalOptimizedSize / totalOriginalSize) * 100).toFixed(1)}%`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
  console.log('✅ PNG optimization complete!');
  console.log('\n💡 Next step: Run "npm run optimize-images" to update WebP files');
}

processImages().catch(error => {
  console.error('❌ Error during PNG optimization:', error);
  process.exit(1);
});
