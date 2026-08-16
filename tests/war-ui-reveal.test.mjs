import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source=fs.readFileSync(new URL('../src/components/games/FamilyTable.jsx',import.meta.url),'utf8');

test('War premium table renders the latest face-up comparison instead of only two card backs',()=>{
  assert.match(source,/lastBattle\?\.reveals/);
  assert.ok(source.includes('PlayingCard'));
  assert.ok(source.includes('WAR'));
});
