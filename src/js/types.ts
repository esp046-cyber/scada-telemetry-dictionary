export type Level = 'essential' | 'deep';
export interface Term { id: string; term: string; protocol: string; industry: string[]; level: Level; summary: string; scenario: string; integration: string; troubleshooting: string; category?: string; }
export interface Prefs { dark: boolean; contrast: boolean; focus: boolean; size: number; sound: boolean; deep: boolean; }
export interface State { bookmarks: string[]; recent: string[]; studied: string[]; prefs: Prefs; visits: Record<string, number>; }
