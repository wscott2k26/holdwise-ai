import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source=fs.readFileSync(new URL('../src/components/games/SolitaireTable.jsx',import.meta.url),'utf8');

test('Solitaire foundation card is not a button nested inside another button',()=>{
  assert.equal(/<button[^>]*>[\s\S]{0,400}\{card\?<MiniCard/.test(source),false);
  assert.ok(source.includes('function Foundation'));
});
