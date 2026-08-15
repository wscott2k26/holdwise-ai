import test from 'node:test';
import assert from 'node:assert/strict';
import { loadCardAcademyProgress, recordGameResult, markTutorialComplete } from '../src/lib/cardAcademyProgress.js';

function storageStub() { const m=new Map(); return { getItem:k=>m.get(k)??null, setItem:(k,v)=>m.set(k,String(v)), removeItem:k=>m.delete(k) }; }

test('progress persists tutorials, plays, wins, recent games and family mastery inputs', () => {
  const storage = storageStub();
  markTutorialComplete('blackjack', { family:'casino', xp:100 }, storage, '2026-08-15T18:00:00.000Z');
  recordGameResult('blackjack', { family:'casino', won:true, xp:25 }, storage, '2026-08-15T18:05:00.000Z');
  recordGameResult('spades', { family:'classics', won:false, xp:10 }, storage, '2026-08-15T18:10:00.000Z');
  const p = loadCardAcademyProgress(storage);
  assert.equal(p.games.blackjack.tutorialComplete, true);
  assert.equal(p.games.blackjack.plays, 1);
  assert.equal(p.games.blackjack.wins, 1);
  assert.equal(p.games.spades.plays, 1);
  assert.equal(p.totalXp, 135);
  assert.deepEqual(p.recentGames.slice(0,2), ['spades','blackjack']);
  assert.equal(p.families.casino.plays, 1);
  assert.equal(p.families.classics.plays, 1);
});
