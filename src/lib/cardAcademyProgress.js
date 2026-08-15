export const CARD_ACADEMY_PROGRESS_KEY='holdwise_card_academy_progress_v1';
const empty=()=>({games:{},families:{},recentGames:[],totalXp:0});
function normalized(raw){ return raw&&typeof raw==='object'?{...empty(),...raw,games:{...(raw.games||{})},families:{...(raw.families||{})},recentGames:Array.isArray(raw.recentGames)?raw.recentGames:[]}:empty(); }
export function loadCardAcademyProgress(storage=globalThis.localStorage){ if(!storage)return empty(); try{return normalized(JSON.parse(storage.getItem(CARD_ACADEMY_PROGRESS_KEY)||'null'));}catch{return empty();} }
function save(p,storage){ storage?.setItem(CARD_ACADEMY_PROGRESS_KEY,JSON.stringify(p)); return p; }
function gameRow(p,id){ return p.games[id]||{plays:0,wins:0,tutorialComplete:false,xp:0}; }
function familyRow(p,id){ return p.families[id]||{plays:0,wins:0,tutorials:0,xp:0}; }
function touchRecent(p,id){ p.recentGames=[id,...p.recentGames.filter(x=>x!==id)].slice(0,8); }
export function markTutorialComplete(gameId,{family='other',xp=100}={},storage=globalThis.localStorage,at=new Date().toISOString()){
  const p=loadCardAcademyProgress(storage), g=gameRow(p,gameId), f=familyRow(p,family); const first=!g.tutorialComplete; p.games[gameId]={...g,tutorialComplete:true,tutorialCompletedAt:g.tutorialCompletedAt||at,xp:g.xp+(first?xp:0)}; if(first){f.tutorials+=1;f.xp+=xp;p.totalXp+=xp;} p.families[family]=f; touchRecent(p,gameId); return save(p,storage);
}
export function recordGameResult(gameId,{family='other',won=false,xp=0}={},storage=globalThis.localStorage,at=new Date().toISOString()){
  const p=loadCardAcademyProgress(storage),g=gameRow(p,gameId),f=familyRow(p,family); p.games[gameId]={...g,plays:g.plays+1,wins:g.wins+(won?1:0),xp:g.xp+xp,lastPlayedAt:at}; f.plays+=1;f.wins+=won?1:0;f.xp+=xp;p.families[family]=f;p.totalXp+=xp;touchRecent(p,gameId);return save(p,storage);
}
