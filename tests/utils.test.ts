import { search, suggest, escapeHtml, ambient } from '../src/js/utils';
import terms from '../database/terms.json';
import type { Term } from '../src/js/types';
const T = terms as Term[];
test('search filters by protocol', () => { expect(search(T, '', 'DNP3').every(t => t.protocol === 'DNP3')).toBe(true); });
test('search matches text', () => { expect(search(T, 'unsolicited').length).toBeGreaterThan(0); });
test('suggest is predictive', () => { expect(suggest(T, 'sel')).toContain('Select-Before-Operate (SBO)'); });
test('escapeHtml sanitises', () => { expect(escapeHtml('<script>')).toBe('&lt;script&gt;'); });
test('ambient by hour', () => { expect(ambient(2)).toBe('night'); expect(ambient(12)).toBe('day'); });
test('every term has complete fields', () => { T.forEach(t => ['summary','scenario','troubleshooting'].forEach(k => expect((t as unknown as Record<string,string>)[k].length).toBeGreaterThan(20))); });
const MIN_TERMS = 110; // ratchet up as each batch lands
test('dictionary has at least MIN_TERMS valid terms', () => { expect(T.length).toBeGreaterThanOrEqual(MIN_TERMS); T.forEach(t => { expect(Array.isArray(t.industry) && t.industry.length > 0).toBe(true); expect(['essential','deep']).toContain(t.level); expect(t.term.length).toBeGreaterThan(2); }); });
test('ids are unique', () => { expect(new Set(T.map(t => t.id)).size).toBe(T.length); });
test('no two terms share an explanation', () => { expect(new Set(T.map(t => t.scenario)).size).toBe(T.length); });
test('dataset covers both protocols', () => { expect(new Set(T.map(t => t.protocol))).toEqual(new Set(['DNP3', 'Aveva Telemetry'])); });
