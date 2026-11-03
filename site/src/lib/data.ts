// Page data derived from content/*.md. Every string that reaches a template comes from here or from content.
import { blocks, visible, readContent, slug, leadSplit, type Block } from './md';
import images from '../data/images.json';

// ---- Page addresses ----
const base = import.meta.env.BASE_URL.replace(/\/?$/, '/');
export const url = (path = '') => `${base}${path.replace(/^\//, '')}`;

export const imageMeta = images as Record<string, { alt: string; width: number; height: number; widths: number[] }>;

const paras = (bs: Block[]) => bs.filter((b): b is Extract<Block, { t: 'p' }> => b.t === 'p').map((b) => b.text);

// ---- UI labels (content/ui.md) ----
export const ui: Record<string, string> = Object.fromEntries(
  readContent('ui.md').split('\n').filter((l) => /^- [^:]+:/.test(l)).map((l) => { const i = l.indexOf(':'); return [l.slice(2, i).trim(), l.slice(i + 1).trim()]; }),
);

// ---- Cover ----
const cp = paras(visible(blocks(readContent('cover.md'))));
export const cover = { hero: cp[0] ?? '', sub: cp[1] ?? '', label: cp[2] ?? '' };

// ---- Get to know me (contents), shown as one continuous timeline ----
export interface Role { date: string; text: string }
export interface Node { kind: 'chapter' | 'sub'; anchor: string; href: string; title: string; hint: string; years: string; roles: Role[]; photo: string }

/** "Role · Place · Type · Aug 2023 – Feb 2024" -> { text: "Role · Place · Type", date: "Aug 2023 – Feb 2024" } */
export function splitDate(line: string): Role {
  const i = line.lastIndexOf(' · ');
  const tail = i >= 0 ? line.slice(i + 3) : '';
  return /\d{4}/.test(tail) ? { text: line.slice(0, i), date: tail } : { text: line, date: '' };
}
/** only the years, from the earliest to the latest role: "2024 – 2026" */
function yearsOf(roles: Role[]): string {
  const ys = roles.flatMap((r) => r.date.match(/\d{4}/g) ?? []).map(Number);
  if (!ys.length) return '';
  const [a, b] = [Math.min(...ys), Math.max(...ys)];
  return a === b ? String(a) : `${a} – ${b}`;
}

const hrefFor = (anchor: string, title: string) => {
  if (/^ch-0[12]$/.test(anchor) || anchor === 'ch-02-kitchens') return `${url('in-the-making/')}#${anchor}`;
  if (/off the menu/i.test(title)) return url('off-the-menu/');
  if (/why m[uù]a/i.test(title)) return url('why-mua/');
  if (/cup of sake/i.test(title)) return url('why-mua/#contact');
  return `#${anchor}`;
};
export const contents = (() => {
  const bs = visible(blocks(readContent('contents.md')));
  const nodes: Node[] = [];
  let num = '';
  let cur: Node | null = null;
  for (const b of bs) {
    if (b.t === 'h2') {
      const [n, ...t] = b.text.split('·');
      num = n.trim();
      cur = { kind: 'chapter', anchor: `ch-${num}`, href: '', title: t.join('·').trim(), hint: '', years: '', roles: [], photo: '' };
      nodes.push(cur);
    } else if (b.t === 'h3') {
      cur = { kind: 'sub', anchor: /different kitchens/i.test(b.text) ? `ch-${num}-kitchens` : `ch-${num}`, href: '', title: b.text, hint: '', years: '', roles: [], photo: '' };
      nodes.push(cur);
    } else if (b.t === 'p' && cur) cur.hint = b.text;
    else if (b.t === 'ul' && cur) cur.roles.push(...b.items.map(splitDate));
  }
  for (const n of nodes) { n.years = yearsOf(n.roles); n.href = hrefFor(n.anchor, n.title); }
  // Photos by entry: 01, 02 (none on the entry itself), Lam Yên, Different kitchens, 03 (a lily cut-out), 04 (the Pure Rice bottle), 05 (none)
  const ids = ['know-1', '', 'know-2-1', 'know-2-2', 'f-woman', 'mua-pure-rice', ''];
  nodes.forEach((n, i) => { n.photo = ids[i] ?? ''; });
  return { title: (bs.find((b) => b.t === 'h1') as { text: string }).text, nodes };
})();

