import fs from 'node:fs';

function copy(from,to){
  fs.copyFileSync(from,to);
  console.log(`copied ${from} -> ${to}`);
}

copy('.integration/engineRegistry.js','src/games/engineRegistry.js');
copy('.integration/GameRoom.jsx','src/pages/GameRoom.jsx');
copy('.integration/GameTutorial.jsx','src/pages/GameTutorial.jsx');

const speedPath='src/games/engines/speed.js';
let speed=fs.readFileSync(speedPath,'utf8');
speed=speed.replace(
  "function result(state){return{complete:state.gameComplete,winners:state.winners,draw:state.draw,plays:state.plays,cardsRemaining:state.players.map(p=>p.hand.length+p.stock.length)};}",
  "function result(state){const dynamicWinners=state.players.filter(player=>player.hand.length===0&&player.stock.length===0).map(player=>player.seat);const winners=state.winners?.length?state.winners:dynamicWinners;return{complete:Boolean(state.gameComplete)||winners.length>0,winners,draw:Boolean(state.draw)||(winners.length>1),plays:state.plays,cardsRemaining:state.players.map(p=>p.hand.length+p.stock.length)};}"
);
speed=speed.replace(
  "export const speedEngine={id:'speed',createGame,legalActions,applyAction,isTerminal:state=>Boolean(state.gameComplete),result,coachFacts};",
  "export const speedEngine={id:'speed',createGame,legalActions,applyAction,isTerminal:state=>Boolean(state.gameComplete)||state.players.some(player=>player.hand.length===0&&player.stock.length===0),result,coachFacts};"
);
fs.writeFileSync(speedPath,speed);
console.log('patched Speed dynamic terminal/result contract');
