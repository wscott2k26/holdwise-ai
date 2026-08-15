import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync(new URL('../src/components/games/VideoPokerTable.jsx', import.meta.url),'utf8');

test('video poker hold phase has no no-op Hold selected button', () => {
  assert.equal(source.includes("onClick={()=>state.hand.forEach((_,index)=>{ if(state.holdMask[index]){} })}"), false);
  assert.match(source,/Held \{state\.holdMask\.filter\(Boolean\)\.length\} of 5/);
});
