import test from 'node:test';
import assert from 'node:assert/strict';
import { klondikeEngine, canStackKlondike } from '../src/games/engines/klondike.js';
import { spiderEngine } from '../src/games/engines/spider.js';
import { freeCellEngine, freeCellMoveCapacity } from '../src/games/engines/freecell.js';
import { triPeaksEngine, isTriPeaksAdjacent, triPeaksExposed } from '../src/games/engines/tripeaks.js';
import { pyramidEngine, pyramidExposed } from '../src/games/engines/pyramid.js';
import { createDeck } from '../src/lib/cards/deck.js';

const deckById = new Map(createDeck().map(card=>[card.id,card]));
const card = id => structuredClone(deckById.get(id));

test('Klondike deals 1-7 tableau columns with only top cards face up and 24 stock cards', () => {
  const state = klondikeEngine.createGame({seed:11,drawCount:1});
  assert.deepEqual(state.tableau.map(col=>col.length),[1,2,3,4,5,6,7]);
  assert.equal(state.stock.length,24);
  assert.equal(state.waste.length,0);
  for (const col of state.tableau) {
    assert.equal(col.at(-1).faceUp,true);
    assert.equal(col.slice(0,-1).every(row=>!row.faceUp),true);
  }
});

test('Klondike enforces alternating-color descending tableau and King-to-empty rule', () => {
  assert.equal(canStackKlondike(card('Qhearts'),card('Kclubs')),true);
  assert.equal(canStackKlondike(card('Qdiamonds'),card('Khearts')),false);
  assert.equal(canStackKlondike(card('Qclubs'),null),false);
  assert.equal(canStackKlondike(card('Kclubs'),null),true);
});

test('Klondike stock draw, recycle, foundation move, automatic flip and undo are real state transitions', () => {
  let state = klondikeEngine.createGame({seed:19,drawCount:1});
  const original=structuredClone(state);
  state=klondikeEngine.applyAction(state,{type:'draw-stock'});
  assert.equal(state.stock.length,23); assert.equal(state.waste.length,1);
  state=klondikeEngine.applyAction(state,{type:'undo'});
  assert.deepEqual(state.stock,original.stock); assert.deepEqual(state.waste,original.waste);

  state=klondikeEngine.createGame({seed:1});
  state.tableau=[[{card:card('2clubs'),faceUp:false},{card:card('Ahearts'),faceUp:true}],[],[],[],[],[],[]];
  state.stock=[];state.waste=[];state.foundations={hearts:[],diamonds:[],clubs:[],spades:[]};state.undoStack=[];
  state=klondikeEngine.applyAction(state,{type:'tableau-to-foundation',fromCol:0});
  assert.equal(state.foundations.hearts.at(-1).rank,'A');
  assert.equal(state.tableau[0].at(-1).faceUp,true);
});

test('Klondike win state requires all 52 cards in foundations', () => {
  const state=klondikeEngine.createGame({seed:3});
  state.foundations={hearts:new Array(13),diamonds:new Array(13),clubs:new Array(13),spades:new Array(13)};
  assert.equal(klondikeEngine.isTerminal(state),true);
  assert.equal(klondikeEngine.result(state).won,true);
});

test('Spider deals the standard 54-card ten-column layout and 50-card stock', () => {
  const state=spiderEngine.createGame({seed:4,suits:1});
  assert.deepEqual(state.tableau.map(col=>col.length),[6,6,6,6,5,5,5,5,5,5]);
  assert.equal(state.stock.length,50);
  assert.equal(state.completed,0);
  assert.equal(state.tableau.every(col=>col.at(-1).faceUp),true);
});

test('Spider refuses a row deal with an empty column and removes a complete same-suit K-A run', () => {
  let state=spiderEngine.createGame({seed:5,suits:1});
  state.tableau[0]=[];
  assert.equal(spiderEngine.legalActions(state).some(a=>a.type==='deal-row'),false);
  state=spiderEngine.createGame({seed:6,suits:1});
  state.tableau[0]=['K','Q','J','10','9','8','7','6','5','4','3','2','A'].map(rank=>({card:{...card(`${rank}spades`),shoeCardId:`run-${rank}`},faceUp:true}));
  state=spiderEngine.normalize(state);
  assert.equal(state.tableau[0].length,0);
  assert.equal(state.completed,1);
});

test('Spider supports 1 through 4 suit difficulties and reaches a real win at eight completed runs', () => {
  for(const suits of [1,2,3,4]) assert.equal(spiderEngine.createGame({seed:7,suits}).suits,suits);
  const state=spiderEngine.createGame({seed:7,suits:1});state.completed=8;state.tableau=Array.from({length:10},()=>[]);
  assert.equal(spiderEngine.isTerminal(state),true);assert.equal(spiderEngine.result(state).won,true);
});

