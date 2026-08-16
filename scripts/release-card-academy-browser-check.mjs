import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { CARD_ACADEMY_GAMES } from '../src/games/catalog.js';

const base = process.env.HOLDWISE_PREVIEW_BASE || 'http://127.0.0.1:4173';
const out = process.env.RUNNER_TEMP || process.cwd();
const shotDir = path.join(out, 'webshots');
fs.mkdirSync(shotDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 393, height: 852 },
  reducedMotion: 'no-preference',
});
const page = await context.newPage();
page.setDefaultTimeout(8000);
page.setDefaultNavigationTimeout(10000);
page.on('pageerror', error => console.error(`PAGEERROR ${page.url()} :: ${error.message}`));
page.on('console', msg => {
  if (msg.type() === 'error') console.error(`CONSOLE ${page.url()} :: ${msg.text()}`);
});

async function requireBodyText(text) {
  await page.waitForFunction(needle => document.body?.innerText?.includes(needle), text);
}

async function rejectUnavailable(route) {
  const body = await page.locator('body').innerText();
  if (/Tutorial unavailable|Game unavailable|development placeholder/i.test(body)) {
    throw new Error(`Placeholder/unavailable UI at ${route}`);
  }
}

async function openGame(game) {
  const route = `game/${game.id}`;
  await page.goto(`${base}/#/${route}`, { waitUntil: 'domcontentloaded' });
  await requireBodyText(game.title);
  await rejectUnavailable(route);
}

async function walkTutorial(game) {
  const route = `game/${game.id}/tutorial`;
  await page.goto(`${base}/#/${route}`, { waitUntil: 'domcontentloaded' });
  await requireBodyText(game.title);
  await requireBodyText('Tutorial 1/10');
  await requireBodyText('What is this game?');
  await rejectUnavailable(route);

  for (let index = 0; index < 3; index += 1) {
    await page.getByRole('button', { name: /Next/ }).click();
  }
  await requireBodyText('Tutorial 4/10');
  await requireBodyText('Try a legal move');

  await page.getByRole('button', { name: 'Try a legal move', exact: true }).click();
  await requireBodyText('PASS ·');

  for (let index = 0; index < 6; index += 1) {
    await page.getByRole('button', { name: /Next/ }).click();
  }
  await requireBodyText('Tutorial 10/10');
  await requireBodyText('Graduated');
  await requireBodyText('Open full table');
}

let gameCount = 0;
let tutorialCount = 0;
for (const game of CARD_ACADEMY_GAMES) {
  console.log(`GAME ${gameCount + 1}/21 ${game.id}`);
  await openGame(game);
  gameCount += 1;
  console.log(`TUTORIAL ${tutorialCount + 1}/21 ${game.id}`);
  await walkTutorial(game);
  tutorialCount += 1;
}
if (gameCount !== 21 || tutorialCount !== 21) throw new Error(`Route counts ${gameCount}/${tutorialCount}`);

const representative = [
  ['academy','academy'],
  ['game/texas-holdem','texas-holdem'],
  ['game/jacks-or-better','jacks-or-better'],
  ['game/blackjack','blackjack'],
  ['game/klondike','klondike'],
  ['game/spades','spades'],
  ['game/gin-rummy','gin-rummy'],
  ['game/color-clash','color-clash'],
];
for (const [route,name] of representative) {
  console.log(`SCREENSHOT ${route}`);
  await page.goto(`${base}/#/${route}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(700);
  const output = path.join(shotDir, `${name}.png`);
  await page.screenshot({ path: output, fullPage: true });
  const size = fs.statSync(output).size;
  if (size < 10000) throw new Error(`Screenshot too small ${name}: ${size}`);
}
fs.writeFileSync(path.join(shotDir, 'runtime-status.txt'), 'game_routes=21\ntutorial_routes=21\ntutorials_walked_to_graduation=21\ninteractive_engine_moves=21\nrepresentative_webshots=8\n');
await context.close();
await browser.close();
console.log('PLAYWRIGHT_ROUTE_QUADCHECK=PASS');
