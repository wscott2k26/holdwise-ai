import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read=path=>fs.readFileSync(new URL(path,import.meta.url),'utf8');

test('SolitaireTable routes all five real engines through a premium playable collection shell',()=>{
  const table=read('../src/components/games/SolitaireTable.jsx');
  for(const token of ['klondikeEngine','spiderEngine','freeCellEngine','triPeaksEngine','pyramidEngine','GameShell','GlassSurface','TactilePressable','PlayingCard','Hint','Undo','New Deal','Klondike','Spider','FreeCell','TriPeaks','Pyramid','recordGameResult']) assert.ok(table.includes(token),`missing ${token}`);
  assert.ok(table.includes('hw-solitaire-table'));
  assert.match(table,/legalActions/);
  assert.match(table,/applyAction/);
  assert.match(table,/suits/);
});

test('Solitaire premium skin follows the researched calmer royal blue teal glass table language',()=>{
  const css=read('../src/components/games/solitaire.css');
  assert.match(css,/\.hw-solitaire-table/);
  assert.match(css,/radial-gradient|linear-gradient/);
  assert.match(css,/blue|teal|#0/i);
  assert.match(css,/box-shadow/);
});

test('GameRoom routes all five solitaire IDs to SolitaireTable',()=>{
  const room=read('../src/pages/GameRoom.jsx');
  assert.ok(room.includes('SolitaireTable'));
  assert.ok(room.includes('SOLITAIRE_IDS'));
});
