import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const live=fs.readFileSync(new URL('../src/pages/GameTutorial.jsx',import.meta.url),'utf8');
const staged=fs.readFileSync(new URL('../.integration/GameTutorial.jsx',import.meta.url),'utf8');

test('release-staged tutorial preserves the canonical mastery progress fix',()=>{
  for(const source of [live,staged]){
    assert.match(source,/markTutorialComplete/);
    assert.match(source,/family\s*:\s*game\.family/);
    assert.doesNotMatch(source,/recordTutorialCompletion/);
  }
});
