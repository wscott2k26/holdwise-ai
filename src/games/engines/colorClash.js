import { seededRandom, shuffle } from '../../lib/cards/deck.js';

const clone=value=>structuredClone(value);
export const COLOR_CLASH_COLORS=['ember','tide','moss','violet'];
const nextSeat=(seat,direction,steps=1)=>(seat+direction*steps+400)%4;

export function createColorClashDeck(){
  const cards=[];let serial=0;const add=(card,count=1)=>{for(let i=0;i<count;i+=1)cards.push({...card,id:`cc-${serial++}-${card.color||'wild'}-${card.symbol}`});};
  for(const color of COLOR_CLASH_COLORS){
    add({color,symbol:'0',number:0,type:'number',name:`${color} zero`,points:0},1);
    for(let n=1;n<=9;n+=1)add({color,symbol:String(n),number:n,type:'number',name:`${color} ${n}`,points:n},2);
    add({color,symbol:'block',type:'block',name:`${color} Block`,points:20},2);
    add({color,symbol:'flip-flow',type:'reverse',name:`${color} Flip Flow`,points:20},2);
    add({color,symbol:'surge-two',type:'draw2',name:`${color} Surge Two`,points:20},2);
  }
  add({color:null,symbol:'color-shift',type:'wild',name:'Color Shift',points:50},4);
  add({color:null,symbol:'prism-four',type:'wild4',name:'Prism Four',points:50},4);
  return cards;
}

