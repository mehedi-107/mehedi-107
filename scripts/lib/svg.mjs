// A tiny SVG document builder. Text sits on a monospace character grid, and each
// document embeds subset fonts for exactly the glyphs it uses.
import { fontFace, fontStack, ROLES } from './fonts.mjs';

export const r2 = (v) => Math.round(v * 100) / 100;

export const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const attrs = (o = {}) =>
  Object.entries(o)
    .filter(([, v]) => v !== undefined && v !== null && v !== false)
    .map(([k, v]) => ` ${k}="${typeof v === 'number' ? r2(v) : esc(v)}"`)
    .join('');

export const roleClass = (role) => ({ mono: 'fm', monoBold: 'fb', monoItalic: 'fi' })[role];

export class Canvas {
  constructor({ width, height, title, desc, theme }) {
    Object.assign(this, { width, height, title, desc, theme });
    this.body = [];
    this.css = [];
    this.glyphs = new Map();
    this.ids = 0;
  }

  id(prefix = 'i') {
    return `${prefix}${++this.ids}`;
  }

  add(...markup) {
    this.body.push(...markup);
    return this;
  }

  style(...css) {
    this.css.push(...css);
    return this;
  }

  use(role, text) {
    let set = this.glyphs.get(role);
    if (!set) this.glyphs.set(role, (set = new Set()));
    for (const ch of text) set.add(ch);
  }

  /**
   * A monospace line from [text, fill, role?] runs. Every run sits on the
   * character grid (explicit x), so columns stay aligned even under a fallback
   * font. Returns markup without adding it, so callers can group lines.
   */
  cells(runs, { x, y, size, cw, id, cls, extra } = {}) {
    let col = 0;
    const spans = runs
      .map(([text, fill, role = 'mono']) => {
        const s = String(text);
        this.use(role, s);
        const span = `<tspan${attrs({ x: x + col * cw, class: roleClass(role), fill })}>${esc(s)}</tspan>`;
        col += [...s].length;
        return span;
      })
      .join('');
    return `<text${attrs({ id, y, 'font-size': size, class: cls, ...extra })} xml:space="preserve">${spans}</text>`;
  }

  async render() {
    const faces = [];
    for (const [role, set] of this.glyphs) faces.push(await fontFace(role, [...set, ' ']));
    const roleCss = [...this.glyphs.keys()]
      .map((role) => {
        const { weight, style } = ROLES[role];
        return `.${roleClass(role)}{font-family:${fontStack(role)};font-weight:${weight};font-style:${style}}`;
      })
      .join('');
    return (
      `<svg xmlns="http://www.w3.org/2000/svg" width="${this.width}" height="${this.height}" ` +
      `viewBox="0 0 ${this.width} ${this.height}" role="img" aria-labelledby="title desc">` +
      `<title id="title">${esc(this.title)}</title>` +
      `<desc id="desc">${esc(this.desc ?? this.title)}</desc>` +
      `<style>${faces.join('')}text{font-kerning:none;text-rendering:geometricPrecision}${roleCss}${this.css.join('')}</style>` +
      this.body.join('') +
      `</svg>\n`
    );
  }
}

/** Element helper: el('rect', { x: 1 }) -> <rect x="1"/> */
export const el = (tag, o = {}, children) =>
  children === undefined ? `<${tag}${attrs(o)}/>` : `<${tag}${attrs(o)}>${children}</${tag}>`;
