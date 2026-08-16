import fs from 'node:fs';

function copy(from,to){fs.copyFileSync(from,to);}
copy('.integration/engineRegistry.js','src/games/engineRegistry.js');
copy('.integration/GameRoom.jsx','src/pages/GameRoom.jsx');
copy('.integration/GameTutorial.jsx','src/pages/GameTutorial.jsx');

// Speed: an unrecoverable no-move/no-reserve state is a real terminal draw.
const speedPath='src/games/engines/speed.js';
let speed=fs.readFileSync(speedPath,'utf8');
if(!speed.includes('function permanentStall(state)'))speed=speed.replace('export function chooseSpeedBotAction',"function permanentStall(state){return !state.players.some(player=>player.hand.length===0&&player.stock.length===0)&&noOneCanPlay(state)&&!canFlip(state);}\nexport function chooseSpeedBotAction");
speed=speed.replace("if(!legal.length){state.stalled=true;break;}","if(!legal.length){state.stalled=true;state.gameComplete=true;state.draw=true;state.winners=[];break;}");
speed=speed.replace("draw:Boolean(state.draw)||(winners.length>1)","draw:Boolean(state.draw)||(winners.length>1)||permanentStall(state)");
speed=speed.replace("isTerminal:state=>Boolean(state.gameComplete)||state.players.some(player=>player.hand.length===0&&player.stock.length===0)","isTerminal:state=>Boolean(state.gameComplete)||state.players.some(player=>player.hand.length===0&&player.stock.length===0)||permanentStall(state)");
fs.writeFileSync(speedPath,speed);