export function colorClashPlayable(card,top,currentColor){
  if(!card||!top)return false;if(card.type==='wild'||card.type==='wild4')return true;if(card.color===currentColor)return true;if(card.symbol===top.symbol)return true;if(card.type==='number'&&top.type==='number'&&card.number===top.number)return true;return false;
}
function sortHand(hand){return hand.sort((a,b)=>{const ca=COLOR_CLASH_COLORS.indexOf(a.color),cb=COLOR_CLASH_COLORS.indexOf(b.color);return ca-cb||String(a.symbol).localeCompare(String(b.symbol));});}
function drawCards(state,seat,count){for(let i=0;i<count;i+=1){replenishStock(state);if(!state.stock.length)break;state.players[seat].hand.push(state.stock.pop());}sortHand(state.players[seat].hand);}
function replenishStock(state){if(state.stock.length||state.discard.length<=1)return;const top=state.discard.pop();state.stock=shuffle(state.discard,seededRandom(state.seed+state.roundNumber*173+state.turns));state.discard=[top];}
function openingCard(state){let index=state.stock.length-1;while(index>=0&&['wild','wild4','draw2','block','reverse'].includes(state.stock[index].type))index-=1;if(index<0)index=state.stock.length-1;const [card]=state.stock.splice(index,1);return card;}
function buildRound(base,{roundNumber,startingSeat}){
  const deck=shuffle(createColorClashDeck(),seededRandom(base.seed+roundNumber*7919));const players=Array.from({length:4},(_,seat)=>({seat,name:seat===base.humanSeat?'You':`Player ${seat+1}`,isHuman:seat===base.humanSeat,hand:[]}));for(let r=0;r<7;r+=1)for(let seat=0;seat<4;seat+=1)players[seat].hand.push(deck.pop());players.forEach(p=>sortHand(p.hand));const state={...base,roundNumber,players,stock:deck,discard:[],currentColor:null,direction:1,actor:startingSeat,drawnCardId:null,turns:0,roundComplete:false,matchComplete:false,winners:[],roundResult:null,lastEvent:null};const opener=openingCard(state);state.discard=[opener];state.currentColor=opener.color;return state;
}
function createGame(options={}){const seed=Number(options.seed??1),roundNumber=Number(options.roundNumber??1),startingSeat=Number(options.startingSeat??0);return buildRound({id:'color-clash',seed,humanSeat:Number(options.humanSeat??0),targetScore:Number(options.targetScore??250),scores:[0,0,0,0],roundNumber},{roundNumber,startingSeat});}
function legalActions(state,actor=state.actor){
  if(state.roundComplete||state.matchComplete||actor!==state.actor)return[];const top=state.discard.at(-1),hand=state.players[actor].hand;let playable=hand.filter(card=>colorClashPlayable(card,top,state.currentColor));if(state.drawnCardId)playable=playable.filter(card=>card.id===state.drawnCardId);const actions=[];for(const card of playable){if(card.type==='wild'||card.type==='wild4'){for(const chosenColor of COLOR_CLASH_COLORS)actions.push({type:'play',actor,cardId:card.id,chosenColor,requiresColor:true});}else actions.push({type:'play',actor,cardId:card.id});}if(state.drawnCardId){actions.push({type:'pass-drawn',actor});return actions;}if(!playable.length)actions.push({type:'draw',actor});return actions;
}
function scoreRound(state,winner){const points=state.players.reduce((sum,p,seat)=>seat===winner?sum:sum+p.hand.reduce((s,c)=>s+Number(c.points||0),0),0);state.scores[winner]+=points;state.roundComplete=true;state.roundResult={winner,points,scores:state.scores.slice()};state.matchComplete=state.scores[winner]>=state.targetScore;state.winners=state.matchComplete?[winner]:[];state.actor=null;return state;}
function applyAction(input,action){
  const state=clone(input),actor=Number(action?.actor);if(actor!==state.actor)throw new Error('Illegal Color Clash action: wrong turn');const legal=legalActions(state,actor),type=action?.type;
  if(type==='play'){
    const valid=legal.find(a=>a.type==='play'&&a.cardId===action.cardId&&(a.chosenColor??null)===(action.chosenColor??null));if(!valid)throw new Error('Illegal Color Clash play');const player=state.players[actor],index=player.hand.findIndex(card=>card.id===action.cardId),[played]=player.hand.splice(index,1);state.discard.push(played);state.drawnCardId=null;state.currentColor=(played.type==='wild'||played.type==='wild4')?action.chosenColor:played.color;state.turns+=1;let penalty=false;if(player.hand.length===1&&!action.declareLastSpark){drawCards(state,actor,2);penalty=true;}state.lastEvent={type:'play',actor,cardId:played.id,effect:played.type,lastSparkPenalty:penalty,currentColor:state.currentColor};if(player.hand.length===0)return scoreRound(state,actor);
    if(played.type==='block'){state.actor=nextSeat(actor,state.direction,2);return state;}
    if(played.type==='reverse'){state.direction*=-1;state.actor=nextSeat(actor,state.direction);return state;}
    if(played.type==='draw2'||played.type==='wild4'){const victim=nextSeat(actor,state.direction);drawCards(state,victim,played.type==='draw2'?2:4);state.lastEvent.victim=victim;state.actor=nextSeat(victim,state.direction);return state;}
    state.actor=nextSeat(actor,state.direction);return state;
  }
  if(type==='draw'){
    if(!legal.some(a=>a.type==='draw'))throw new Error('Illegal Color Clash draw');replenishStock(state);if(!state.stock.length){state.actor=nextSeat(actor,state.direction);state.lastEvent={type:'pass',actor};return state;}const drawn=state.stock.pop();state.players[actor].hand.push(drawn);sortHand(state.players[actor].hand);if(colorClashPlayable(drawn,state.discard.at(-1),state.currentColor)){state.drawnCardId=drawn.id;state.lastEvent={type:'draw-playable',actor,cardId:drawn.id};}else{state.actor=nextSeat(actor,state.direction);state.lastEvent={type:'draw-pass',actor,cardId:drawn.id};}return state;
  }
  if(type==='pass-drawn'){
    if(!legal.some(a=>a.type==='pass-drawn'))throw new Error('Illegal Color Clash pass');state.drawnCardId=null;state.actor=nextSeat(actor,state.direction);state.lastEvent={type:'pass-drawn',actor};return state;
  }
  throw new Error(`Unknown Color Clash action: ${type}`);
}
export function chooseColorClashBotAction(state,actor=state.actor){const legal=legalActions(state,actor);if(!legal.length)throw new Error('Color Clash bot has no legal action');const plays=legal.filter(a=>a.type==='play');if(plays.length){const hand=state.players[actor].hand;const colorCounts=Object.fromEntries(COLOR_CLASH_COLORS.map(color=>[color,hand.filter(card=>card.color===color).length]));return plays.slice().sort((a,b)=>{const ca=hand.find(c=>c.id===a.cardId),cb=hand.find(c=>c.id===b.cardId);return Number(cb?.points||0)-Number(ca?.points||0)+(b.chosenColor?colorCounts[b.chosenColor]:0)-(a.chosenColor?colorCounts[a.chosenColor]:0);})[0];}return legal.find(a=>a.type==='draw')||legal[0];}
export function startNextColorClashRound(input){if(!input.roundComplete)throw new Error('Color Clash round not complete');if(input.matchComplete)throw new Error('Color Clash match complete');const base=clone(input),roundNumber=base.roundNumber+1,startingSeat=(roundNumber-1)%4;return buildRound({...base,players:undefined,stock:undefined,discard:undefined},{roundNumber,startingSeat});}
function result(state){return state.roundResult||null;}
function coachFacts(state,actor=state.humanSeat){return[`Score: ${state.scores[actor]} · target ${state.targetScore}.`,`Current color: ${state.currentColor}. Cards in hand: ${state.players[actor].hand.length}.`,`Match color or symbol. Color Shift and Prism Four are wild. Call Last Spark when your play leaves one card or draw a two-card penalty.`];}
export const colorClashEngine={id:'color-clash',createGame,legalActions,applyAction,isTerminal:state=>Boolean(state.matchComplete),result,coachFacts};
export default colorClashEngine;
