import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (path) => fs.readFileSync(new URL(path, import.meta.url), 'utf8');

test('App routes to Card Academy instead of hardcoding PracticeVP', () => {
  const app = read('../src/App.jsx');
  assert.equal(app.includes('<PracticeVP />'), false, 'App must not hardcode the old one-game trainer');
  assert.match(app, /path=["']\/academy["']/);
  assert.match(app, /path=["']\/game\/:gameId["']/);
  assert.match(app, /path=["']\/game\/:gameId\/tutorial["']/);
});

test('Card Academy lobby and game room source files exist', () => {
  assert.doesNotThrow(() => read('../src/pages/CardAcademyLobby.jsx'));
  assert.doesNotThrow(() => read('../src/pages/GameRoom.jsx'));
  assert.doesNotThrow(() => read('../src/pages/GameTutorial.jsx'));
});
