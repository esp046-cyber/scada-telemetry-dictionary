import type { Term } from './types';
export const escapeHtml = (s: string): string => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));
export function search(terms: Term[], q: string, protocol = 'All', industry = 'All'): Term[] {
  const n = q.trim().toLowerCase();
  return terms.filter(t => (protocol === 'All' || t.protocol === protocol) && (industry === 'All' || t.industry.includes(industry)) &&
    (!n || [t.term, t.summary, t.protocol].some(f => f.toLowerCase().includes(n))));
}
export const suggest = (terms: Term[], q: string): string[] => q.length < 2 ? [] : terms.filter(t => t.term.toLowerCase().startsWith(q.toLowerCase())).map(t => t.term).slice(0, 5);
export const ambient = (h: number): string => h < 6 || h >= 20 ? 'night' : h < 10 ? 'dawn' : h < 17 ? 'day' : 'dusk';
export const toExport = (t: Term): string => `${t.term} (${t.protocol})\n\n${t.summary}\n\nScenario: ${t.scenario}\nIntegration: ${t.integration}\nTroubleshooting: ${t.troubleshooting}\n\nAl Gurg Automation and Controls`;
