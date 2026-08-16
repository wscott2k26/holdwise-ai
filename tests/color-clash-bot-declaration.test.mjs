import test from 'node:test';
import assert from 'node:assert/strict';
import { colorClashEngine, chooseColorClashBotAction } from '../src/games/engines/colorClash.js';

test('Color Clash bot calls Last Spark when its legal play would leave one card',()=>{
  const state=colorClashEngine.createGame({seed:901,humanSeat:0,targetScore:999});
  state.actor=1;
  const playable=state.players[1].hand.find(card=>colorClashEngine.legalActions(state,1).some(action=>action.type==='play'&&action.cardId===card.id));
  if(!playable){
    state.players[1].hand[0]={id:'bot-play',color:state.currentColor,symbol:'3',number:3,type:'number',name:'bot three',points:3};
  }
  const legalCard=state.players[1].hand.find(card=>colorClashEngine.legalActions(state,1).some(action=>action.type==='play'&&action.cardId===card.id));
  state.players[1].hand=[legalCard,{id:'last-card',color:'violet',symbol:'9',number:9,type:'number',name:'last',points:9}];
  const action=chooseColorClashBotAction(state,1);
  assert.equal(action.type,'play');
  assert.equal(action.declareLastSpark,true);
});
