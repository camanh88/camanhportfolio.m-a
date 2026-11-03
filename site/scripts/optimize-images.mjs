// Converts the originals listed in photos.mjs to responsive WebP in public/img/ and writes src/data/images.json.
// Originals are only read. HEIC goes through macOS `sips` first (see _lib.mjs).
import sharp from 'sharp';
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { PROJECT, ROOT, readable } from './_lib.mjs';
import { photos } from './photos.mjs';

const WIDTHS = [480, 960, 1600];
const HERO_WIDTHS = [960, 1600, 2400];
const OUT = path.join(ROOT, 'public', 'img');
mkdirSync(OUT, { recursive: true });
const manifest = {};

for (const [id, [rel, alt, opts = {}]] of Object.entries(photos)) {
  let src = path.join(PROJECT, rel);
  if (!existsSync(src)) src = path.join(PROJECT, rel.normalize('NFD'));   // macOS keeps some Vietnamese file names in decomposed form
  if (!existsSync(src)) { console.warn('missing', rel); continue; }
  let img = sharp(readable(src)).rotate();
  if (opts.trim) img = sharp(await img.trim({ background: '#000000', threshold: 24 }).toBuffer()); // black screenshot bars
  if (opts.knockout) { // a flat white screenshot (chat bubble): remove the white that touches the border
    const { data, info } = await img.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const { width: w, height: h } = info;
    const seen = new Uint8Array(w * h), stack = [];
    for (let x = 0; x < w; x++) stack.push(x, (h - 1) * w + x);
    for (let y = 0; y < h; y++) stack.push(y * w, y * w + w - 1);
    while (stack.length) {
      const q = stack.pop();
      if (seen[q] || data[q * 4] < 248 || data[q * 4 + 1] < 248 || data[q * 4 + 2] < 248) continue;
      seen[q] = 1; data[q * 4 + 3] = 0;
      const x = q % w;
      if (x > 0) stack.push(q - 1);
      if (x < w - 1) stack.push(q + 1);
      if (q >= w) stack.push(q - w);
      if (q < w * (h - 1)) stack.push(q + w);
    }
    img = sharp(data, { raw: { width: w, height: h, channels: 4 } });
  }
  if (opts.alpha || opts.knockout) img = sharp(await img.trim({ threshold: 1 }).png().toBuffer()); // cut-outs: crop to the visible shape
  if (opts.crop) { // largest box of the wanted aspect; x / y place it inside the leftover space (0..1)
    const buf = await img.toBuffer(); const m = await sharp(buf).metadata();
    const a = opts.crop.aspect;
    let cw = m.width, ch = Math.round(m.width / a);
    if (ch > m.height) { ch = m.height; cw = Math.round(m.height * a); }
    const z = opts.crop.zoom ?? 1; cw = Math.round(cw / z); ch = Math.round(ch / z); // zoom > 1 = tighter crop
    img = sharp(buf).extract({ left: Math.round((m.width - cw) * (opts.crop.x ?? 0.5)), top: Math.round((m.height - ch) * (opts.crop.y ?? 0.5)), width: cw, height: ch });
  }
  const meta = await sharp(await img.clone().toBuffer()).metadata();
  const [W, H] = [meta.width, meta.height];
  const widths = (opts.hero ? HERO_WIDTHS : WIDTHS).filter((w) => w < W && (!opts.max || w <= opts.max));
  const cap = Math.min(W, opts.max ?? 1600);
  if (!widths.length || widths[widths.length - 1] < cap) widths.push(cap);
  for (const w of widths) {
    await img.clone().resize({ width: w, withoutEnlargement: true }).webp({ quality: w <= 480 ? 72 : 78 }).toFile(path.join(OUT, `${id}-${w}.webp`));
  }
  const top = widths[widths.length - 1];
  manifest[id] = { alt, width: top, height: Math.round((H / W) * top), widths };
  console.log(id, widths.join('/'));
}
mkdirSync(path.join(ROOT, 'src', 'data'), { recursive: true });
writeFileSync(path.join(ROOT, 'src', 'data', 'images.json'), JSON.stringify(manifest, null, 1));
