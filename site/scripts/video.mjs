// Cover video: makes web-sized copies (1080p for desktop, 540p for phones) and a poster image.
// The original stays in Photo/ untouched. macOS only (avconvert + qlmanage ship with the system).
import { execFileSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { PROJECT, ROOT, TMP } from './_lib.mjs';

const src = path.join(PROJECT, 'Photo', 'Cover & Introduction', 'COVER.mp4');
const outDir = path.join(ROOT, 'public', 'video');
mkdirSync(outDir, { recursive: true });
mkdirSync(TMP, { recursive: true });
for (const [name, preset] of [['cover-1080', 'Preset1920x1080'], ['cover-540', 'Preset960x540']]) {
  execFileSync('avconvert', ['-s', src, '-p', preset, '-o', path.join(outDir, `${name}.mp4`), '--replace'], { stdio: 'ignore' });
}
execFileSync('qlmanage', ['-t', '-s', '1920', '-o', TMP, src], { stdio: 'ignore' });
const png = path.join(TMP, 'COVER.mp4.png');
for (const w of [960, 1600]) await sharp(png).resize({ width: w }).webp({ quality: 80 }).toFile(path.join(ROOT, 'public', 'img', `cover-poster-${w}.webp`));
console.log('cover video + poster written');
