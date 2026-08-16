import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source=fs.readFileSync(new URL('../src/pages/GameRoom.jsx',import.meta.url),'utf8');

test('GameRoom has no development placeholder path after all 21 full modes are routed',()=>{
  assert.equal(source.includes('Engine registered. Loading the family-specific premium table.'),false);
  assert.equal(source.includes('Engine validation is still running'),false);
  for(const token of ['HoldemTable','VIDEO_POKER_IDS','BlackjackTable','SOLITAIRE_IDS','TRICK_GAME_IDS','GinRummyTable','FAMILY_GAME_IDS'])assert.ok(source.includes(token),`missing route token ${token}`);
});
