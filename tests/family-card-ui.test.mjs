import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read=path=>fs.readFileSync(new URL(path,import.meta.url),'utf8');

test('FamilyTable routes all five full family engines through real playable modes',()=>{
  const table=read('../src/components/games/FamilyTable.jsx');
  for(const token of ['crazyEightsEngine','goFishEngine','warEngine','speedEngine','colorClashEngine','chooseCrazyEightsBotAction','chooseGoFishBotAction','chooseSpeedBotAction','chooseColorClashBotAction','GameShell','GlassSurface','TactilePressable','PlayingCard','Crazy Eights','Go Fish','War','Speed','Color Clash','New Game','recordGameResult']) assert.ok(table.includes(token),`missing ${token}`);
  assert.ok(table.includes('hw-family-table'));
  assert.match(table,/legalActions/);
  assert.match(table,/Last Spark/);
  assert.match(table,/chosenSuit|chosenColor/);
});

test('Family skin keeps HoldWise obsidian glass shell while allowing brighter Color Clash spectrum energy',()=>{
  const css=read('../src/components/games/familyTable.css');
  assert.match(css,/\.hw-family-table/);
  assert.match(css,/radial-gradient|linear-gradient/);
  assert.match(css,/ember|violet|spectrum|#e|#7/i);
  assert.match(css,/box-shadow/);
});

test('GameRoom routes all five family IDs to FamilyTable',()=>{
  const room=read('../src/pages/GameRoom.jsx');
  assert.ok(room.includes('FamilyTable'));
  assert.ok(room.includes('FAMILY_GAME_IDS'));
});
