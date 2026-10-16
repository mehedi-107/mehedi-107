// The profile as a terminal session. The window is cut into horizontal segments
// (one SVG each) so individual rows can be links; stacked, they read as one window.
// Every segment shares one clock, so typing flows from segment to segment.
import { Canvas, el, r2 } from '../lib/svg.mjs';
import { boxArt } from '../lib/boxart.mjs';

export const T = {
  width: 821,
  padX: 24,
  size: 14,
  cw: 8.4, // JetBrains Mono advance: 0.6em
  lh: 24, // at least GitHub's README line height, so stacked rows meet without gaps
  base: 16.8, // baseline offset inside a row
  titlebar: 38,
  top: 12,
  tail: 12,
  status: 28,
  radius: 12,
};

const TIME = { start: 0.4, lead: 0.3, type: 0.034, settle: 0.16, gap: 0.3 };
const PROMPT = [['~ ', 'blue', 'monoBold'], ['❯ ', 'green', 'monoBold']];
const PROMPT_COLS = 4;
const INFO_COL = 25;

const LOGO = [
  '███╗   ███╗██╗  ██╗',
  '████╗ ████║██║  ██║',
  '██╔████╔██║███████║',
  '██║╚██╔╝██║██╔══██║',
  '██║ ╚═╝ ██║██║  ██║',
  '╚═╝     ╚═╝╚═╝  ╚═╝',
];

/** The session, as ordered segments of timed lines. */
export function script({ profile, fetchInfo, projects, awards, stack, contact }) {
  let t = TIME.start;
  const cmd = (text, extra = {}) => {
    const line = { kind: 'cmd', text, at: t, typeAt: t + TIME.lead, dur: [...text].length * TIME.type, ...extra };
    t = line.typeAt + line.dur + TIME.settle;
    return line;
  };
  const out = (runs, extra = {}, step = 0.06) => {
    const line = { kind: 'out', runs, at: t, ...extra };
    t += step;
    return line;
  };
  const gap = () => {
    t += TIME.gap;
    return { kind: 'blank' };
  };

  const top = [
    cmd('whoami'),
    out(
      [[profile.name, 'fg', 'monoBold'], ['  ·  ', 'mute'], [profile.school, 'fg2'], ['  ·  ', 'mute'], [profile.focus, 'fg2']],
      {},
      0,
    ),
    gap(),
    cmd('fetch'),
    out([[profile.user, 'blue', 'monoBold'], ['@', 'fg2'], [profile.host, 'magenta', 'monoBold']], { col: INFO_COL, logo: 0 }, 0.045),
    out([['─'.repeat(42), 'faint']], { col: INFO_COL, logo: 1 }, 0.045),
    ...fetchInfo.map(([k, v], i) => out([[k.padEnd(9), 'cyan'], [v, 'fg']], { col: INFO_COL, logo: i + 2 }, 0.045)),
    out([], { col: INFO_COL, palette: true }, 0),
    gap(),
    cmd('ls -l ~/projects', { rprompt: 'rows are links ↗' }),
  ];

  const rows = projects.map((p) => ({
    id: `work-${p.id}`,
    href: p.href,
    title: `${p.name}/ — ${p.title}`,
    alt: `${p.name}/ (${p.lang}): ${p.about}. Opens ${p.title} on GitHub.`,
    lines: [
      out(
        [['drwxr-xr-x  ', 'mute'], [p.name, 'blue', 'monoBold'], ['/'.padEnd(14 - p.name.length), 'fg2'], [p.lang.padEnd(8), 'yellow'], [p.about, 'fg2']],
        { underline: [12, 12 + p.name.length, 'blue'], hint: '↗' },
        0.08,
      ),
    ],
  }));

  const award = (a) => [[a.date.padEnd(12), 'mute'], [a.place.padEnd(15), a.color, 'monoBold'], [a.event, 'fg'], ['  ·  ', 'mute'], [a.org, 'fg2']];
  const [first, ...rest] = awards;
  const awardSegments = [
    {
      id: 'awards',
      title: 'cat awards.log',
      alt: `cat awards.log — ${first.date}: ${first.place.toLowerCase()}, ${first.event}, ${first.org}.`,
      lines: [gap(), cmd('cat awards.log'), out(award(first), {}, 0.08)],
    },
    ...rest.map((a) => ({
      id: `award-${a.id}`,
      href: a.href,
      title: `${a.place.toLowerCase()} — ${a.event}`,
      alt: `${a.date}: ${a.place.toLowerCase()}, ${a.event}, ${a.org}.${a.href ? ' Opens the team repository.' : ''}`,
      lines: [out(award(a), a.href ? { hint: '↗' } : {}, 0.08)],
    })),
  ];

  const toml = ([key, items]) => {
    const runs = [[key.padEnd(10), 'cyan'], ['= ', 'mute'], ['[', 'fg2']];
    items.forEach((item, i) => runs.push([`"${item}"`, 'green'], [i < items.length - 1 ? ', ' : '', 'mute']));
    runs.push([']', 'fg2']);
    return runs;
  };

  const segments = [
    {
      id: 'top',
      first: true,
      title: `${profile.user}@${profile.host}: ~`,
      alt: `Terminal. whoami: ${profile.name}, ${profile.school}, ${profile.focus}. fetch: ${fetchInfo.map(([k, v]) => `${k} ${v}`).join('; ')}. ls -l ~/projects:`,
      lines: top,
    },
    ...rows,
    ...awardSegments,
    {
      id: 'stack',
      title: 'cat ~/.config/stack.toml',
      alt: `cat ~/.config/stack.toml — ${stack.map(([k, v]) => `${k}: ${v.join(', ')}`).join('; ')}.`,
      lines: [gap(), cmd('cat ~/.config/stack.toml'), ...stack.map((row) => out(toml(row), {}, 0.05)), gap(), cmd(contact.command)],
    },
    {
      id: 'contact',
      href: contact.href,
      title: contact.shown,
      alt: `${contact.shown}: ${contact.hint} on LinkedIn.`,
      lines: [out([['→ ', 'green', 'monoBold'], [contact.shown, 'blue']], { underline: [2, 2 + contact.shown.length, 'blue'], hint: `${contact.hint} ↗` }, 0.1)],
    },
  ];
  segments.push({ id: 'bottom', last: true, title: 'prompt', alt: 'An idle prompt with a blinking cursor.', lines: [gap(), { kind: 'final', at: t }] });
  return segments;
}

