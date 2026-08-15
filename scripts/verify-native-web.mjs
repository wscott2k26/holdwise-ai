import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.argv[2] || '');
const indexPath = path.join(root, 'index.html');
const fail = (message) => {
  console.error(`native-web verification failed: ${message}`);
  process.exit(1);
};

if (!root || !fs.existsSync(indexPath)) fail('index.html missing');
const html = fs.readFileSync(indexPath, 'utf8');
if (!html.includes('data-holdwise-native-inline')) fail('inline boot markers missing');
if (/<script[^>]+src=["']\.\/assets\/index-[^"']+\.js/i.test(html)) fail('primary JS is still external');
if (/<link[^>]+href=["']\.\/assets\/index-[^"']+\.css/i.test(html)) fail('primary CSS is still external');
if (/base44\.com\/logo_v2\.svg/i.test(html)) fail('external Base44 favicon remains');
if (/href=["']\/manifest\.json/i.test(html)) fail('root manifest dependency remains');
if (/log-user-in-app/i.test(html)) fail('Base44 analytics injection remains');
if (!/<div[^>]+id=["']root["']/i.test(html)) fail('React root missing');

const assetsDir = path.join(root, 'assets');
if (!fs.existsSync(assetsDir)) fail('assets directory missing');
const assets = fs.readdirSync(assetsDir);
if (!assets.some((name) => /^strategyWorker-.*\.js$/.test(name))) fail('strategy worker missing');

console.log('native-web verification passed');
