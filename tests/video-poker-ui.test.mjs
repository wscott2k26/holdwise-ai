import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = path => fs.readFileSync(new URL(path, import.meta.url),'utf8');

test('VideoPokerTable exposes six catalog-driven full modes with premium machine controls', () => {
  const table = read('../src/components/games/VideoPokerTable.jsx');
  for (const token of ['VIDEO_POKER_VARIANTS','videoPokerEngine','GlassSurface','TactilePressable','PlayingCard','Pay Table','Credits','Deal','Draw','Hold','New Hand','Ask Coach Ace']) {
    assert.ok(table.includes(token), `VideoPokerTable must include ${token}`);
  }
  assert.ok(table.includes('hw-vp-machine'));
  assert.match(table,/Object\.keys\(VIDEO_POKER_VARIANTS\)/);
  assert.match(table,/VIDEO_POKER_IDS\.map/);
});

test('GameRoom routes all six video poker games to VideoPokerTable', () => {
  const room = read('../src/pages/GameRoom.jsx');
  assert.ok(room.includes('VideoPokerTable'));
  assert.ok(room.includes('VIDEO_POKER_IDS'));
});

test('video poker skin has dark casino chrome, gold, emerald and ruby accents', () => {
  const css = read('../src/components/games/videoPoker.css');
  assert.match(css,/\.hw-vp-machine/);
  assert.match(css,/linear-gradient|radial-gradient/);
  assert.match(css,/#0[0-9a-f]{5}/i);
  assert.match(css,/box-shadow/);
});
