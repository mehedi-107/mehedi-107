// Renders every SVG in assets/ (light + dark) and regenerates README.md.
//   npm install
//   npm run build
import { mkdir, writeFile, readdir, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { loadFonts } from './lib/fonts.mjs';
import { themes } from './theme.mjs';
import * as content from './content.mjs';
import { script, segment } from './parts/terminal.mjs';
import { readme } from './readme.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const assets = path.join(root, 'assets');

await loadFonts();
await mkdir(assets, { recursive: true });
for (const file of await readdir(assets)) if (file.endsWith('.svg')) await rm(path.join(assets, file));

const segments = script(content);
const sizes = {};
let bytes = 0;
for (const seg of segments) {
  const name = `term-${seg.id}`;
  for (const theme of Object.values(themes)) {
    const canvas = segment(theme, seg, content);
    const svg = await canvas.render();
    sizes[name] = canvas.width;
    bytes += svg.length;
    await writeFile(path.join(assets, `${name}-${theme.name}.svg`), svg);
  }
}
await writeFile(path.join(root, 'README.md'), readme(content, segments, sizes));
console.log(`README.md + ${segments.length * 2} SVGs (${(bytes / 1024).toFixed(0)} KB)`);
