// Dev helper: builds a numbered contact sheet of a folder so photos can be reviewed at a glance.
// usage: node scripts/contact.mjs "<folder relative to PORT 26>" <out.jpg>
import sharp from 'sharp';
import { readdirSync } from 'node:fs';
import path from 'node:path';
import { PROJECT, readable } from './_lib.mjs';

const [folder, out] = process.argv.slice(2);
const dir = path.join(PROJECT, folder);
const files = readdirSync(dir).filter((f) => /\.(jpe?g|png|webp|heic)$/i.test(f)).sort();
const cell = 360, cols = 4;
const tiles = [];
for (const [i, f] of files.entries()) {
  const buf = await sharp(readable(path.join(dir, f))).rotate().resize(cell, cell, { fit: 'contain', background: '#ddd' }).jpeg().toBuffer();
  const label = Buffer.from(`<svg width="${cell}" height="26"><rect width="${cell}" height="26" fill="#000" opacity=".7"/><text x="6" y="18" font-size="15" fill="#fff" font-family="Helvetica">${i}: ${f.replace(/&/g, '')}</text></svg>`);
  tiles.push({ input: await sharp(buf).composite([{ input: label, gravity: 'south' }]).toBuffer(), left: (i % cols) * cell, top: Math.floor(i / cols) * cell });
}
const rows = Math.ceil(files.length / cols);
await sharp({ create: { width: cols * cell, height: rows * cell, channels: 3, background: '#888' } }).composite(tiles).jpeg({ quality: 70 }).toFile(out);
console.log(files.map((f, i) => `${i}: ${f}`).join('\n'));
