// The "pull it apart" video of the Lam Yên chapter (1023.mov in the project folder): web copies (large + phone, no sound, 30 fps) and a poster.
// The iPhone clip is HDR (HLG), so it is tone-mapped to normal colours. The original stays untouched. usage: node scripts/video-ly.mjs
import ffmpeg from 'ffmpeg-static';
import { execFileSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { PROJECT, ROOT } from './_lib.mjs';

const src = path.join(PROJECT, '1023.mov');   // Cam Anh's new clip (Oct 23), replaces *Photo/02/Photo/5.../IMG_2646.MOV
const out = path.join(ROOT, 'public', 'video');
mkdirSync(out, { recursive: true });
const SDR = 'zscale=t=linear:npl=100,format=gbrpf32le,zscale=p=bt709,tonemap=tonemap=hable:desat=0,zscale=t=bt709:m=bt709:r=tv';
const ff = (args) => execFileSync(ffmpeg, ['-y', '-hide_banner', '-loglevel', 'error', '-i', src, ...args], { stdio: 'inherit' });
for (const [tag, w, crf] of [['hd', 720, 27], ['sd', 360, 29]]) {
  ff(['-an', '-vf', `${SDR},scale=${w}:-2,fps=30,format=yuv420p`, '-c:v', 'libx264', '-preset', 'slow', '-crf', String(crf), '-pix_fmt', 'yuv420p', '-movflags', '+faststart', path.join(out, `lyv-pull-${tag}.mp4`)]);
}
for (const w of [480, 960]) ff(['-ss', '0.6', '-frames:v', '1', '-vf', `${SDR},scale=${w}:-2`, '-c:v', 'libwebp', '-quality', '78', path.join(ROOT, 'public', 'img', `lyv-pull-poster-${w}.webp`)]);
console.log('wrote lyv-pull');
