import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (path) => fs.readFileSync(new URL(path, import.meta.url), 'utf8');

test('HoldemTable exposes the complete premium table and action hierarchy', () => {
  const table = read('../src/components/games/HoldemTable.jsx');
  for (const token of ['texasHoldemEngine','GlassSurface','TactilePressable','PlayingCard','Coach','Fold','Check','Call','Raise','All In','New Hand','New Match']) {
    assert.ok(table.includes(token), `HoldemTable must include ${token}`);
  }
  assert.ok(table.includes('hw-holdem-felt'), 'Holdem must use the emerald premium felt table');
  assert.ok(table.includes('type="range"'), 'Holdem must provide full bet/raise sizing, not fixed demo bets');
  assert.match(table, /runBotsUntilHumanTurn/);
});

test('Holdem felt skin carries the researched dark emerald plus premium depth treatment', () => {
  const css = read('../src/components/games/holdem.css');
  assert.match(css, /\.hw-holdem-felt/);
  assert.match(css, /radial-gradient/);
  assert.match(css, /#0[0-9a-f]{5}/i);
  assert.match(css, /box-shadow/);
});

test('GameRoom renders the real Holdem table for texas-holdem', () => {
  const room = read('../src/pages/GameRoom.jsx');
  assert.ok(room.includes('HoldemTable'));
  assert.match(room, /texas-holdem/);
});
