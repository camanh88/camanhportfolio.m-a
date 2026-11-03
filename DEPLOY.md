# Deploy: Mùa web on Hostinger (mua.camanhportfolio.online)

Repo: https://github.com/camanh88/camanhportfolio.m-a.git (not the Marou repo).

## Branches

- `main`: the project (`content/`, `site/`, `assets-mua/`). To change anything, edit here and rebuild.
- `deploy`: only the built static site (the contents of `site/dist/`, including `.htaccess`). Hostinger copies this branch as it is.

## Hostinger (hPanel), first time

1. Websites > Add website (or Domains > Subdomains) > create `mua.camanhportfolio.online`. Note its folder (usually `public_html/mua` or `domains/…/public_html`).
2. That website > Advanced > Git > Create repository: URL `https://github.com/camanh88/camanhportfolio.m-a.git`, branch `deploy`, install path = the folder of the subdomain (leave it empty / the web root of that subdomain, never the root of camanhportfolio.online: that folder holds the Marou web).
3. Press Deploy. For automatic updates, add the webhook Hostinger shows to the GitHub repo (Settings > Webhooks).
4. SSL > install the free certificate for the subdomain.

## Update the site later

```bash
cd site && npm run build           # writes site/dist/
cd .. && ./make-deploy-branch.sh   # pushes the build to the `deploy` branch
```

Then press Deploy in hPanel (or let the webhook do it).

## Switches

- Search engines: `INDEXABLE` in `site/src/lib/site.ts` (now `false`: every page has "noindex").
- Address: `SITE_URL` in `site/src/lib/site.ts` and `site` in `site/astro.config.mjs`.
- CV: replace `site/public/cv/CV_Nguyen_Cam_Anh.pdf`.
