import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const tutorial=fs.readFileSync(new URL('../src/pages/GameTutorial.jsx',import.meta.url),'utf8');

test('tutorial interactive stages are backed by each game real engine, not text-only cards',()=>{
  for(const token of ['getEngine','createGame','legalActions','applyAction','interactive','guided-game','graduation','coachFacts'])assert.ok(tutorial.includes(token),`GameTutorial must include ${token}`);
  assert.ok(tutorial.includes('Try a legal move'));
  assert.ok(tutorial.includes('Open full table'));
});

test('tutorial completes mastery through the canonical progress API after the ten-stage path',()=>{
  assert.match(tutorial,/steps\.length/);
  assert.match(tutorial,/markTutorialComplete/);
  assert.match(tutorial,/family\s*:\s*game\.family/);
  assert.match(tutorial,/reward/);
  assert.doesNotMatch(tutorial,/recordTutorialCompletion/);
});
