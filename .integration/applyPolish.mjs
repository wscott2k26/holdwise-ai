import fs from 'node:fs';

const speedPath='src/games/engines/speed.js';
let speed=fs.readFileSync(speedPath,'utf8');
if(!speed.includes('function permanentStall(state)')){
  speed=speed.replace(
    'export function chooseSpeedBotAction',
    "function permanentStall(state){return !state.players.some(player=>player.hand.length===0&&player.stock.length===0)&&noOneCanPlay(state)&&!canFlip(state);}\nexport function chooseSpeedBotAction"
  );
}
speed=speed.replace(
  "if(!legal.length){state.stalled=true;break;}",
  "if(!legal.length){state.stalled=true;state.gameComplete=true;state.draw=true;state.winners=[];break;}"
);
speed=speed.replace(
  "draw:Boolean(state.draw)||(winners.length>1)",
  "draw:Boolean(state.draw)||(winners.length>1)||permanentStall(state)"
);
speed=speed.replace(
  "isTerminal:state=>Boolean(state.gameComplete)||state.players.some(player=>player.hand.length===0&&player.stock.length===0)",
  "isTerminal:state=>Boolean(state.gameComplete)||state.players.some(player=>player.hand.length===0&&player.stock.length===0)||permanentStall(state)"
);
fs.writeFileSync(speedPath,speed);
console.log('Speed permanent-stall draw contract applied');

const solitairePath='src/components/games/SolitaireTable.jsx';
let solitaire=fs.readFileSync(solitairePath,'utf8');
const foundation=/function Foundation\(\{card,suit,onClick,selected\}\)\{[\s\S]*?\n\nfunction KlondikeBoard/;
const replacement=`function Foundation({card,suit,onClick,selected}){
  const symbol=({hearts:'♥',diamonds:'♦',clubs:'♣',spades:'♠'})[suit];
  if(card)return <div className={\`flex h-[62px] w-11 items-center justify-center rounded-lg \${selected?'hw-solitaire-action-glow':''}\`}><MiniCard card={card} selected={selected} onClick={onClick}/></div>;
  return <button type="button" onClick={onClick} className={\`hw-solitaire-slot flex h-[62px] w-11 items-center justify-center rounded-lg \${selected?'hw-solitaire-action-glow':''}\`}><span className="text-lg text-white/18">{symbol}</span></button>;
}

function KlondikeBoard`;
if(!foundation.test(solitaire))throw new Error('Could not locate Solitaire Foundation component for DOM polish');
solitaire=solitaire.replace(foundation,replacement);
fs.writeFileSync(solitairePath,solitaire);
console.log('Solitaire foundation nested-button pattern removed');
