// Deterministic standard 52-card deck engine.
// No AI, no randomness beyond a seedable Fisher-Yates shuffle.

export const RANKS = [
  { rank: "2", value: 2, label: "Two", written: "Two" }, { rank: "3", value: 3, label: "Three", written: "Three" }, { rank: "4", value: 4, label: "Four", written: "Four" }, { rank: "5", value: 5, label: "Five", written: "Five" }, { rank: "6", value: 6, label: "Six", written: "Six" }, { rank: "7", value: 7, label: "Seven", written: "Seven" }, { rank: "8", value: 8, label: "Eight", written: "Eight" }, { rank: "9", value: 9, label: "Nine", written: "Nine" }, { rank: "10", value: 10, label: "Ten", written: "Ten" }, { rank: "J", value: 11, label: "Jack", written: "Jack" }, { rank: "Q", value: 12, label: "Queen", written: "Queen" }, { rank: "K", value: 13, label: "King", written: "King" }, { rank: "A", value: 14, label: "Ace", written: "Ace" },
];
export const SUITS = [
  { suit: "hearts", symbol: "♥", color: "red", name: "Hearts" }, { suit: "diamonds", symbol: "♦", color: "red", name: "Diamonds" }, { suit: "clubs", symbol: "♣", color: "black", name: "Clubs" }, { suit: "spades", symbol: "♠", color: "black", name: "Spades" },
];
export function buildCard(rank, suit) { const r=RANKS.find(x=>x.rank===rank); const s=SUITS.find(x=>x.suit===suit); return { id:`${rank}${suit}`, rank:r.rank, suit:s.suit, value:r.value, displaySymbol:r.rank, suitSymbol:s.symbol, label:`${r.label} of ${s.name}`, writtenRank:r.written, colorCategory:s.color, isRed:s.color==="red", isBlack:s.color==="black" }; }
export function createDeck(){ const cards=[]; for(const s of SUITS) for(const r of RANKS) cards.push(buildCard(r.rank,s.suit)); return cards; }
export function seededRandom(seed){ let a=seed>>>0; return function(){ a|=0; a=(a+0x6d2b79f5)|0; let t=Math.imul(a^(a>>>15),1|a); t=(t+Math.imul(t^(t>>>7),61|t))^t; return ((t^(t>>>14))>>>0)/4294967296; }; }
export function shuffle(cards,rng=Math.random){ const arr=cards.slice(); for(let i=arr.length-1;i>0;i--){ const j=Math.floor(rng()*(i+1)); [arr[i],arr[j]]=[arr[j],arr[i]]; } return arr; }
export class Deck { constructor(seed=null){this.seed=seed;this.reset();} reset(){this.cards=createDeck();this.rng=this.seed!=null?seededRandom(this.seed):Math.random;this.cards=shuffle(this.cards,this.rng);this.drawn=[];} remaining(){return this.cards.length;} draw(n=1){const out=[];for(let i=0;i<n;i++){if(this.cards.length===0)throw new Error("Deck is empty");const c=this.cards.pop();this.drawn.push(c);out.push(c);}return out;} drawSpecific(ids){const out=[];for(const id of ids){const idx=this.cards.findIndex(c=>c.id===id);if(idx===-1){const d=this.drawn.find(c=>c.id===id);if(d)out.push(d);}else{out.push(this.cards.splice(idx,1)[0]);this.drawn.push(out[out.length-1]);}}return out;} }
export function validateDeck(cards){const ids=new Set();if(cards.length!==52)return{ok:false,reason:"Deck must contain 52 cards"};for(const c of cards){if(ids.has(c.id))return{ok:false,reason:`Duplicate card: ${c.id}`};ids.add(c.id);}return{ok:true};}
export function cardEquals(a,b){return a&&b&&a.id===b.id;}
