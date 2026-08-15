import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (path) => fs.readFileSync(new URL(path, import.meta.url), 'utf8');

test('Card Academy lobby uses the locked Google-3 premium primitives', () => {
  const lobby = read('../src/pages/CardAcademyLobby.jsx');
  for (const token of ['GlassSurface','TactilePressable','RevealItem','Daily Challenge','Continue Learning','Recently Played']) {
    assert.ok(lobby.includes(token), `Lobby must include ${token}`);
  }
  assert.match(lobby, /CARD_ACADEMY_GAMES|gamesByFamily/);
});

test('family tiles expose tactile premium category discovery', () => {
  const tile = read('../src/components/games/GameFamilyTile.jsx');
  assert.ok(tile.includes('TactilePressable'));
  assert.ok(tile.includes('GlassSurface'));
  assert.match(tile, /family|theme/);
});
