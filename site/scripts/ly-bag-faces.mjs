// The "front" faces of the two seasonal bags, cut out of Cam Anh's print PDFs (the PDFs are drawn as vectors, so they are rendered large
// with macOS Quick Look and cropped; the PDFs are never written to). Writes scripts/derived/ly-seasonal-front-pink.png and ...-green.png (they are listed in photos.mjs like any other photo)
// usage: node scripts/ly-bag-faces.mjs
import sharp from 'sharp';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readdirSync, mkdirSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { PROJECT, ROOT } from './_lib.mjs';

const dir = path.join(PROJECT, '*Photo', '02', 'Signature bag', 'Túi PDF');
const render = (file, size) => {
  const tmp = mkdtempSync(path.join(os.tmpdir(), 'lyface-'));
  execFileSync('qlmanage', ['-t', '-s', String(size), '-o', tmp, path.join(dir, file)], { stdio: 'ignore' });
  return path.join(tmp, readdirSync(tmp).find((f) => f.endsWith('.png')));
};
// boxes are measured on an 1100-px wide preview of the page, so they scale with any render size
const faces = [
  { id: 'ly-seasonal-front-pink', file: 'LAMYEN-Túi biếu-27x14x22cm.pdf', size: 8000, box: [83, 195, 265, 215], alpha: false },   // "Mặt trước" of the pink bag
  { id: 'ly-seasonal-front-green', file: 'TUI GIAY L_LAMYEN_33x14x22.pdf', size: 7000, box: [90, 630, 420, 328], alpha: false }, // the plain panel with the logo, same crop shape as Seasonal bag.1
];
for (const f of faces) {
  const png = render(f.file, f.size);
  const m = await sharp(png).metadata();
  // preview width: the page is rendered square-bounded, so the 1100-px preview used a scale of (render width / 1100) for landscape pages and (render height / 1100 * pageW/pageH) for portrait ones
  const k = m.width / (m.width >= m.height ? 1100 : 831);
  const [x, y, w, h] = f.box.map((v) => Math.round(v * k));
  const img = sharp(png).extract({ left: x, top: y, width: w, height: h });
  mkdirSync(path.join(ROOT, 'scripts', 'derived'), { recursive: true });
  await img.resize({ width: 1600, withoutEnlargement: true }).png().toFile(path.join(ROOT, 'scripts', 'derived', `${f.id}.png`));
  console.log(f.id, w, h);
}
