#!/bin/sh
# Pushes the built site (site/dist) as the only content of the `deploy` branch. Run `npm run build` in site/ first.
set -e
ROOT="$(cd "$(dirname "$0")" && pwd)"
URL="$(git -C "$ROOT" remote get-url origin)"
TMP="$(mktemp -d)"
cp -R "$ROOT/site/dist/." "$TMP/"
cd "$TMP"
git init -q -b deploy
git add -A
git -c user.name="Cam Anh" -c user.email="camanhn88@gmail.com" commit -q -m "Deploy build $(date +%Y-%m-%d)"
git push -f "$URL" deploy
rm -rf "$TMP"
