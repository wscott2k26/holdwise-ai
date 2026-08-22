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

test('premium V7 keeps browsing bright while game tables use focused casino felt', () => {
  const home = read('src/pages/PremiumHome.jsx');
  const library = read('src/pages/GameLibrary.jsx');
  const gameShell = read('src/components/games/GameShell.jsx');
  const premiumCss = read('src/styles/casinoPremiumV7.css');

  assert.match(home, /hw-photo-glass-panel/);
  assert.match(home, /hw-home-hero/);
  assert.match(library, /hw-library-game-card/);
  assert.match(premiumCss, /--hw-v7-ivory/);
  assert.match(premiumCss, /--hw-v7-mint/);
  assert.match(gameShell, /hw-game-topbar/);
  assert.match(gameShell, /hw-premium-game-stage/);
  assert.match(premiumCss, /\.hw-game-topbar[\s\S]*rgba\(250,255,252/);
  assert.match(premiumCss, /\.hw-premium-game-stage[\s\S]*hsl\(157 63% 15%\)/);
});

test('native boot and web shell start on visibly light pearl surfaces', () => {
  const boot = read('native/ios/HoldWiseAI/Sources/StormAndMeBootView.swift');
  const controller = read('native/ios/HoldWiseAI/Sources/HoldWiseWebViewController.swift');

  assert.match(boot, /backgroundColor = UIColor\(red: 0\.95, green: 0\.97, blue: 1\.00, alpha: 1\)/);
  assert.match(controller, /backgroundColor = UIColor\(red: 0\.95, green: 0\.97, blue: 1\.00, alpha: 1\)/);
  assert.match(boot, /companyLabel\.textColor = UIColor\(red: 0\.05, green: 0\.11, blue: 0\.24, alpha: 1\)/);
});

test('generated iOS project preserves modern full-screen launch metadata and a light launch frame', () => {
  const project = read('native/ios/HoldWiseAI/project.yml');
  const plist = read('native/ios/HoldWiseAI/Resources/Info.plist');
  const launch = read('native/ios/HoldWiseAI/Resources/LaunchScreen.storyboard');

  assert.match(project, /INFOPLIST_FILE:\s*Resources\/Info\.plist/);
  assert.doesNotMatch(project, /\n\s*info:\s*\n\s*path:\s*Resources\/Info\.plist/);
  assert.match(plist, /<key>UILaunchStoryboardName<\/key><string>LaunchScreen<\/string>/);
  assert.match(launch, /appearance="light"/);
  assert.match(launch, /red="0\.95" green="0\.97" blue="1\.00"/);
});
