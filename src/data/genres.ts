import { GenreId } from '../types/game';

export interface GenreInfo {
  id: GenreId;
  name: string;
  description: string;
  image: string;
  iconName: string;
  accentColor: string;
}

export const GENRES: GenreInfo[] = [
  {
    id: 'action',
    name: 'Action',
    description: 'High-octane combat, dynamic movement, and adrenaline-pumping sequences.',
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
    iconName: 'Flame',
    accentColor: 'from-red-600/30 to-amber-600/30 border-red-500/40',
  },
  {
    id: 'adventure',
    name: 'Adventure',
    description: 'Expansive narratives, mysterious ruins, and memorable storytelling.',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    iconName: 'Compass',
    accentColor: 'from-amber-600/30 to-emerald-600/30 border-amber-500/40',
  },
  {
    id: 'rpg',
    name: 'RPG',
    description: 'Deep progression systems, character builds, rich lore, and epic quests.',
    image: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=800&q=80',
    iconName: 'Shield',
    accentColor: 'from-purple-600/30 to-indigo-600/30 border-purple-500/40',
  },
  {
    id: 'fps',
    name: 'FPS',
    description: 'Precision gunplay, tactical squad shooters, and competitive arenas.',
    image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80',
    iconName: 'Crosshair',
    accentColor: 'from-cyan-600/30 to-blue-600/30 border-cyan-500/40',
  },
  {
    id: 'racing',
    name: 'Racing',
    description: 'Hyper-detailed supercars, open world highways, and track mastery.',
    image: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=800&q=80',
    iconName: 'Zap',
    accentColor: 'from-yellow-600/30 to-orange-600/30 border-yellow-500/40',
  },
  {
    id: 'sports',
    name: 'Sports',
    description: 'Authentic physics, world-class stadiums, and championship rivalries.',
    image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80',
    iconName: 'Trophy',
    accentColor: 'from-emerald-600/30 to-teal-600/30 border-emerald-500/40',
  },
  {
    id: 'strategy',
    name: 'Strategy',
    description: 'Turn-based tactics, grand empire building, and tactical warfare.',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    iconName: 'Crown',
    accentColor: 'from-blue-600/30 to-indigo-600/30 border-blue-500/40',
  },
  {
    id: 'horror',
    name: 'Horror',
    description: 'Psychological tension, survival instincts, and atmospheric dread.',
    image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
    iconName: 'Skull',
    accentColor: 'from-rose-900/40 to-slate-900/60 border-rose-700/40',
  },
  {
    id: 'simulation',
    name: 'Simulation',
    description: 'Intricate flight decks, city planning, and lifelike mechanics.',
    image: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=800&q=80',
    iconName: 'Cpu',
    accentColor: 'from-teal-600/30 to-cyan-600/30 border-teal-500/40',
  },
  {
    id: 'puzzle',
    name: 'Puzzle',
    description: 'Mind-bending mechanics, environmental logic, and spatial challenges.',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    iconName: 'HelpCircle',
    accentColor: 'from-violet-600/30 to-purple-600/30 border-violet-500/40',
  },
  {
    id: 'sandbox',
    name: 'Sandbox',
    description: 'Open-ended creativity, physics manipulation, and player-driven freedom.',
    image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80',
    iconName: 'Layers',
    accentColor: 'from-amber-600/30 to-yellow-600/30 border-amber-500/40',
  },
  {
    id: 'survival',
    name: 'Survival',
    description: 'Resource gathering, base building, and perseverance against harsh wilderness.',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    iconName: 'Compass',
    accentColor: 'from-emerald-600/30 to-teal-600/30 border-emerald-500/40',
  },
  {
    id: 'indie',
    name: 'Indie',
    description: 'Passionate vision, unique artistic expression, and innovative gameplay.',
    image: 'https://images.unsplash.com/photo-1551103782-8ab07afd45c1?auto=format&fit=crop&w=800&q=80',
    iconName: 'Sparkles',
    accentColor: 'from-fuchsia-600/30 to-pink-600/30 border-pink-500/40',
  },
];

export const GENRE_MAP: Record<GenreId, GenreInfo> = GENRES.reduce(
  (acc, g) => ({ ...acc, [g.id]: g }),
  {} as Record<GenreId, GenreInfo>
);

export const getGenreName = (genreId: GenreId): string => {
  return GENRE_MAP[genreId]?.name || genreId;
};
