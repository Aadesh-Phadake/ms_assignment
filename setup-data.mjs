/**
 * setup-data.mjs
 *
 * Downloads orders.json from the data repository into public/.
 * Run: node setup-data.mjs
 */

import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { get } from 'https';

const DATA_URL =
  'https://raw.githubusercontent.com/Juni-juns/orders-explorer-data/main/orders.json';
const OUTPUT = 'public/orders.json';

if (existsSync(OUTPUT)) {
  console.log(`✓ ${OUTPUT} already exists, skipping download.`);
  process.exit(0);
}

if (!existsSync('public')) mkdirSync('public');

console.log(`Downloading orders.json (~17 MB)…`);

function download(url) {
  return new Promise((resolve, reject) => {
    get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return download(res.headers.location).then(resolve, reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode}`));
      }
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

download(DATA_URL)
  .then((buf) => {
    writeFileSync(OUTPUT, buf);
    console.log(`✓ Saved ${OUTPUT} (${(buf.length / 1e6).toFixed(1)} MB)`);
  })
  .catch((err) => {
    console.warn('⚠️  Could not download orders.json automatically:', err.message);
    console.warn('   You can download it manually with: npm run setup');
    process.exit(0);
  });
