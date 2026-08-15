const REF = {
  poker: ['WSOP Poker', 'Governor of Poker 3'],
  casino: ['Blackjack by MobilityWare', 'Governor of Poker 3'],
  solitaire: ['Microsoft Solitaire Collection', 'Solitaire Grand Harvest'],
  classics: ['Spades+', 'Gin Rummy Stars'],
  family: ['Crazy Eights by MobilityWare', 'UNO Mobile category conventions'],
};
const THEMES = {
  poker: { accent:'champagne', table:'emerald', energy:'ruby' },
  casino: { accent:'champagne', table:'emerald', energy:'ruby' },
  solitaire: { accent:'royal-blue', table:'deep-teal', energy:'champagne' },
  classics: { accent:'champagne', table:'midnight-teal', energy:'emerald' },
  family: { accent:'spectrum', table:'obsidian', energy:'electric' },
};
const raw = [
['texas-holdem','Texas Hold’em','poker','Advanced'],
['jacks-or-better','Jacks or Better','poker','Beginner'],
['bonus-poker','Bonus Poker','poker','Intermediate'],
['double-bonus-poker','Double Bonus Poker','poker','Intermediate'],
['double-double-bonus-poker','Double Double Bonus Poker','poker','Advanced'],
['deuces-wild','Deuces Wild','poker','Intermediate'],
['joker-poker','Joker Poker','poker','Intermediate'],
['blackjack','Blackjack','casino','Beginner'],
['klondike','Klondike','solitaire','Beginner'],
['spider','Spider','solitaire','Intermediate'],
['freecell','FreeCell','solitaire','Intermediate'],
['tripeaks','TriPeaks','solitaire','Beginner'],
['pyramid','Pyramid','solitaire','Beginner'],
['spades','Spades','classics','Intermediate'],
['hearts','Hearts','classics','Intermediate'],
['gin-rummy','Gin Rummy','classics','Intermediate'],
['crazy-eights','Crazy Eights','family','Beginner'],
['go-fish','Go Fish','family','Beginner'],
['war','War','family','Beginner'],
['speed','Speed','family','Intermediate'],
['color-clash','Color Clash','family','Beginner'],
];
export const CARD_ACADEMY_GAMES = raw.map(([id,title,family,complexity]) => ({
  id,title,family,complexity,fullPlay:true,engineId:id,tutorialId:id,theme:THEMES[family],references:REF[family]
}));
export const CARD_ACADEMY_FAMILIES = ['poker','casino','solitaire','classics','family'];
export function getGame(id){ return CARD_ACADEMY_GAMES.find(game=>game.id===id) || null; }
export function gamesByFamily(family){ return CARD_ACADEMY_GAMES.filter(game=>game.family===family); }
