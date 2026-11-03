// Share image (Open Graph) for the Mùa web: cream card, the Classic bottle and the glass, the greeting. Placeholder until a final one is made.
import sharp from 'sharp';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const img = (id, w) => path.join(ROOT, 'public', 'img', `${id}-${w}.webp`);
const bottle = await sharp(img('mua-classic', 258)).resize({ height: 520 }).toBuffer();
const glass = await sharp(img('mua-glass', 227)).resize({ height: 300 }).toBuffer();
const svg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><rect width="1200" height="630" fill="#EEE9C1"/>
<text x="80" y="250" font-family="Georgia, serif" font-size="92" fill="#3A230A">Hi Mùa,</text>
<text x="80" y="350" font-family="Georgia, serif" font-size="92" fill="#3A230A">I’m Cẩm Anh.</text>
<rect x="80" y="420" width="650" height="48" fill="#4E6B3F"/><text x="102" y="452" font-family="Helvetica, Arial, sans-serif" font-size="19" letter-spacing="3" fill="#EEE9C1">APPLICATION · BRAND &amp; MARKETING MANAGER</text></svg>`);
await sharp(svg).composite([{ input: bottle, left: 780, top: 55 }, { input: glass, left: 960, top: 255 }]).jpeg({ quality: 88 }).toFile(path.join(ROOT, 'public', 'og.jpg'));
console.log('og.jpg written');
