import { defineConfig } from 'astro/config';
import { writeFileSync, utimesSync } from 'node:fs';
import path from 'node:path';

// Dev only: the review sticky note saves a copy of its text to site/review-note.md (git-ignored), so Claude can read it.
// Nothing here runs in `npm run build`.
const reviewNote = {
  name: 'review-note-file',
  configureServer(server) {
    server.middlewares.use('/__review-note', (req, res) => {
      if (req.method !== 'POST') { res.statusCode = 405; res.end(); return; }
      let body = '';
      req.on('data', (c) => { body += c; if (body.length > 1e6) req.destroy(); });
      req.on('end', () => {
        try {
          const { page = '', text = '' } = JSON.parse(body);
          writeFileSync(path.resolve('review-note.md'), `<!-- saved ${new Date().toISOString()} while on ${page} -->\n${text}\n`);
          res.statusCode = 204;
        } catch { res.statusCode = 400; }
        res.end();
      });
    });
  },
};

// Dev only: the words live in ../content/*.md and are read once by src/lib/data.ts, so the dev server would keep showing old text.
// When a .md file changes, touch data.ts: the server then reloads it and the open page refreshes by itself.
const contentWatch = {
  name: 'content-watch',
  configureServer(server) {
    const dir = path.resolve('..', 'content');
    const data = path.resolve('src', 'lib', 'data.ts');
    server.watcher.add(dir);
    server.watcher.on('change', (file) => {
      if (file.startsWith(dir) && file.endsWith('.md')) { const now = new Date(); utimesSync(data, now, now); }
    });
  },
};

export default defineConfig({
  site: 'https://mua.camanhportfolio.online',
  output: 'static',
  devToolbar: { enabled: false },
  vite: { plugins: [reviewNote, contentWatch] },
});
