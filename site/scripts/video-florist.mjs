// The three video tiles of "The florist in me" (*Photo/04/Florist in me): web copies (large + phone, no sound, 30 fps) and a poster each.
// Originals stay untouched. Needs the dev dependency ffmpeg-static. usage: node scripts/video-florist.mjs
import ffmpeg from 'ffmpeg-static';
import { execFileSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { PROJECT, ROOT } from './_lib.mjs';

const dir = path.join(PROJECT, '*Photo', '04', 'Florist in me');
const out = path.join(ROOT, 'public', 'video');
mkdirSync(out, { recursive: true });
// id, source, [large width, phone width], hdr (iPhone HLG clips are tone-mapped to normal SDR colours)
const VIDEOS = [
  ['fv-bouquet', 'IMG_4721.mov', [720, 360]],
  ['fv-window', 'IMG_0869.MOV', [720, 360]],
  ['fv-drum', 'IMG_8654.MOV', [720, 360], true],
  ['fv-hydrangea', 'IMG_4690.MOV', [960, 480]],
];
const SDR = 'zscale=t=linear:npl=100,format=gbrpf32le,zscale=p=bt709,tonemap=tonemap=hable:desat=0,zscale=t=bt709:m=bt709:r=tv';
const ff = (src, args) => execFileSync(ffmpeg, ['-y', '-hide_banner', '-loglevel', 'error', '-i', path.join(dir, src), ...args], { stdio: 'inherit' });
for (const [id, src, [wl, wp], hdr] of VIDEOS) {
  for (const [tag, w, crf] of [['hd', wl, 27], ['sd', wp, 29]]) {
    // scale so that the width (landscape) or the width of the portrait frame equals w; 30 fps, no audio
    ff(src, ['-an', '-vf', `${hdr ? SDR + ',' : ''}scale=${w}:-2,fps=30,format=yuv420p`, '-c:v', 'libx264', '-preset', 'slow', '-crf', String(crf), '-pix_fmt', 'yuv420p', '-movflags', '+faststart', path.join(out, `${id}-${tag}.mp4`)]);
  }
  for (const w of [480, 960]) ff(src, ['-ss', '0.6', '-frames:v', '1', '-vf', `${hdr ? SDR + ',' : ''}scale=${w}:-2`, '-c:v', 'libwebp', '-quality', '78', path.join(ROOT, 'public', 'img', `${id}-poster-${w}.webp`)]);
  console.log('wrote', id);
}