/** Renders one segment for one theme. */
export function segment(theme, seg, { profile }) {
  const { width: W, padX, size, cw, lh, base, radius: R } = T;
  const top = seg.first ? T.titlebar + T.top : 0;
  const H = top + seg.lines.length * lh + (seg.last ? T.tail + T.status : 0);
  const c = new Canvas({ width: W, height: H, theme, title: seg.title, desc: seg.alt });
  const col = (k) => theme[k];
  const runsOf = (runs) => runs.map(([text, color, role]) => [text, col(color), role]);
  const css = [];
  const hidden = (id, at) => css.push(`#${id}{animation:on 0s ${r2(at)}s forwards}`);

  // Window: background, then borders on whichever edges this segment owns.
  const L = 0.5;
  const Rt = W - 0.5;
  const Y0 = 0.5;
  const Y1 = H - 0.5;
  const fill =
    (seg.first ? `M${L} ${Y0 + R}Q${L} ${Y0} ${L + R} ${Y0}H${Rt - R}Q${Rt} ${Y0} ${Rt} ${Y0 + R}` : `M${L} 0H${Rt}`) +
    (seg.last ? `V${Y1 - R}Q${Rt} ${Y1} ${Rt - R} ${Y1}H${L + R}Q${L} ${Y1} ${L} ${Y1 - R}` : `V${H}H${L}`) +
    'Z';
  const edgeTop = seg.first ? Y0 + R : 0;
  const edgeBottom = seg.last ? Y1 - R : H;
  const stroke =
    (seg.first ? `M${L} ${Y0 + R}Q${L} ${Y0} ${L + R} ${Y0}H${Rt - R}Q${Rt} ${Y0} ${Rt} ${Y0 + R}` : '') +
    `M${Rt} ${edgeTop}V${edgeBottom}M${L} ${edgeTop}V${edgeBottom}` +
    (seg.last ? `M${Rt} ${Y1 - R}Q${Rt} ${Y1} ${Rt - R} ${Y1}H${L + R}Q${L} ${Y1} ${L} ${Y1 - R}` : '');
  c.add(el('path', { d: fill, fill: theme.window }));

  if (seg.first) {
    const tb = T.titlebar;
    c.add(el('path', { d: `M${L} ${Y0 + R}Q${L} ${Y0} ${L + R} ${Y0}H${Rt - R}Q${Rt} ${Y0} ${Rt} ${Y0 + R}V${tb}H${L}Z`, fill: theme.titlebar }));
    c.add(el('path', { d: `M${L} ${tb + 0.5}H${Rt}`, stroke: theme.edge }));
    theme.lights.forEach((f, i) => c.add(el('circle', { cx: 20 + i * 20, cy: tb / 2, r: 6, fill: f })));
    const title = seg.title;
    c.add(c.cells([[title, theme.fg2]], { x: W / 2 - ([...title].length * 0.6 * 12.5) / 2, y: tb / 2 + 4.5, size: 12.5, cw: 0.6 * 12.5 }));
  }

  seg.lines.forEach((line, i) => {
    const y = top + i * lh;
    const by = y + base;
    if (line.kind === 'cmd' || line.kind === 'final') {
      const g = c.id('g');
      c.add(`<g id="${g}" class="h">`, c.cells(runsOf(PROMPT), { x: padX, y: by, size, cw }));
      if (line.rprompt) {
        const n = [...line.rprompt].length;
        c.add(c.cells([[line.rprompt, theme.mute]], { x: W - padX - n * cw, y: by, size, cw }));
      }
      c.add('</g>');
      hidden(g, line.at);
      const cx = padX + PROMPT_COLS * cw;
      if (line.kind === 'cmd') {
        const n = [...line.text].length;
        const tid = c.id('t');
        const kid = c.id('k');
        c.add(c.cells([[line.text, theme.fg]], { x: cx, y: by, size, cw, id: tid, cls: 'ty' }));
        c.add(el('rect', { id: kid, class: 'h k', x: cx, y: y + 4, width: cw, height: lh - 8, fill: theme.cursor, 'fill-opacity': 0.85 }));
        css.push(`#${tid}{animation:type ${r2(line.dur)}s steps(${n}) ${r2(line.typeAt)}s forwards}`);
        css.push(
          `@keyframes m${kid}{to{transform:translateX(${r2(n * cw)}px)}}`,
          `#${kid}{animation:on 0s ${r2(line.at)}s forwards,m${kid} ${r2(line.dur)}s steps(${n}) ${r2(line.typeAt)}s forwards,off 0s ${r2(line.typeAt + line.dur + 0.12)}s forwards}`,
        );
      } else {
        const kid = c.id('k');
        c.add(el('rect', { id: kid, class: 'h', x: cx, y: y + 4, width: cw, height: lh - 8, fill: theme.cursor, 'fill-opacity': 0.85 }));
        css.push(`#${kid}{animation:on 0s ${r2(line.at)}s forwards,blink 1.1s steps(1) ${r2(line.at)}s infinite}`);
      }
      return;
    }
    if (line.kind !== 'out') return;

    const g = c.id('g');
    const x = padX + (line.col ?? 0) * cw;
    c.add(`<g id="${g}" class="h">`);
    if (line.runs.length) c.add(c.cells(runsOf(line.runs), { x, y: by, size, cw }));
    if (line.underline) {
      const [a, z, color] = line.underline;
      c.add(el('path', { d: `M${r2(x + a * cw)} ${r2(by + 3.5)}H${r2(x + z * cw)}`, stroke: col(color), 'stroke-opacity': 0.5, 'stroke-width': 1, 'stroke-dasharray': '1 2' }));
    }
    if (line.hint) {
      const n = [...line.hint].length;
      c.add(c.cells([[line.hint, theme.mute]], { x: W - padX - n * cw, y: by, size, cw }));
    }
    if (line.palette) {
      ['red', 'orange', 'yellow', 'green', 'teal', 'cyan', 'blue', 'magenta'].forEach((k, j) =>
        c.add(el('rect', { x: r2(x + j * cw * 2.5), y: y + 6, width: r2(cw * 2.5 - 2), height: 12, rx: 2, fill: theme[k] })),
      );
    }
    if (line.logo !== undefined && line.logo < LOGO.length) {
      const art = boxArt(LOGO, { x: padX + 2, y: top + (i - line.logo) * lh + 4, cw: 10, ch: 19.5, color: (k) => (k < 11 ? theme.blue : theme.magenta) });
      c.add(art[line.logo]);
    }
    c.add('</g>');
    hidden(g, line.at);
  });

  if (seg.last) {
    const sy = H - T.status;
    c.add(el('path', { d: `M${L} ${sy}H${Rt}V${Y1 - R}Q${Rt} ${Y1} ${Rt - R} ${Y1}H${L + R}Q${L} ${Y1} ${L} ${Y1 - R}Z`, fill: theme.status }));
    c.add(el('path', { d: `M${L} ${sy + 0.5}H${Rt}`, stroke: theme.edge }));
    const s = 12;
    const scw = 0.6 * s;
    const label = ` ${profile.user} `;
    c.add(el('rect', { x: 10, y: sy + 5, width: r2([...label].length * scw + 4), height: 18, rx: 4, fill: theme.blue }));
    c.add(c.cells([[label, theme.onAccent, 'monoBold']], { x: 12, y: sy + 18, size: s, cw: scw }));
    const tabs = [['1:projects', true], ['2:awards', false], ['3:stack', false]];
    let tx = 24 + [...label].length * scw;
    for (const [name, active] of tabs) {
      c.add(c.cells([[name + (active ? '*' : ''), active ? theme.fg : theme.mute, active ? 'monoBold' : 'mono']], { x: tx, y: sy + 18, size: s, cw: scw }));
      tx += ([...name].length + 3) * scw;
    }
    const right = `${profile.school}  ·  ${profile.motto}`;
    c.add(c.cells([[right, theme.fg2]], { x: W - 14 - [...right].length * scw, y: sy + 18, size: s, cw: scw }));
  }

  c.add(el('path', { d: stroke, fill: 'none', stroke: theme.edge }));

  c.style(
    `@keyframes on{to{visibility:visible}}@keyframes off{to{visibility:hidden}}`,
    `@keyframes type{to{clip-path:inset(0 0 0 0)}}@keyframes blink{50%{opacity:0}}`,
    `@media (prefers-reduced-motion:no-preference){.h{visibility:hidden}.ty{clip-path:inset(0 100% 0 0)}${css.join('')}}`,
    `@media (prefers-reduced-motion:reduce){.k{display:none}}`,
  );
  return c;
}
