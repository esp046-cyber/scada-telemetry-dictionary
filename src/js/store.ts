import type { State } from './types';
const KEY = 'agac-state-v1';
const base: State = { bookmarks: [], recent: [], studied: [], visits: {}, prefs: { dark: false, contrast: false, focus: false, size: 100, sound: false, deep: false } };
export function load(): State {
  try { const raw = localStorage.getItem(KEY); return raw ? { ...base, ...JSON.parse(raw) } : structuredClone(base); } catch { return structuredClone(base); }
}
export function save(s: State): void { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* storage full or blocked */ } }
