#!/usr/bin/env node

import { readdir, unlink, stat } from 'fs/promises';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DIST_DIR = join(__dirname, 'dist');

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

async function removePngFiles() {
  console.log('🗑️  Removing PNG files from dist (keeping WebP only)...\n');

  let totalSize = 0;
  let fileCount = 0;

  async function processDirectory(dirPath) {
    const entries = await readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dirPath, entry.name);

      if (entry.isDirectory()) {
        await processDirectory(fullPath);
      } else if (entry.isFile() && extname(entry.name).toLowerCase() === '.png') {
        const size = await getFileSize(fullPath);
        totalSize += size;
        fileCount++;

        console.log(`Removing: ${entry.name} (${formatBytes(size)})`);
        await unlink(fullPath);
      }
    }
  }

  await processDirectory(DIST_DIR);

  console.log('\n📊 Removal Summary:');
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`Total PNG files removed: ${fileCount}`);
  console.log(`Total space saved: ${formatBytes(totalSize)}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
  console.log('✅ PNG removal complete!');
  console.log('⚠️  Note: Browsers without WebP support will not display images.');
}

removePngFiles().catch(error => {
  console.error('❌ Error during removal:', error);
  process.exit(1);
});
