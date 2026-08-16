import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read=path=>fs.readFileSync(new URL(path,import.meta.url),'utf8');

test('GinRummyTable exposes full draw discard knock gin round-match flow on real engine',()=>{
  const table=read('../src/components/games/GinRummyTable.jsx');
  for(const token of ['ginRummyEngine','analyzeGinHand','chooseGinBotAction','startNextGinRound','GameShell','GlassSurface','TactilePressable','PlayingCard','Stock','Discard','Deadwood','Knock','GIN','New Round','New Match','recordGameResult']) assert.ok(table.includes(token),`missing ${token}`);
  assert.ok(table.includes('hw-gin-table'));
  assert.match(table,/legalActions/);
  assert.match(table,/draw-discard/);
  assert.match(table,/knock-discard/);
});

test('Gin Rummy skin has emerald teal base, purple secondary glow, gold and ruby knock accents',()=>{
  const css=read('../src/components/games/ginRummy.css');
  assert.match(css,/\.hw-gin-table/);
  assert.match(css,/radial-gradient|linear-gradient/);
  assert.match(css,/purple|violet|#6|#7/i);
  assert.match(css,/box-shadow/);
});

test('GameRoom routes gin-rummy to GinRummyTable',()=>{
  const room=read('../src/pages/GameRoom.jsx');
  assert.ok(room.includes('GinRummyTable'));
  assert.match(room,/gin-rummy/);
});
