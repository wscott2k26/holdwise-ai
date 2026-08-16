import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read=path=>fs.readFileSync(new URL(path,import.meta.url),'utf8');
const tables=['HoldemTable.jsx','VideoPokerTable.jsx','BlackjackTable.jsx','SolitaireTable.jsx','TrickTable.jsx','GinRummyTable.jsx','FamilyTable.jsx'];

test('all seven full-play table families retain Liquid Glass + Tactile premium primitives',()=>{
  for(const file of tables){
    const source=read(`../src/components/games/${file}`);
    assert.ok(source.includes('GameShell'),`${file} missing shared cinematic shell`);
    assert.ok(source.includes('GlassSurface'),`${file} missing liquid glass surfaces`);
    assert.ok(source.includes('TactilePressable'),`${file} missing tactile controls`);
  }
});

test('card and button primitives preserve motion, press depth and reduced-motion handling',()=>{
  const card=read('../src/components/PlayingCard.jsx');
  const press=read('../src/components/premium/TactilePressable.jsx');
  assert.match(card,/motion\./);assert.match(card,/reducedMotion/);assert.match(card,/whileTap/);
  assert.match(press,/motion\./);assert.match(press,/reducedMotion/);assert.match(press,/whileTap/);
});

test('every family skin uses layered gradients and depth shadows instead of flat backgrounds',()=>{
  for(const file of ['holdem.css','videoPoker.css','blackjack.css','solitaire.css','trickTable.css','ginRummy.css','familyTable.css']){
    const css=read(`../src/components/games/${file}`);
    assert.match(css,/gradient/);assert.match(css,/box-shadow/);
  }
});
