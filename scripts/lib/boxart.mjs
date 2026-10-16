// Draws "ANSI Shadow" block lettering (█ plus double box-drawing lines) as
// shapes, so it tiles perfectly at any line height and any zoom.
import { r2 } from './svg.mjs';

/**
 * @param {string[]} art rows of characters
 * @param {{x:number,y:number,cw:number,ch:number,color:(col:number)=>string,line?:number,gap?:number}} o
 * @returns {string[]} markup per row, so rows can be revealed one at a time
 */
export function boxArt(art, { x, y, cw, ch, color, line = 1.15, gap = 1.7 }) {
  return art.map((row, r) => {
    const out = [];
    const y0 = y + r * ch;
    const y1 = y0 + ch;
    const cy = y0 + ch / 2;
    const chars = [...row];
    for (let i = 0; i < chars.length; ) {
      // Solid blocks: merge a run of same-colored cells into one rect.
      if (chars[i] === '█') {
        let j = i;
        while (j < chars.length && chars[j] === '█' && color(j) === color(i)) j++;
        out.push(`<rect x="${r2(x + i * cw)}" y="${r2(y0)}" width="${r2((j - i) * cw)}" height="${r2(ch + 0.4)}" fill="${color(i)}"/>`);
        i = j;
        continue;
      }
      const x0 = x + i * cw;
      const x1 = x0 + cw;
      const cx = x0 + cw / 2;
      const d = gap;
      const P = (...pts) => pts.map(([px, py], k) => `${k ? 'L' : 'M'}${r2(px)} ${r2(py)}`).join('');
      const paths = {
        '═': [P([x0, cy - d], [x1, cy - d]), P([x0, cy + d], [x1, cy + d])],
        '║': [P([cx - d, y0], [cx - d, y1]), P([cx + d, y0], [cx + d, y1])],
        '╔': [P([x1, cy - d], [cx - d, cy - d], [cx - d, y1]), P([x1, cy + d], [cx + d, cy + d], [cx + d, y1])],
        '╗': [P([x0, cy - d], [cx + d, cy - d], [cx + d, y1]), P([x0, cy + d], [cx - d, cy + d], [cx - d, y1])],
        '╚': [P([cx - d, y0], [cx - d, cy + d], [x1, cy + d]), P([cx + d, y0], [cx + d, cy - d], [x1, cy - d])],
        '╝': [P([cx + d, y0], [cx + d, cy + d], [x0, cy + d]), P([cx - d, y0], [cx - d, cy - d], [x0, cy - d])],
      }[chars[i]];
      if (paths) {
        out.push(
          `<path d="${paths.join('')}" fill="none" stroke="${color(i)}" stroke-width="${line}" stroke-opacity="0.75" stroke-linejoin="miter"/>`,
        );
      }
      i++;
    }
    return out.join('');
  });
}
