import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

const app = read('src/App.jsx');
const atmosphere = read('src/components/premium/CinematicBackdrop.jsx');
const sensory = read('src/components/premium/SensoryControls.jsx');
const shell = read('src/components/games/GameShell.jsx');
const context = read('src/lib/appContext.jsx');
const css = read('src/index.css');

test('premium v7 exposes the five-part mobile navigation', () => {
  for (const route of ['/home', '/games', '/practice', '/learn', '/progress']) {
    assert.match(app, new RegExp(route.replace('/', '\\/')));
  }
  const nav = read('src/components/premium/PremiumBottomNav.jsx');
  for (const label of ['Home', 'Games', 'Practice', 'Learn', 'Progress']) assert.match(nav, new RegExp(label));
});

test('premium v7 uses real licensed casino/card photography with a rotating fallback-safe atmosphere', () => {
  assert.match(atmosphere, /images\.unsplash\.com\/photo-/);
  assert.ok((atmosphere.match(/images\.unsplash\.com\/photo-/g) || []).length >= 5);
  assert.match(atmosphere, /12000/);
  assert.match(atmosphere, /rotatingBackgrounds/);
  assert.match(atmosphere, /backgroundMotion/);
  assert.match(atmosphere, /hw-photo-stage/);
});

test('casino ambience is opt-in and persisted with off low high levels', () => {
  assert.match(context, /casinoAmbience:\s*["']off["']/);
  assert.match(context, /rotatingBackgrounds:\s*true/);
  assert.match(context, /backgroundMotion:\s*true/);
  assert.match(sensory, /Casino ambience/);
  assert.match(sensory, /low/);
  assert.match(sensory, /high/);
  assert.match(atmosphere, /setCasinoAmbience/);
});

test('the rebuild adds functional home games practice learn and progress hubs', () => {
  for (const path of [
    'src/pages/PremiumHome.jsx',
    'src/pages/GameLibrary.jsx',
    'src/pages/PracticeHub.jsx',
    'src/pages/LearnHub.jsx',
    'src/pages/ProgressHub.jsx',
  ]) assert.ok(fs.existsSync(new URL(`../${path}`, import.meta.url)), `Missing ${path}`);
});

test('all real game tables inherit the premium stage without replacing the engines', () => {
  assert.match(shell, /hw-premium-game-stage/);
  assert.match(shell, /AskCoachButton/);
  assert.match(css, /\.hw-premium-game-stage/);
  assert.match(css, /\.hw-library-game-card/);
  assert.match(css, /\.hw-photo-stage/);
});
