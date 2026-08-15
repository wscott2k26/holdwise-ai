#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
IOS_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
REPO_ROOT="$(cd "$IOS_ROOT/../../.." && pwd)"
WWW_DIR="$IOS_ROOT/Resources/www"

cd "$REPO_ROOT"

if [[ ! -d node_modules ]]; then
  echo "Installing web dependencies..."
  npm install --no-audit --no-fund
fi

rm -rf dist
npm run build:native
rm -rf "$WWW_DIR"
mkdir -p "$WWW_DIR"
cp -R dist/. "$WWW_DIR/"

# WKWebView reliably loads the bundled HTML from file://, but the Appetize
# simulator proved that the external first-paint Vite module never executes in
# this wrapper. Keep normal web output untouched and make only the native copy
# self-contained for its critical CSS + application bootstrap.
export WWW_DIR
node --input-type=module <<'NODE'
import fs from 'node:fs';
import path from 'node:path';

const www = process.env.WWW_DIR;
const indexPath = path.join(www, 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');

const scriptPattern = /<script\b[^>]*\bsrc=["'](\.\/assets\/index-[^"']+\.js)["'][^>]*>\s*<\/script>/gi;
const stylePattern = /<link\b[^>]*\bhref=["'](\.\/assets\/index-[^"']+\.css)["'][^>]*>/gi;
const scripts = [...html.matchAll(scriptPattern)];
const styles = [...html.matchAll(stylePattern)];

if (scripts.length !== 1) {
  throw new Error(`Expected exactly one primary native JS asset, found ${scripts.length}`);
}
if (styles.length !== 1) {
  throw new Error(`Expected exactly one primary native CSS asset, found ${styles.length}`);
}

const scriptTag = scripts[0][0];
const scriptRel = scripts[0][1];
const styleTag = styles[0][0];
const styleRel = styles[0][1];
const scriptPath = path.join(www, scriptRel.replace(/^\.\//, ''));
const stylePath = path.join(www, styleRel.replace(/^\.\//, ''));

let js = fs.readFileSync(scriptPath, 'utf8');
let css = fs.readFileSync(stylePath, 'utf8');

// Prevent HTML raw-text parsing from interpreting bundle text as closing tags.
js = js.replace(/<\/script/gi, '<\\/script');
css = css.replace(/<\/style/gi, '<\\/style');

html = html.replace(
  styleTag,
  `<style data-holdwise-inline data-source="${path.basename(styleRel)}">\n${css}\n</style>`
);
html = html.replace(
  scriptTag,
  `<script type="module" data-holdwise-inline data-source="${path.basename(scriptRel)}">\n${js}\n</script>`
);

// These are useful to the hosted PWA, but unnecessary (and potentially noisy)
// when the exact same HTML is loaded from the installed iOS application bundle.
html = html.replace(/<link\b[^>]*\bhref=["']\/manifest\.json["'][^>]*>\s*/gi, '');
html = html.replace(/<link\b[^>]*\bhref=["']https:\/\/base44\.com\/logo_v2\.svg["'][^>]*>\s*/gi, '');

fs.writeFileSync(indexPath, html);
console.log(`Inlined native bootstrap: ${scriptRel} + ${styleRel}`);
NODE

printf 'Bundled hardened native web app into %s\n' "$WWW_DIR"
