// Background of the signature-bag page of the Lam Yên chapter, taken straight from Cam Anh's updated PDF
// (*Photo/02/Signature bag/Túi PDF/LAMYEN-túi-NHỎ & VỪA.pdf): the PDF is drawn as vectors, so it is rendered large (macOS Quick Look)
// and the pattern stays crisp. Only the upper part (pattern fading to cream, above the logo) is used; below it the picture
// continues as a plain fade to the cream that the page uses as its background colour. The PDF itself is never written to.
// usage: node scripts/ly-bag-bg.mjs
import sharp from 'sharp';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readdirSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { PROJECT, ROOT } from './_lib.mjs';

const pdf = path.join(PROJECT, '*Photo', '02', 'Signature bag', 'Túi PDF', 'LAMYEN-túi-NHỎ & VỪA.pdf');
const tmp = mkdtempSync(path.join(os.tmpdir(), 'lybg-'));
execFileSync('qlmanage', ['-t', '-s', '7000', '-o', tmp, pdf], { stdio: 'ignore' });
const png = path.join(tmp, readdirSync(tmp).find((f) => f.endsWith('.png')));
const { width: W, height: H } = await sharp(png).metadata();
const keep = Math.round(H * 0.62);                      // the pattern, above the logo
const top = await sharp(png).extract({ left: 0, top: 0, width: W, height: keep }).raw().toBuffer({ resolveWithObject: true });
const ch = top.info.channels;
// the pattern fades out over the last part (each row blends towards its own average colour), like the pattern on the bag itself
const rowAvg = (y) => { const a = [0, 0, 0]; for (let x = 0; x < W; x++) for (let c = 0; c < 3; c++) a[c] += top.data[(y * W + x) * ch + c] / W; return a; };
const y0 = Math.round(keep * 0.55);
for (let y = y0; y < keep; y++) {
  const t = Math.pow((y - y0) / (keep - 1 - y0), 1.3), avg = rowAvg(y);
  for (let x = 0; x < W; x++) for (let c = 0; c < 3; c++) { const i = (y * W + x) * ch + c; top.data[i] = Math.round(top.data[i] * (1 - t) + avg[c] * t); }
}
// colour of the last row (average) -> fade to the page cream
const last = [0, 0, 0];
for (let x = 0; x < W; x++) for (let c = 0; c < 3; c++) last[c] += top.data[((keep - 1) * W + x) * ch + c] / W;
const CREAM = [253, 249, 225];                          // #FDF9E1, also the page's background-color
const fade = Math.round(W * 0.35);
const strip = Buffer.alloc(W * fade * 3);
for (let y = 0; y < fade; y++) { const t = y / (fade - 1); for (let x = 0; x < W; x++) for (let c = 0; c < 3; c++) strip[(y * W + x) * 3 + c] = Math.round(last[c] + (CREAM[c] - last[c]) * t); }
const base = await sharp(top.data, { raw: { width: W, height: keep, channels: ch } }).removeAlpha().raw().toBuffer();
const full = Buffer.concat([base, strip]);
const img = sharp(full, { raw: { width: W, height: keep + fade, channels: 3 } });
for (const w of [1200, 2400]) await img.clone().resize({ width: w }).webp({ quality: 80 }).toFile(path.join(ROOT, 'public', 'img', `ly-bg-${w}.webp`));
console.log('last row colour', last.map(Math.round), 'size', W, keep + fade);
