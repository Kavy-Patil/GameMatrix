import { PlatformId } from '../types/game';

export interface PlatformInfo {
  id: PlatformId;
  name: string;
  shortCode: string;
  description: string;
  badgeColor: string;
  iconName: string;
}

export const PLATFORMS: PlatformInfo[] = [
  {
    id: 'steam',
    name: 'Steam',
    shortCode: 'STM',
    description: 'PC client activation keys and digital licenses',
    badgeColor: 'from-blue-500/20 to-indigo-500/20 text-blue-300 border-blue-500/30',
    iconName: 'Gamepad2',
  },
  {
    id: 'epic',
    name: 'Epic Games',
    shortCode: 'EPIC',
    description: 'Direct activation codes for the Epic launcher',
    badgeColor: 'from-slate-500/20 to-zinc-500/20 text-slate-200 border-slate-500/30',
    iconName: 'Layers',
  },
  {
    id: 'rockstar',
    name: 'Rockstar Games',
    shortCode: 'RSG',
    description: 'Rockstar Games Launcher activation passes',
    badgeColor: 'from-amber-500/20 to-yellow-500/20 text-amber-300 border-amber-500/30',
    iconName: 'Star',
  },
  {
    id: 'ea',
    name: 'EA App',
    shortCode: 'EA',
    description: 'EA digital platform licenses and redemption',
    badgeColor: 'from-red-500/20 to-orange-500/20 text-orange-300 border-red-500/30',
    iconName: 'Flame',
  },
  {
    id: 'ubisoft',
    name: 'Ubisoft Connect',
    shortCode: 'UBI',
    description: 'Ubisoft Connect digital edition access keys',
    badgeColor: 'from-sky-500/20 to-cyan-500/20 text-cyan-300 border-sky-500/30',
    iconName: 'Cpu',
  },
  {
    id: 'gog',
    name: 'GOG Galaxy',
    shortCode: 'GOG',
    description: 'DRM-free PC digital releases and Galaxy codes',
    badgeColor: 'from-purple-500/20 to-fuchsia-500/20 text-purple-300 border-purple-500/30',
    iconName: 'Monitor',
  },
  {
    id: 'battlenet',
    name: 'Battle.net',
    shortCode: 'BNET',
    description: 'Battle.net account activation digital codes',
    badgeColor: 'from-blue-600/20 to-cyan-600/20 text-blue-200 border-blue-400/30',
    iconName: 'Shield',
  },
  {
    id: 'other',
    name: 'Other Platforms',
    shortCode: 'OTH',
    description: 'Direct publisher DRM-free and independent clients',
    badgeColor: 'from-emerald-500/20 to-teal-500/20 text-emerald-300 border-emerald-500/30',
    iconName: 'HardDrive',
  },
];

export const PLATFORM_MAP: Record<PlatformId, PlatformInfo> = PLATFORMS.reduce(
  (acc, p) => ({ ...acc, [p.id]: p }),
  {} as Record<PlatformId, PlatformInfo>
);

export const getPlatformName = (platformId: PlatformId): string => {
  return PLATFORM_MAP[platformId]?.name || platformId;
};
