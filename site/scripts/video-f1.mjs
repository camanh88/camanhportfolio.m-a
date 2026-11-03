// Florist hero video (slot F1): web copies (1080p laptop, 540p phone, no sound, 30 fps) + poster.
// The original (*Photo/04/IMG_3997.mov) stays untouched. Needs the dev dependency ffmpeg-static.
// usage: node scripts/video-f1.mjs
import ffmpeg from 'ffmpeg-static';
import { execFileSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { PROJECT, ROOT } from './_lib.mjs';

const src = path.join(PROJECT, '*Photo', '04', 'IMG_3997.mov');
const outDir = path.join(ROOT, 'public', 'video');
mkdirSync(outDir, { recursive: true });
const run = (args) => execFileSync(ffmpeg, ['-y', '-hide_banner', '-loglevel', 'error', '-i', src, ...args], { stdio: 'inherit' });
for (const [name, h, crf] of [['f1-1080', 1080, 27], ['f1-540', 540, 29]]) {
  run(['-an', '-vf', `scale=-2:${h},fps=30`, '-c:v', 'libx264', '-preset', 'slow', '-crf', String(crf), '-pix_fmt', 'yuv420p', '-movflags', '+faststart', path.join(outDir, `${name}.mp4`)]);
  console.log('wrote', name);
}
for (const w of [960, 1600]) {
  run(['-ss', '1', '-frames:v', '1', '-vf', `scale=${w}:-2`, '-c:v', 'libwebp', '-quality', '80', path.join(ROOT, 'public', 'img', `f1-poster-${w}.webp`)]);
}
console.log('poster written');
