# PORT 26 · Mùa: Cam Anh's application web

A personal web for Cam Anh's direct application to **Mùa Craft Sake** (position: Brand & Marketing Manager). It is built from the Marou portfolio (same page system, layout and animation) with a new theme, a new Home, a redesigned section 04 and a Contact. The only source of content is the working script "26. MÙA APPLYING. Web script.docx" (in the parent folder, read-only).

## Hard rules

- **Everything runs locally.** No `git push`, no deploy, no remote. This repo has no remote on purpose.
- **Never touch the Marou project** ("Marou PORT 26 copy" and its GitHub repo). Read from it only if needed.
- All visible text comes from `content/*.md`. Never write, rewrite or translate copy in components; list suspected typos in the report instead.
- `[square brackets]` in content = unfinished placeholder (shown highlighted, listed in `site/PLACEHOLDERS.md`). `BUILD NOTE:` lines are never rendered. `{{Name}}` = sidepath (`content/side-pages.md`).
- Originals (`assets-mua/`, the `.docx`) are read-only; optimised copies go to `site/public/img/`.
- Do not mention Marou, chocolate, cacao, a gift box that opens or "chocolate meal" anywhere in the site. ("seasonal & gifting campaigns" in Core skills stays: the script keeps that block as it is.)

## Layout of the folder

```
mua-port-26/
  CLAUDE.md          this file
  assets-mua/        Mùa pictures (bottles, glass, colour palette), read-only
  content/           THE ONLY SOURCE OF TEXT
  site/              the Astro web (npm run dev -> http://localhost:4322 via ../.claude/launch.json)
```

## Pages

| Address | What | Component | Content |
|---|---|---|---|
| `/` | Cover (greeting + role line), Get to know me (5 entries), Core skills, How I work | `Cover`, `Contents`, `CoreSkills`, `HowIWork` | `cover.md`, `contents.md`, `intro-skills.md` |
| `/in-the-making/` | 01 It started with culture · 02 Lam Yên + Different kitchens | `Ch01/02/03` | `ch01…`, `ch02…`, `ch03…` |
| `/off-the-menu/` | 03 The florist in me | `OffMenu` | `ch04-off-the-menu.md` |
| `/why-mua/` | 04 Why Mùa. Why me. (clink, Lam Yên story, values, bottle opens) + 05 Contact | `WhyMua` | `ch05-why-mua.md` |

## Theme

"Muted monarch" palette (assets-mua/Color & Theme.jpg) plus Moss. Tokens in `site/src/styles/tokens.css`: sage `#8DA28C` (backgrounds, details, never text), burnt orange `#A4530C` (accent, large text, links), cream `#EEE9C1` (main background), dark brown `#3A230A` (text, dark blocks), moss `#4E6B3F` (accent text, buttons; 4.9:1 on cream). Orange on cream is 4.46:1: use it for large text only.

## Useful commands (run in `site/`)

- `npm run dev -- --port 4322`: local server (the review sticky note shows in dev only).
- `npm run build`: static `dist/` (also regenerates `PLACEHOLDERS.md`).
- `node scripts/mua-images.mjs`: re-cut the bottles and glass from `assets-mua/`.
- `node scripts/og.mjs`: re-make the share image.

## Open items

See `site/PLACEHOLDERS.md` (CV link, portfolio link, empty photo frames in 04, final domain, share image, larger bottle files).