// ---- Introduction: core skills + how I work ----
export const intro = (() => {
  const bs = visible(blocks(readContent('intro-skills.md')));
  const out: Record<'skills' | 'how', { title: string; items: { lead: string; rest: string }[] }> = {
    skills: { title: '', items: [] }, how: { title: '', items: [] },
  };
  let cur: 'skills' | 'how' | null = null;
  for (const b of bs) {
    if (b.t === 'h2') { cur = /skill/i.test(b.text) ? 'skills' : 'how'; out[cur].title = b.text; }
    else if (b.t === 'p' && cur) { const { lead, rest } = leadSplit(b.text); out[cur].items.push({ lead, rest }); }
  }
  return out;
})();

// ---- Side pages (sidepath panel) ----
export interface SidePage { name: string; slug: string; body: string[]; wantsPhoto: boolean; url: string; images: string[]; after: boolean; end: boolean }
export const sidePages: SidePage[] = (() => {
  const out: SidePage[] = [];
  let cur: SidePage | null = null;
  for (const b of blocks(readContent('side-pages.md'))) {
    if (b.t === 'h2') {
      const m = /^\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)$/.exec(b.text);   // a heading can be a link: the panel title then opens that address
      cur = { name: m ? m[1] : b.text, slug: slug(m ? m[1] : b.text), body: [], wantsPhoto: false, url: m ? m[2] : '', images: [], after: false, end: false };
      out.push(cur);
    }
    else if (cur && b.t === 'p') cur.body.push(b.text);
    else if (cur && b.t === 'note') {
      const im = /^BUILD NOTE: IMAGES\s+(AFTER\s+|END\s+)?(.*)$/.exec(b.text);     // photos of a panel (image ids, in order); "AFTER": photo n comes after paragraph n; "END": all photos after the last paragraph; otherwise the first photo is on top
      if (im) { cur.images = im[2].trim().split(/\s+/); cur.after = /^AFTER/.test(im[1] ?? ''); cur.end = /^END/.test(im[1] ?? ''); }
      else if (/photo/i.test(b.text)) cur.wantsPhoto = true;
    }
  }
  for (const p of out) if (p.images.length) p.wantsPhoto = false;
  return out;
})();

// ---- Chapters that have been designed so far (anchors) ----
export const BUILT = new Set(['ch-01', 'ch-02', 'ch-02-kitchens', 'ch-03', 'ch-04', 'ch-05']);

// ---- Chapter 01: It started with culture ----
export const ch01 = (() => {
  const raw = readContent('ch01-it-started-with-culture.md');
  const bs = blocks(raw);
  const vis = visible(bs);
  const h1 = (vis.find((b) => b.t === 'h1') as { text: string }).text;
  const [num, ...t] = h1.split('·');
  const sec: Record<string, Block[]> = {};
  let key = 'top';
  for (const b of vis) {
    if (b.t === 'h2') { key = b.text.toLowerCase(); sec[key] = []; continue; }
    (sec[key] ??= []).push(b);
  }
  const ps = (k: string) => (sec[k] ?? []).filter((b): b is Extract<Block, { t: 'p' }> => b.t === 'p').map((b) => b.text);
  const top = ps('top');
  // bold lead paragraph followed by a list: [{ lead, items }]
  const groups: { lead: string; items: string[] }[] = [];
  const acc = sec['acculturation'] ?? [];
  for (let i = 0; i < acc.length; i++) {
    const b = acc[i];
    if (b.t === 'p' && /^\*\*/.test(b.text)) {
      const nx = acc[i + 1];
      groups.push({ lead: leadSplit(b.text).lead, items: nx && nx.t === 'ul' ? nx.items : [] });
    }
  }
  const note = bs.filter((b) => b.t === 'note').map((b) => (b as { text: string }).text).join(' ');
  return {
    num: num.trim(), title: t.join('·').trim(),
    hint: top[0], role: top[1], where: top[2], story: top[3], story2: top[4],
    accTitle: (vis.find((b) => b.t === 'h2') as { text: string }).text, hlTitle: (vis.filter((b) => b.t === 'h2')[1] as { text: string }).text, accSub: ps('acculturation').find((p) => !/^\*\*/.test(p)) ?? '',
    mission: groups[0], part: groups[1],
    highlights: ps('highlights').map((p) => leadSplit(p)),
    closing: ps('closing'),
    catalogueUrl: /https?:\/\/\S*issuu\S*/.exec(note)?.[0].replace(/[.,;)]+$/, '') ?? '',
  };
})();
export const sidePageBody = (name: string) => sidePages.find((p) => p.slug === slug(name))?.body ?? [];

