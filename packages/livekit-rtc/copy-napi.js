import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cross-platform copy directory function
function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Copy src/napi to dist/napi
const srcNapi = path.join(__dirname, 'src', 'napi');
const destNapi = path.join(__dirname, 'dist', 'napi');
copyDir(srcNapi, destNapi);

// Copy src/napi/* to dist/
const entries = fs.readdirSync(srcNapi);
for (const entry of entries) {
  const srcPath = path.join(srcNapi, entry);
  const destPath = path.join(__dirname, 'dist', entry);
  
  const stat = fs.statSync(srcPath);
  if (stat.isFile()) {
    fs.copyFileSync(srcPath, destPath);
  } else if (stat.isDirectory()) {
    copyDir(srcPath, destPath);
  }
}

console.log('✓ Copied napi files');
