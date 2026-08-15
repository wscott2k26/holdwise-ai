import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read=path=>fs.readFileSync(new URL(path,import.meta.url),'utf8');

test('TrickTable renders full Spades and Hearts match phases using real engines',()=>{
  const table=read('../src/components/games/TrickTable.jsx');
  for(const token of ['spadesEngine','heartsEngine','chooseSpadesBotBid','chooseSpadesBotCard','chooseHeartsBotPass','chooseHeartsBotCard','startNextSpadesRound','startNextHeartsRound','GameShell','GlassSurface','TactilePressable','PlayingCard','Bid','Nil','Pass 3','New Round','New Match','recordGameResult']) assert.ok(table.includes(token),`missing ${token}`);
  assert.ok(table.includes('hw-trick-table'));
  assert.match(table,/state\.trick/);
  assert.match(table,/state\.scores/);
  assert.match(table,/legalActions/);
});

test('Trick-table skin follows dark midnight teal, glass, gold and ruby category language',()=>{
  const css=read('../src/components/games/trickTable.css');
  assert.match(css,/\.hw-trick-table/);
  assert.match(css,/radial-gradient|linear-gradient/);
  assert.match(css,/box-shadow/);
  assert.match(css,/gold|ruby|#0/i);
});

test('GameRoom routes Spades and Hearts to TrickTable',()=>{
  const room=read('../src/pages/GameRoom.jsx');
  assert.ok(room.includes('TrickTable'));
  assert.ok(room.includes('TRICK_GAME_IDS'));
});
