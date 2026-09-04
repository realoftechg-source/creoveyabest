const fs = require('fs');
const path = require('path');

const desktopAppDir = path.resolve(__dirname, '..');
const projectRoot = path.resolve(desktopAppDir, '..');
const distDir = path.join(desktopAppDir, 'dist');
const downloadsDir = path.join(projectRoot, 'public', 'downloads');
const targetPath = path.join(downloadsDir, 'CreoveyaSetup.exe');

function findInstaller() {
  if (!fs.existsSync(distDir)) {
    throw new Error(`Build output folder does not exist: ${distDir}`);
  }

  const candidates = fs.readdirSync(distDir)
    .filter((file) => file.toLowerCase().endsWith('.exe'))
    .map((file) => ({
      name: file,
      fullPath: path.join(distDir, file),
      mtimeMs: fs.statSync(path.join(distDir, file)).mtimeMs,
    }))
    .sort((a, b) => b.mtimeMs - a.mtimeMs);

  if (!candidates.length) {
    throw new Error(`No .exe installer found in ${distDir}`);
  }

  return candidates[0].fullPath;
}

function main() {
  const installerSource = findInstaller();

  fs.mkdirSync(downloadsDir, { recursive: true });
  fs.copyFileSync(installerSource, targetPath);

  console.log(`Installer copied to ${targetPath}`);
}

try {
  main();
} catch (error) {
  console.error('[copy-installer] Failed to copy installer:', error.message);
  process.exit(1);
}
