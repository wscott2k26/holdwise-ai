import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.argv[2] || '');
const indexPath = path.join(root, 'index.html');
if (!root || !fs.existsSync(indexPath)) {
  console.error('Usage: node scripts/inline-native-web.mjs <www-dir>');
  process.exit(2);
}

let html = fs.readFileSync(indexPath, 'utf8');
const scriptMatch = html.match(/<script\s+type=["']module["'][^>]*\ssrc=["'](\.\/assets\/index-[^"']+\.js)["'][^>]*><\/script>/i);
const styleMatch = html.match(/<link\s+rel=["']stylesheet["'][^>]*\shref=["'](\.\/assets\/index-[^"']+\.css)["'][^>]*>/i)
  || html.match(/<link[^>]*\shref=["'](\.\/assets\/index-[^"']+\.css)["'][^>]*\srel=["']stylesheet["'][^>]*>/i);

if (!scriptMatch || !styleMatch) {
  console.error('Could not locate primary Vite JS/CSS assets in index.html');
  process.exit(1);
}

const scriptRel = scriptMatch[1];
const styleRel = styleMatch[1];
const scriptPath = path.join(root, scriptRel.replace(/^\.\//, ''));
const stylePath = path.join(root, styleRel.replace(/^\.\//, ''));
if (!fs.existsSync(scriptPath) || !fs.existsSync(stylePath)) {
  console.error('Primary Vite asset file is missing');
  process.exit(1);
}

let js = fs.readFileSync(scriptPath, 'utf8');
let css = fs.readFileSync(stylePath, 'utf8');

// The primary bundle normally lives inside /assets. Once it is inline in
// index.html, relative lazy chunks and worker URLs must keep resolving there.
js = js.replace(/import\((['"])\.\/(?!assets\/)/g, 'import($1./assets/');
js = js.replace(/new URL\((['"])(?!\.\/|\/|https?:)([^'"/]+\.js)\1\s*,\s*import\.meta\.url\)/g, 'new URL($1./assets/$2$1, import.meta.url)');
js = js.replace(/<\/script/gi, '<\\/script');
css = css.replace(/<\/style/gi, '<\\/style');

html = html.replace(scriptMatch[0], `<script type="module" data-holdwise-native-inline>\n${js}\n</script>`);
html = html.replace(styleMatch[0], `<style data-holdwise-native-inline>\n${css}\n</style>`);
html = html.replace(/\s*<link[^>]+href=["']https:\/\/base44\.com\/logo_v2\.svg["'][^>]*>/gi, '');
html = html.replace(/\s*<link[^>]+rel=["']manifest["'][^>]+href=["']\/manifest\.json["'][^>]*>/gi, '');
html = html.replace(/\s*<link[^>]+href=["']\/manifest\.json["'][^>]+rel=["']manifest["'][^>]*>/gi, '');
html = html.replace(/<script\s+type=["']module["']>[^<]*log-user-in-app[^<]*<\/script>/gis, '');

fs.writeFileSync(indexPath, html);
console.log(`Inlined native first-paint assets in ${indexPath}`);
