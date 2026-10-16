// Font loading and per-SVG subsetting, so every image ships only the glyphs it draws.
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import subsetFont from 'subset-font';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const jetbrains = (file) => path.join(root, 'node_modules', 'jetbrains-mono', 'fonts', 'webfonts', file);
const fallback = "ui-monospace,'Cascadia Mono',Menlo,Consolas,monospace";

// Typographic roles. JetBrains Mono (SIL OFL 1.1), no-ligature cut, so `->` and
// `==` read the way they were typed. The full font covers box drawing and arrows.
export const ROLES = {
  mono: { family: 'MH Mono', weight: 400, style: 'normal', fallback, file: jetbrains('JetBrainsMonoNL-Regular.woff2') },
  monoBold: { family: 'MH Mono', weight: 700, style: 'normal', fallback, file: jetbrains('JetBrainsMonoNL-Bold.woff2') },
  monoItalic: { family: 'MH Mono', weight: 400, style: 'italic', fallback, file: jetbrains('JetBrainsMonoNL-Italic.woff2') },
};

const sources = new Map();

export async function loadFonts() {
  await Promise.all(Object.entries(ROLES).map(async ([role, spec]) => sources.set(role, await readFile(spec.file))));
}

const subsetCache = new Map();

/** @font-face rule embedding only `chars` of the given role, as WOFF2. */
export async function fontFace(role, chars) {
  const source = sources.get(role);
  if (!source) throw new Error(`Font role "${role}" not loaded; call loadFonts() first`);
  const text = [...new Set(chars)].sort().join('');
  const key = `${role}:${text}`;
  if (!subsetCache.has(key)) {
    const woff2 = await subsetFont(source, text, { targetFormat: 'woff2' });
    const { family, weight, style } = ROLES[role];
    subsetCache.set(
      key,
      `@font-face{font-family:"${family}";font-style:${style};font-weight:${weight};` +
        `src:url(data:font/woff2;base64,${Buffer.from(woff2).toString('base64')}) format("woff2")}`,
    );
  }
  return subsetCache.get(key);
}

export function fontStack(role) {
  const { family, fallback: rest } = ROLES[role];
  return `"${family}",${rest}`;
}
