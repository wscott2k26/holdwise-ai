import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.argv[2] || '');
const indexPath = path.join(root, 'index.html');

function fail(message) {
  console.error(`native entry inspection failed: ${message}`);
  process.exit(1);
}

if (!root || !fs.existsSync(indexPath)) fail('index.html missing');

const html = fs.readFileSync(indexPath, 'utf8');
const externalPrimaryEntry = /<script\b(?=[^>]*\btype\s*=\s*["']module["'])(?=[^>]*\bsrc\s*=\s*["'](?:\.\/|\/)?assets\/index-[^"']+\.js(?:\?[^"']*)?["'])[^>]*>\s*<\/script>/i;
if (externalPrimaryEntry.test(html)) fail('primary module is still external');

const inlineModule = html.match(/<script\b(?=[^>]*\btype=["']module["'])(?=[^>]*\bdata-holdwise-native-inline(?:\s|=|>))[^>]*>([\s\S]*?)<\/script>/i);
if (!inlineModule) fail('inlined primary module missing');

const source = inlineModule[1].trim();
if (!source) fail('inlined primary module is empty');

const sourceMap = source.match(/\/\/# sourceMappingURL=([^\s]+)/);
if (!sourceMap) fail('inlined primary module has no source-map reference');

console.log(`native entry source map: ${sourceMap[1]}`);