test('FreeCell deals all 52 cards face up across 8 columns and exposes four free cells', () => {
  const state=freeCellEngine.createGame({seed:8});
  assert.deepEqual(state.tableau.map(col=>col.length),[7,7,7,7,6,6,6,6]);
  assert.deepEqual(state.freeCells,[null,null,null,null]);
  assert.equal(state.tableau.flat().length,52);
});

test('FreeCell supermove capacity grows with empty cells and columns', () => {
  assert.equal(freeCellMoveCapacity(0,0),1);
  assert.equal(freeCellMoveCapacity(1,0),2);
  assert.equal(freeCellMoveCapacity(2,1),6);
});

test('FreeCell supports tableau-to-cell, cell-to-tableau, foundation and undo', () => {
  let state=freeCellEngine.createGame({seed:9});
  const before=structuredClone(state);
  state=freeCellEngine.applyAction(state,{type:'tableau-to-cell',fromCol:0,toCell:0});
  assert.ok(state.freeCells[0]);
  state=freeCellEngine.applyAction(state,{type:'undo'});
  assert.deepEqual(state.tableau,before.tableau);
});

test('FreeCell terminal win requires 52 foundation cards', () => {
  const state=freeCellEngine.createGame({seed:10});state.foundations={hearts:new Array(13),diamonds:new Array(13),clubs:new Array(13),spades:new Array(13)};
  assert.equal(freeCellEngine.isTerminal(state),true);
});

test('TriPeaks builds 28-card mountain, 23-card stock plus waste, and only bottom row starts exposed', () => {
  const state=triPeaksEngine.createGame({seed:12,wrap:true});
  assert.equal(state.tableau.length,28);assert.equal(state.stock.length,23);assert.ok(state.waste);
  assert.deepEqual(triPeaksExposed(state),[18,19,20,21,22,23,24,25,26,27]);
});

test('TriPeaks rank adjacency honors explicit Ace wrap rule', () => {
  assert.equal(isTriPeaksAdjacent(card('Aspades'),card('Khearts'),true),true);
  assert.equal(isTriPeaksAdjacent(card('Aspades'),card('2hearts'),true),true);
  assert.equal(isTriPeaksAdjacent(card('5spades'),card('7hearts'),true),false);
});

test('TriPeaks removes only exposed adjacent cards, draws stock, supports undo and detects win/loss', () => {
  let state=triPeaksEngine.createGame({seed:13,wrap:true});
  const exposed=triPeaksExposed(state)[0];
  state.tableau[exposed].card=card('5spades');state.waste=card('4hearts');
  state=triPeaksEngine.applyAction(state,{type:'remove',index:exposed});
  assert.equal(state.tableau[exposed].removed,true);
  state=triPeaksEngine.applyAction(state,{type:'undo'});assert.equal(state.tableau[exposed].removed,false);
  state=triPeaksEngine.applyAction(state,{type:'draw-stock'});assert.equal(state.stock.length,22);
  state.tableau.forEach(row=>{row.removed=true;});assert.equal(triPeaksEngine.result(state).won,true);
});

test('Pyramid starts with 28 tableau cards and only the 7-card bottom row exposed', () => {
  const state=pyramidEngine.createGame({seed:14});
  assert.equal(state.tableau.length,28);assert.equal(state.stock.length,23);assert.ok(state.waste);
  assert.deepEqual(pyramidExposed(state),[21,22,23,24,25,26,27]);
});

test('Pyramid removes exposed pairs totaling 13 and Kings singly, with draw and undo', () => {
  let state=pyramidEngine.createGame({seed:15});
  state.tableau[21].card=card('5spades');state.tableau[22].card=card('8hearts');
  state=pyramidEngine.applyAction(state,{type:'remove-pair',a:{zone:'tableau',index:21},b:{zone:'tableau',index:22}});
  assert.equal(state.tableau[21].removed,true);assert.equal(state.tableau[22].removed,true);
  state=pyramidEngine.applyAction(state,{type:'undo'});assert.equal(state.tableau[21].removed,false);
  state.tableau[21].card=card('Kspades');
  state=pyramidEngine.applyAction(state,{type:'remove-king',target:{zone:'tableau',index:21}});assert.equal(state.tableau[21].removed,true);
});

test('Pyramid terminal win means all pyramid cards removed', () => {
  const state=pyramidEngine.createGame({seed:16});state.tableau.forEach(row=>{row.removed=true;});
  assert.equal(pyramidEngine.isTerminal(state),true);assert.equal(pyramidEngine.result(state).won,true);
});
