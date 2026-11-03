// Shared helpers for the image scripts. Originals are read-only: they are never written to.
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'); // site/
export const PROJECT = path.resolve(ROOT, '..'); // PORT 26/
export const TMP = path.join(ROOT, 'tmp-img');

/** Returns a path sharp can read. HEIC is converted once to a cached JPEG with macOS `sips`. */
export function readable(src) {
  if (!/\.heic$/i.test(src)) return src;
  mkdirSync(TMP, { recursive: true });
  const out = path.join(TMP, createHash('md5').update(src + statSync(src).mtimeMs + statSync(src).size).digest('hex').slice(0, 12) + '.jpg');
  if (!existsSync(out)) {
    execFileSync('sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', '92', src, '--out', out], { stdio: 'ignore' });
  }
  return out;
}
