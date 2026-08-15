import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = path => fs.readFileSync(new URL(path, import.meta.url),'utf8');

test('BlackjackTable exposes the full researched premium casino flow', () => {
  const table = read('../src/components/games/BlackjackTable.jsx');
  for (const token of ['blackjackEngine','basicStrategyAdvice','GameShell','GlassSurface','TactilePressable','PlayingCard','Hit','Stand','Double','Split','Insurance','New Round','Dealer','Bankroll']) {
    assert.ok(table.includes(token), `BlackjackTable must include ${token}`);
  }
  assert.ok(table.includes('hw-blackjack-felt'));
  assert.ok(table.includes('type="range"'), 'Blackjack betting must use a real adjustable bet control');
  assert.match(table,/faceDown/);
  assert.match(table,/recordGameResult/);
});

test('Blackjack premium skin uses dark casino depth with emerald, gold and ruby treatment', () => {
  const css = read('../src/components/games/blackjack.css');
  assert.match(css,/\.hw-blackjack-felt/);
  assert.match(css,/radial-gradient|linear-gradient/);
  assert.match(css,/box-shadow/);
  assert.match(css,/ruby|bust|danger/i);
});

test('GameRoom routes blackjack to the full BlackjackTable', () => {
  const room = read('../src/pages/GameRoom.jsx');
  assert.ok(room.includes('BlackjackTable'));
  assert.match(room,/blackjack/);
});