// Solitaire: remove nested button in Foundation slot.
const solitairePath='src/components/games/SolitaireTable.jsx';
let solitaire=fs.readFileSync(solitairePath,'utf8');
if(/function Foundation\(\{card,suit,onClick,selected\}\)\{[\s\S]*?\n\nfunction KlondikeBoard/.test(solitaire)){
  solitaire=solitaire.replace(/function Foundation\(\{card,suit,onClick,selected\}\)\{[\s\S]*?\n\nfunction KlondikeBoard/,`function Foundation({card,suit,onClick,selected}){
  const symbol=({hearts:'♥',diamonds:'♦',clubs:'♣',spades:'♠'})[suit];
  if(card)return <div className={\`flex h-[62px] w-11 items-center justify-center rounded-lg \${selected?'hw-solitaire-action-glow':''}\`}><MiniCard card={card} selected={selected} onClick={onClick}/></div>;
  return <button type="button" onClick={onClick} className={\`hw-solitaire-slot flex h-[62px] w-11 items-center justify-center rounded-lg \${selected?'hw-solitaire-action-glow':''}\`}><span className="text-lg text-white/18">{symbol}</span></button>;
}

function KlondikeBoard`);
}
fs.writeFileSync(solitairePath,solitaire);

// Color Clash: smart bots call Last Spark when their play leaves one card.
const clashPath='src/games/engines/colorClash.js';
let clash=fs.readFileSync(clashPath,'utf8');
clash=clash.replace(/export function chooseColorClashBotAction\(state,actor=state\.actor\)\{[\s\S]*?\nexport function startNextColorClashRound/,`export function chooseColorClashBotAction(state,actor=state.actor){
  const legal=legalActions(state,actor);if(!legal.length)throw new Error('Color Clash bot has no legal action');
  const plays=legal.filter(action=>action.type==='play');
  if(plays.length){
    const hand=state.players[actor].hand;
    const colorCounts=Object.fromEntries(COLOR_CLASH_COLORS.map(color=>[color,hand.filter(card=>card.color===color).length]));
    const chosen=plays.slice().sort((a,b)=>{const ca=hand.find(card=>card.id===a.cardId),cb=hand.find(card=>card.id===b.cardId);return Number(cb?.points||0)-Number(ca?.points||0)+(b.chosenColor?colorCounts[b.chosenColor]:0)-(a.chosenColor?colorCounts[a.chosenColor]:0);})[0];
    return hand.length===2?{...chosen,declareLastSpark:true}:chosen;
  }
  return legal.find(action=>action.type==='draw')||legal[0];
}
export function startNextColorClashRound`);
fs.writeFileSync(clashPath,clash);

// War: retain every face-up comparison from the latest battle/war chain.
const warPath='src/games/engines/war.js';
let war=fs.readFileSync(warPath,'utf8');
war=war.replace(/function resolveBattle\(state,depth=0\)\{[\s\S]*?\nfunction legalActions/,`function resolveBattle(state,depth=0,reveals=[]){
  const first=drawCard(state.players[0]),second=drawCard(state.players[1]);
  if(!first||!second){if(first)state.pot.push(first);if(second)state.pot.push(second);if(first&&!second)award(state,0);if(second&&!first)award(state,1);return{winner:first?0:second?1:null,warDepth:depth,reveals};}
  state.pot.push(first,second);reveals.push({you:first,opponent:second,depth});
  if(first.value>second.value){award(state,0);return{winner:0,warDepth:depth,reveals};}
  if(second.value>first.value){award(state,1);return{winner:1,warDepth:depth,reveals};}
  const canWar0=state.players[0].deck.length>0,canWar1=state.players[1].deck.length>0;
  if(!canWar0||!canWar1){if(canWar0&&!canWar1)award(state,0);else if(canWar1&&!canWar0)award(state,1);return{winner:canWar0?0:canWar1?1:null,warDepth:depth+1,reveals};}
  const downCount=Math.min(3,Math.max(0,state.players[0].deck.length-1),Math.max(0,state.players[1].deck.length-1));
  for(let i=0;i<downCount;i+=1){const a=drawCard(state.players[0]),b=drawCard(state.players[1]);if(a)state.pot.push(a);if(b)state.pot.push(b);}
  const result=resolveBattle(state,depth+1,reveals);return{...result,warDepth:Math.max(result.warDepth,depth+1),reveals};
}
function legalActions`);
fs.writeFileSync(warPath,war);

// War UI: reveal the last face-up cards that actually decided the battle.
const familyPath='src/components/games/FamilyTable.jsx';
let family=fs.readFileSync(familyPath,'utf8');
family=family.replace(/function WarBoard\(\{state,commit\}\)\{[\s\S]*?\n\nfunction SpeedBoard/,`function WarBoard({state,commit}){
  const result=warEngine.result(state);const last=state.lastBattle?.reveals?.at(-1);
  return <div className="py-4 text-center"><div className="grid grid-cols-2 gap-4"><GlassSurface strength={3} className="rounded-3xl p-4"><p className="text-[9px] uppercase tracking-[.15em] text-white/40">Your deck</p><p className="mt-1 text-2xl font-black text-white">{state.players[0].deck.length}</p></GlassSurface><GlassSurface strength={3} className="rounded-3xl p-4"><p className="text-[9px] uppercase tracking-[.15em] text-white/40">Opponent</p><p className="mt-1 text-2xl font-black text-white">{state.players[1].deck.length}</p></GlassSurface></div><div className="hw-family-center mx-auto my-5 rounded-[2rem] p-5">{last?<div className="flex items-center justify-center gap-5"><div><p className="mb-2 text-[9px] font-black uppercase tracking-[.14em] text-white/40">You</p><PlayingCard card={last.you}/></div><div><Swords size={30} className="mx-auto hw-family-gold"/><p className="mt-2 font-heading text-xl font-black text-white">{state.lastBattle?.warDepth?\`WAR ×\${state.lastBattle.warDepth}\`:'Battle'}</p></div><div><p className="mb-2 text-[9px] font-black uppercase tracking-[.14em] text-white/40">Opponent</p><PlayingCard card={last.opponent}/></div></div>:<><Swords size={34} className="mx-auto hw-family-gold"/><p className="mt-2 font-heading text-2xl font-black text-white">Battle</p></>}<p className="mt-3 text-xs text-white/45">Battle #{state.battleNumber+1}{state.lastBattle?.winner===0?' · You took the pot':state.lastBattle?.winner===1?' · Opponent took the pot':''}</p></div>{!result.complete&&<TactilePressable onClick={()=>commit({type:'battle'})} className="w-full rounded-2xl bg-[hsl(var(--hw-gold))] py-4 text-lg font-black text-[hsl(var(--hw-navy))]">Battle</TactilePressable>}</div>;
}

function SpeedBoard`);
fs.writeFileSync(familyPath,family);

console.log('Final Card Academy gameplay polish applied');
