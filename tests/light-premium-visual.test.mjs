import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('HoldWise defaults to the complete Gemini-inspired light premium palette', () => {
  const css = read('src/index.css');
  const context = read('src/lib/appContext.jsx');

  for (const token of [
    '--hw-pearl', '--hw-sky', '--hw-aqua', '--hw-mint', '--hw-lavender',
    '--hw-coral', '--hw-royal', '--hw-sunshine', '--hw-ink',
  ]) {
    assert.match(css, new RegExp(token), `missing ${token}`);
  }

  for (const family of ['poker', 'casino', 'solitaire', 'classics', 'family']) {
    assert.match(css, new RegExp(`\\.hw-family-${family}\\b`), `missing ${family} family identity`);
  }

  assert.match(context, /theme:\s*["']light["']/);
  assert.doesNotMatch(context, /theme:\s*["']dark["']/);
});

test('lobby and shared game shell use light surfaces with ink text', () => {
  const lobby = read('src/pages/CardAcademyLobby.jsx');
  const familyTile = read('src/components/games/GameFamilyTile.jsx');
  const gameShell = read('src/components/games/GameShell.jsx');

  assert.match(lobby, /hw-academy-hero/);
  assert.match(lobby, /hw-progress-card/);
  assert.match(lobby, /hw-mini-card/);
  assert.match(lobby, /text-\[hsl\(var\(--hw-ink\)\)\]/);
  assert.doesNotMatch(lobby, /text-white(?:\/\d+)?\b/);

  assert.match(familyTile, /hw-family-tile/);
  assert.match(familyTile, /text-\[hsl\(var\(--hw-ink\)\)\]/);
  assert.doesNotMatch(familyTile, /bg-black|text-white/);

  assert.match(gameShell, /hw-game-shell/);
  assert.match(gameShell, /text-\[hsl\(var\(--hw-ink\)\)\]/);
  assert.doesNotMatch(gameShell, /text-white(?:\/\d+)?\b/);
});

test('native boot and web shell start on visibly light pearl surfaces', () => {
  const boot = read('native/ios/HoldWiseAI/Sources/StormAndMeBootView.swift');
  const controller = read('native/ios/HoldWiseAI/Sources/HoldWiseWebViewController.swift');

  assert.match(boot, /backgroundColor = UIColor\(red: 0\.95, green: 0\.97, blue: 1\.00, alpha: 1\)/);
  assert.match(controller, /backgroundColor = UIColor\(red: 0\.95, green: 0\.97, blue: 1\.00, alpha: 1\)/);
  assert.match(boot, /companyLabel\.textColor = UIColor\(red: 0\.05, green: 0\.11, blue: 0\.24, alpha: 1\)/);
});
