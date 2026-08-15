import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync(new URL('../src/components/games/VideoPokerTable.jsx', import.meta.url),'utf8');

test('video poker result is rendered through a React component, not an unknown lowercase HTML element', () => {
  assert.match(source,/function MotionResult\(/);
  assert.match(source,/<MotionResult\s+result=/);
  assert.equal(source.includes('<motionResult'),false);
});
