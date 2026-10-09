const { getDefaultConfig } = require('expo/metro-config');
const { copyFileSync, mkdirSync, readFileSync } = require('node:fs');
const path = require('node:path');

// MapLibre v6 loads a separate module worker. Metro doesn't rewrite its URL.
// Serve the worker and its sibling module through Expo's public directory.
const packagePath = require.resolve('maplibre-gl/package.json');
const { version } = JSON.parse(readFileSync(packagePath, 'utf8'));
const source = path.join(path.dirname(packagePath), 'dist');
const target = path.join(__dirname, 'public', 'maplibre', version);
mkdirSync(target, { recursive: true });
for (const file of ['maplibre-gl-worker.mjs', 'maplibre-gl-shared.mjs']) {
  copyFileSync(path.join(source, file), path.join(target, file));
}

module.exports = getDefaultConfig(__dirname);
