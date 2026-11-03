import { defineConfig } from 'astro/config';
import { writeFileSync } from 'node:fs';
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

export default defineConfig({
  site: 'https://mua-placeholder.example',
  output: 'static',
  devToolbar: { enabled: false },
  vite: { plugins: [reviewNote] },
});
