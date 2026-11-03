// Copies the pictures Cam Anh embedded in her Word file (read-only) into tmp-img/ so the image script can optimise them.
// Only the photo of herself is used (rId18, the motorbike in the mountains); Marou's pictures in the note are inspiration only.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { PROJECT, TMP } from './_lib.mjs';

mkdirSync(TMP, { recursive: true });
const docx = path.join(PROJECT, '[W] 26. MAROU APPLYING.docx');
const png = execFileSync('unzip', ['-p', docx, 'word/media/image4.png'], { maxBuffer: 20 * 1024 * 1024 });
writeFileSync(path.join(TMP, 'word-bike.png'), png);
console.log('word-bike.png', png.length, 'bytes');
