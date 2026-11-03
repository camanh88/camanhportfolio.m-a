// Mùa's own pictures (assets-mua/): the two bottles and the glass are cut out of their flat background and written as
// transparent WebP into public/img/, then added to src/data/images.json (existing entries stay). Originals are only read.
import sharp from 'sharp';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ASSETS = path.resolve(ROOT, '..', 'assets-mua');
const OUT = path.join(ROOT, 'public', 'img');
mkdirSync(OUT, { recursive: true });

const items = {
  'mua-classic': ['MÙA Sig Sake.png', 'A bottle of Mùa Classic craft sake: dark glass, a white label with the Mùa wordmark and a black neck strip that reads "Brewing fresh sake for the people!"'],
  'mua-pure-rice': ['MÙA Sig CT25.png', 'A bottle of Mùa Pure Rice craft sake in frosted white glass with a gold cap and a label showing a sage-green crane.'],
  'mua-glass': ['Cham Glass.jpg', 'A stemmed tasting glass holding a little pale sake.'],
};

// remove the flat background that touches the border (flood fill from the edges, tolerance on distance from the corner colour)
async function cutOut(file, tol) {
  const { data, info } = await sharp(path.join(ASSETS, file.normalize('NFC'))).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  const bg = [data[0], data[1], data[2]];
  const near = (q) => Math.abs(data[q * 4] - bg[0]) + Math.abs(data[q * 4 + 1] - bg[1]) + Math.abs(data[q * 4 + 2] - bg[2]) <= tol;
  const seen = new Uint8Array(w * h), stack = [];
  for (let x = 0; x < w; x++) stack.push(x, (h - 1) * w + x);
  for (let y = 0; y < h; y++) stack.push(y * w, y * w + w - 1);
  while (stack.length) {
    const q = stack.pop();
    if (seen[q] || !near(q)) continue;
    seen[q] = 1; data[q * 4 + 3] = 0;
    const x = q % w;
    if (x > 0) stack.push(q - 1);
    if (x < w - 1) stack.push(q + 1);
    if (q >= w) stack.push(q - w);
    if (q < w * (h - 1)) stack.push(q + w);
  }
  return sharp(await sharp(data, { raw: { width: w, height: h, channels: 4 } }).png().toBuffer()).trim({ threshold: 1 });
}

const manifestPath = path.join(ROOT, 'src', 'data', 'images.json');
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
for (const [id, [file, alt]] of Object.entries(items)) {
  const img = sharp(await (await cutOut(file, id === 'mua-glass' ? 24 : 18)).png().toBuffer());
  const m = await img.metadata();
  const widths = [480, 960].filter((x) => x < m.width);
  widths.push(m.width);
  for (const w of widths) await img.clone().resize({ width: w, withoutEnlargement: true }).webp({ quality: 86, alphaQuality: 100 }).toFile(path.join(OUT, `${id}-${w}.webp`));
  manifest[id] = { alt, width: m.width, height: m.height, widths };
  console.log(id, m.width, m.height, widths.join('/'));
}
writeFileSync(manifestPath, JSON.stringify(manifest, null, 1) + '\n');
