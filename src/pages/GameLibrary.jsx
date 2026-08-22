import React, { useMemo, useState } from 'react';
import { BookOpen, Search, SlidersHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PremiumBottomNav from '@/components/premium/PremiumBottomNav';
import SensoryControls from '@/components/premium/SensoryControls';
import { CARD_ACADEMY_FAMILIES, CARD_ACADEMY_GAMES } from '@/games/catalog';

const FAMILY_LABELS = { all:'All', poker:'Poker', casino:'Casino', solitaire:'Solitaire', classics:'Classics', family:'Family' };
const SUITS = { poker:'♠', casino:'♦', solitaire:'♣', classics:'♥', family:'★' };

export default function GameLibrary() {
  const navigate = useNavigate();
  const [query,setQuery] = useState('');
  const [family,setFamily] = useState('all');
  const filtered = useMemo(() => CARD_ACADEMY_GAMES.filter(game => {
    const familyOk = family === 'all' || game.family === family;
    const queryOk = !query.trim() || game.title.toLowerCase().includes(query.trim().toLowerCase());
    return familyOk && queryOk;
  }), [family,query]);

  return <div className="hw-hub-page">
    <main className="mx-auto max-w-6xl px-4 pb-32 pt-[max(1rem,env(safe-area-inset-top))] sm:px-6">
      <div className="mb-5 flex items-end justify-between gap-3"><div><p className="hw-eyebrow">Game library</p><h1 className="hw-page-title">Choose your table</h1><p className="hw-page-subtitle">All 21 HoldWise games are complete-play tables with a guided tutorial.</p></div><SensoryControls/></div>

      <div className="hw-library-toolbar">
        <label className="hw-search-box"><Search size={18}/><input value={query} onChange={event=>setQuery(event.target.value)} placeholder="Search card games" aria-label="Search card games" /></label>
        <div className="hw-filter-icon"><SlidersHorizontal size={18}/></div>
      </div>
      <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
        {['all',...CARD_ACADEMY_FAMILIES].map(item => <button key={item} type="button" onClick={()=>setFamily(item)} className={`hw-filter-chip ${family===item?'hw-filter-chip-active':''}`}>{FAMILY_LABELS[item]}</button>)}
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map(game => <article key={game.id} className={`hw-library-game-card hw-library-${game.family}`}>
          <div className="flex items-start justify-between gap-3"><span className="hw-game-icon">{SUITS[game.family]}</span><span className="hw-difficulty-chip">{game.complexity}</span></div>
          <h2>{game.title}</h2>
          <p>{FAMILY_LABELS[game.family]} · Full play · Coach-enabled</p>
          <div className="mt-5 grid grid-cols-2 gap-2"><button type="button" onClick={()=>navigate(`/game/${game.id}`)} className="hw-card-play">Play</button><button type="button" onClick={()=>navigate(`/game/${game.id}/tutorial`)} className="hw-card-learn"><BookOpen size={15}/> Learn</button></div>
        </article>)}
      </div>
      {!filtered.length && <div className="hw-empty-state">No games match that search yet.</div>}
    </main>
    <PremiumBottomNav />
  </div>;
}