// ---- Chapter 02: Becoming whole in F&B (Lam Yên), nine pages P1..P9 ----
export const ch02 = (() => {
  const all = blocks(readContent('ch02-becoming-whole-in-fb.md'));
  const bs = visible(all);
  // video addresses live in BUILD NOTE lines: "BUILD NOTE: LINKS <name> (...): url url ..."
  const links: Record<string, string[]> = {};
  for (const b of all) {
    if (b.t !== 'note') continue;
    const m = /^BUILD NOTE: LINKS (\w+)\b[^:]*:\s*(.*)$/.exec(b.text);
    if (m) links[m[1]] = [...m[2].matchAll(/https?:\/\/\S+/g)].map((x) => x[0]);
  }
  const h1 = (bs.find((b) => b.t === 'h1') as { text: string }).text;
  const [num, ...t] = h1.split('·');
  const pages: Record<string, Block[]> = {};
  let key = 'top';
  for (const b of bs) {
    if (b.t === 'h2') { key = b.text.trim().toLowerCase(); pages[key] = []; continue; }
    (pages[key] ??= []).push(b);
  }
  return { num: num.trim(), title: t.join('·').trim(), hint: ((pages['top'] ?? []).find((b) => b.t === 'p') as { text: string }).text, pages, links };
})();
export type { Block };

// ---- Chapter 03: Different kitchens (three side projects) ----
export const ch03 = (() => {
  const raw = readContent('ch03-different-kitchens.md');
  const all = blocks(raw);
  const bs = visible(all);
  const h1 = (bs.find((b) => b.t === 'h1') as { text: string }).text;
  const [num, ...t] = h1.split('·');
  const projects: { name: string; blocks: Block[] }[] = [];
  let top: Block[] = [];
  for (const b of bs) {
    if (b.t === 'h2') projects.push({ name: b.text, blocks: [] });
    else if (b.t !== 'h1') (projects.length ? projects[projects.length - 1].blocks : top).push(b);
  }
  const note = all.filter((b) => b.t === 'note').map((b) => (b as { text: string }).text).join(' ');
  return {
    num: num.trim(), title: t.join('·').trim(),
    hint: (top.find((b) => b.t === 'p') as { text: string } | undefined)?.text ?? '',
    projects,
    note,
    facebook: /https?:\/\/\S+facebook\S+?(?=[\s.,;)]|$)/.exec(note)?.[0].replace(/\.$/, '') ?? '',
  };
})();

// ---- Navigation (content/nav.md) and page addresses ----
export const nav = (() => {
  const m: Record<string, { label: string; sub: string }> = {};
  for (const l of readContent('nav.md').split('\n')) {
    const x = /^- ([a-z]+):\s*(.*)$/.exec(l);
    if (!x) continue;
    const [label, sub = ''] = x[2].split('|').map((t) => t.trim());
    m[x[1]] = { label, sub };
  }
  return m;
})();
export const pages = {
  home: url(''),
  making: url('in-the-making/'),
  menu: url('off-the-menu/'),
  mua: url('why-mua/'),
  contact: url('why-mua/#contact'),
};

// ---- Off the menu (03) and Why Mùa (04, with the Contact) ----
function pageDoc(file: string) {
  const bs = visible(blocks(readContent(file)));
  const h1 = (bs.find((b) => b.t === 'h1') as { text: string }).text;
  const [num, ...t] = h1.split('·');
  const secs: Record<string, Block[]> = {};
  let key = 'top';
  for (const b of bs) {
    if (b.t === 'h2') { key = b.text.trim().toLowerCase(); secs[key] = []; continue; }
    if (b.t !== 'h1') (secs[key] ??= []).push(b);
  }
  const ps = (k: string) => (secs[k] ?? []).filter((b): b is Extract<Block, { t: 'p' }> => b.t === 'p').map((b) => b.text);
  const ul = (k: string) => (secs[k] ?? []).filter((b): b is Extract<Block, { t: 'ul' }> => b.t === 'ul').flatMap((b) => b.items);
  return { num: num.trim(), title: t.join('·').trim(), hint: ps('top')[0] ?? '', secs, ps, ul };
}
export const ch04 = (() => {
  const d = pageDoc('ch04-off-the-menu.md');
  // sections are found by name, so their order in the markdown file can change freely
  const heads = visible(blocks(readContent('ch04-off-the-menu.md'))).filter((b) => b.t === 'h2').map((b) => (b as { text: string }).text);
  return { ...d, giftTitle: heads.find((h) => /gift/i.test(h)) ?? '', florTitle: heads.find((h) => /florist/i.test(h)) ?? '', order: heads.map((h) => (/gift/i.test(h) ? 'gift' : 'flor')) };
})();
export const ch05 = pageDoc('ch05-why-mua.md');
